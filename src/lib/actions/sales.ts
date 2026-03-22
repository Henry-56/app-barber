'use server';

import { db } from '@/lib/db';
import { sales, customers, customerMemberships, services, barbers } from '@/lib/db/schema';
import { eq, sql, and, gt, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createSale(data: {
    customerId?: string;
    barberId?: string;
    serviceId: string;
    amountPaid: number;
    paymentMethod: 'efectivo' | 'yape' | 'plin' | 'tarjeta';
    membershipId?: string;
}) {
    try {
        let commissionAmount = '0.00';
        
        if (data.barberId) {
            const [barber, serviceData] = await Promise.all([
                db.query.barbers.findFirst({
                    where: eq(barbers.id, data.barberId)
                }),
                db.query.services.findFirst({
                    where: eq(services.id, data.serviceId)
                })
            ]);

            if (barber) {
                const rate = parseFloat(barber.commissionRate.toString());
                // La comisión siempre se basa en el precio del servicio, no en lo pagado (importante para membresías)
                const basePrice = serviceData ? parseFloat(serviceData.price.toString()) : data.amountPaid;
                const calc = basePrice * (rate / 100);
                commissionAmount = calc.toFixed(2);
            }
        }

        const saleResult = await db.insert(sales).values({
            customerId: data.customerId,
            barberId: data.barberId,
            serviceId: data.serviceId,
            amountPaid: data.amountPaid.toString(),
            commissionAmount: commissionAmount,
            paymentMethod: data.paymentMethod,
            usedMembership: !!data.membershipId,
        }).returning();

        // Si se usa membresía, descontar beneficio específico según la categoría del servicio
        if (data.membershipId) {
            console.log('>>> Procesando descuento de membresía:', data.membershipId);
            
            const [membership, serviceData] = await Promise.all([
                db.query.customerMemberships.findFirst({
                    where: eq(customerMemberships.id, data.membershipId)
                }),
                db.query.services.findFirst({
                    where: eq(services.id, data.serviceId)
                })
            ]);

            if (membership && membership.benefits) {
                try {
                    const rawBenefits = membership.benefits;
                    let benefits: Record<string, number> = {};

                    // Manejar tanto JSON como formato legado (número)
                    const parsed = JSON.parse(rawBenefits);
                    if (typeof parsed === 'object' && parsed !== null) {
                        benefits = parsed;
                    } else if (typeof parsed === 'number') {
                        benefits = { corte: parsed };
                    }

                    const category = serviceData?.category || 'corte';
                    console.log(`>>> Categoría detectada: ${category}. Beneficios antes:`, benefits);

                    if ((benefits[category] || 0) > 0) {
                        benefits[category] -= 1;
                        
                        // Actualizar estado si todos los beneficios llegaron a 0
                        const totalRemaining = Object.values(benefits).reduce((acc, val) => acc + (val as number), 0);
                        
                        await db.update(customerMemberships)
                            .set({
                                benefits: JSON.stringify(benefits),
                                status: totalRemaining === 0 ? 'expired' as any : 'active'
                            })
                            .where(eq(customerMemberships.id, data.membershipId));
                        
                        console.log('>>> Registro actualizado. Beneficios después:', benefits);
                    } else {
                        console.log('>>> No hay beneficios suficientes para la categoría:', category);
                    }
                } catch (e) {
                    console.error('Error parsing benefits in createSale:', e);
                }
            } else {
                console.log('>>> Membresía no encontrada o sin beneficios definidos');
            }
        }

        // Actualizar historial del cliente si existe
        if (data.customerId) {
            await db.update(customers)
                .set({
                    visitCount: sql`${customers.visitCount} + 1`,
                    lastVisit: new Date(),
                })
                .where(eq(customers.id, data.customerId));
        }

        revalidatePath('/');
        revalidatePath('/ventas');
        revalidatePath('/clientes');
        revalidatePath('/membresias');

        return { success: true, data: saleResult[0] };
    } catch (error) {
        console.error('Error creating sale:', error);
        return { success: false, error: 'No se pudo registrar la venta' };
    }
}

export async function getRecentSales(page = 1, pageSize = 5) {
    try {
        const offset = (page - 1) * pageSize;

        const data = await db.query.sales.findMany({
            limit: pageSize,
            offset: offset,
            orderBy: (sales, { desc }) => [desc(sales.createdAt)],
            with: {
                customer: true,
                barber: true,
                service: true,
                membershipPlan: true,
            }
        });

        // Calcular totales de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayMetrics = await db.select({
            type: sql<string>`CASE WHEN ${sales.serviceId} IS NOT NULL THEN 'service' ELSE 'membership' END`,
            totalIncome: sql`sum(${sales.amountPaid})`.mapWith(Number),
            totalCommissions: sql`sum(${sales.commissionAmount})`.mapWith(Number),
            count: sql`count(*)`.mapWith(Number),
        })
            .from(sales)
            .where(gte(sales.createdAt, today))
            .groupBy(sql`CASE WHEN ${sales.serviceId} IS NOT NULL THEN 'service' ELSE 'membership' END`);

        const serviceStats = todayMetrics.find(m => m.type === 'service') || { totalIncome: 0, totalCommissions: 0, count: 0 };
        const membershipStats = todayMetrics.find(m => m.type === 'membership') || { totalIncome: 0, totalCommissions: 0, count: 0 };

        const totalResult = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(sales);
        const totalCount = totalResult[0].count;

        return {
            sales: data,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            todayTotalIncome: (serviceStats.totalIncome + membershipStats.totalIncome) - (serviceStats.totalCommissions + membershipStats.totalCommissions),
            todayServicesNet: serviceStats.totalIncome - serviceStats.totalCommissions,
            todayMembershipsIncome: membershipStats.totalIncome,
            todayCommissions: serviceStats.totalCommissions + membershipStats.totalCommissions,
            todayTotalCount: serviceStats.count,
        };
    } catch (error) {
        console.error('Error fetching recent sales:', error);
        return { sales: [], totalCount: 0, totalPages: 0 };
    }
}
