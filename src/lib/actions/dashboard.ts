'use server';

import { db } from '@/lib/db';
import { sales, appointments, services, barbers } from '@/lib/db/schema';
import { sql, gte, eq, desc, and } from 'drizzle-orm';

export async function getDashboardMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
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

        // 2. Servicio más vendido de hoy (o histórico si hoy no hay)
        const topServiceResult = await db.select({
            serviceId: sales.serviceId,
            count: sql`count(*)`.mapWith(Number),
        })
            .from(sales)
            .groupBy(sales.serviceId)
            .orderBy(desc(sql`count(*)`))
            .limit(1);

        let topServiceName = 'N/A';
        if (topServiceResult.length > 0 && topServiceResult[0].serviceId) {
            const topService = await db.select({ name: services.name })
                .from(services)
                .where(eq(services.id, topServiceResult[0].serviceId))
                .limit(1);
            if (topService.length > 0) topServiceName = topService[0].name;
        }

        // 3. Citas pendientes para hoy
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const pendingAppointments = await db.select({
            count: sql`count(*)`.mapWith(Number),
        })
            .from(appointments)
            .where(and(
                gte(appointments.appointmentTime, today),
                eq(appointments.status, 'scheduled')
            ));

        // 4. Rendimiento de Barberos (Histórico o del mes)
        const barberPerformance = await db.select({
            barberId: sales.barberId,
            barberName: barbers.name,
            serviceCount: sql`count(*)`.mapWith(Number),
            totalRevenue: sql`sum(${sales.amountPaid})`.mapWith(Number),
        })
            .from(sales)
            .innerJoin(barbers, eq(sales.barberId, barbers.id))
            .groupBy(sales.barberId, barbers.name)
            .orderBy(desc(sql`sum(${sales.amountPaid})`))
            .limit(5);
        
        return {
            todayIncome: (serviceStats.totalIncome + membershipStats.totalIncome) - (serviceStats.totalCommissions + membershipStats.totalCommissions),
            todayServicesNet: serviceStats.totalIncome - serviceStats.totalCommissions,
            todayMembershipsIncome: membershipStats.totalIncome,
            todayCommissions: serviceStats.totalCommissions + membershipStats.totalCommissions,
            todayCuts: serviceStats.count,
            topService: topServiceName,
            pendingAppointments: pendingAppointments[0]?.count || 0,
            barberPerformance: barberPerformance.map(b => ({
                name: b.barberName,
                services: b.serviceCount,
                amount: b.totalRevenue
            }))
        };

    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        return {
            todayIncome: 0,
            todayCuts: 0,
            topService: 'Error',
            pendingAppointments: 0,
            barberPerformance: []
        };
    }
}
