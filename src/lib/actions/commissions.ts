'use server';

import { db } from '@/lib/db';
import { sales, barbers } from '@/lib/db/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';

export async function getCommissionsReport(startDate: Date, endDate: Date, page = 1, pageSize = 10) {
    try {
        const offset = (page - 1) * pageSize;

        // Obtener data por barbero (para la tabla)
        const reportData = await db.select({
            barberName: barbers.name,
            totalSales: sql`count(${sales.id})`.mapWith(Number),
            totalAmount: sql`sum(${sales.amountPaid})`.mapWith(Number),
            commissionRate: barbers.commissionRate,
            totalCommission: sql`sum(COALESCE(NULLIF(${sales.commissionAmount}, '0.00'), ${sales.amountPaid} * ${barbers.commissionRate} / 100))`.mapWith(Number),
        })
            .from(barbers)
            .leftJoin(sales, and(
                eq(sales.barberId, barbers.id),
                gte(sales.createdAt, startDate),
                lte(sales.createdAt, endDate)
            ))
            .groupBy(barbers.id, barbers.name, barbers.commissionRate)
            .limit(pageSize)
            .offset(offset);

        // Obtener totales globales y desglosados (Servicios vs Membresías)
        const breakdown = await db.select({
            grossServices: sql`sum(CASE WHEN ${sales.serviceId} IS NOT NULL THEN ${sales.amountPaid} ELSE 0 END)`.mapWith(Number),
            grossMemberships: sql`sum(CASE WHEN ${sales.membershipPlanId} IS NOT NULL THEN ${sales.amountPaid} ELSE 0 END)`.mapWith(Number),
            totalCommissions: sql`sum(COALESCE(NULLIF(${sales.commissionAmount}, '0.00'), CASE WHEN ${sales.serviceId} IS NOT NULL THEN ${sales.amountPaid} * ${barbers.commissionRate} / 100 ELSE 0 END))`.mapWith(Number),
        })
            .from(sales)
            .leftJoin(barbers, eq(sales.barberId, barbers.id))
            .where(and(
                gte(sales.createdAt, startDate),
                lte(sales.createdAt, endDate)
            ));

        const totals = breakdown[0] || { grossServices: 0, grossMemberships: 0, totalCommissions: 0 };

        // Total barberos para paginación
        const totalResult = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(barbers);

        return {
            data: reportData,
            totals: {
                grossServices: totals.grossServices || 0,
                membershipsIncome: totals.grossMemberships || 0,
                totalCommission: totals.totalCommissions || 0,
                totalNet: (totals.grossServices + totals.grossMemberships) - totals.totalCommissions,
            },
            totalCount: totalResult[0].count,
            totalPages: Math.ceil(totalResult[0].count / pageSize)
        };
    } catch (error) {
        console.error('Error fetching commissions report:', error);
        return { data: [], totalCount: 0, totalPages: 0 };
    }
}
