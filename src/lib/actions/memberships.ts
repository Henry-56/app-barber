'use server';

import { db } from '@/lib/db';
import { membershipPlans, customerMemberships, customers, sales, barbers } from '@/lib/db/schema';
import { desc, eq, gte, lte, and, gt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getMembershipPlans() {
    try {
        return await db.query.membershipPlans.findMany({
            orderBy: [desc(membershipPlans.createdAt)],
        });
    } catch (error) {
        console.error('Error fetching membership plans:', error);
        return [];
    }
}

export async function createMembershipPlan(data: {
    name: string;
    price: number;
    benefits?: string;
    config: string; // JSON string: {"corte": 4, "facial": 1}
}) {
    try {
        await db.insert(membershipPlans).values({
            name: data.name,
            price: data.price.toString(),
            benefits: data.benefits,
            config: data.config,
        });

        revalidatePath('/membresias');
        return { success: true };
    } catch (error) {
        console.error('Error creating membership plan:', error);
        return { success: false, error: 'No se pudo crear el plan' };
    }
}

export async function subscribeCustomer(data: {
    customerId: string;
    planId: string;
    months: number;
    paymentMethod: 'efectivo' | 'yape' | 'plin' | 'tarjeta';
}) {
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + data.months);

        const plan = await db.query.membershipPlans.findFirst({
            where: eq(membershipPlans.id, data.planId)
        });

        if (!plan) return { success: false, error: 'Plan no encontrado' };

        // 1. Crear suscripción
        await db.insert(customerMemberships).values({
            customerId: data.customerId,
            planId: data.planId,
            startDate,
            endDate,
            benefits: plan.config,
            status: 'active',
        });

        // 2. Registrar venta (Comisión 0 para membresías)
        await db.insert(sales).values({
            customerId: data.customerId,
            membershipPlanId: data.planId,
            amountPaid: plan.price,
            commissionAmount: '0.00',
            paymentMethod: data.paymentMethod,
            usedMembership: false,
        });

        revalidatePath('/membresias');
        revalidatePath('/clientes');
        revalidatePath('/ventas');
        revalidatePath('/');
        
        return { success: true };
    } catch (error) {
        console.error('Error subscribing customer:', error);
        return { success: false, error: 'No se pudo activar la membresía' };
    }
}

export async function getActiveSubscriptions() {
    try {
        return await db.query.customerMemberships.findMany({
            with: {
                customer: true,
                plan: true,
            },
            orderBy: [desc(customerMemberships.createdAt)],
            limit: 50, // Added a reasonable limit
        });
    } catch (error) {
        console.error('Error fetching active subscriptions:', error);
        return [];
    }
}
export async function getCustomerActiveMembership(customerId: string) {
    try {
        const result = await db.query.customerMemberships.findFirst({
            where: and(
                eq(customerMemberships.customerId, customerId),
                eq(customerMemberships.status, 'active')
            ),
            with: {
                plan: true
            }
        });
        return result;
    } catch (error) {
        console.error('Error fetching active membership for customer:', error);
        return null;
    }
}
