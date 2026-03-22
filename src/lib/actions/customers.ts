'use server';

import { db } from '@/lib/db';
import { customers } from '@/lib/db/schema';
import { desc, eq, like, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCustomers(query?: string) {
    try {
        if (query) {
            return await db.query.customers.findMany({
                where: like(customers.dni, `%${query}%`),
                orderBy: [desc(customers.createdAt)],
            });
        }
        return await db.query.customers.findMany({
            orderBy: [desc(customers.createdAt)],
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

export async function createCustomer(data: {
    name: string;
    dni?: string;
    phone?: string;
    birthday?: Date;
    notes?: string;
}) {
    try {
        const result = await db.insert(customers).values({
            name: data.name,
            dni: data.dni,
            phone: data.phone,
            birthday: data.birthday,
            notes: data.notes,
        }).returning();

        revalidatePath('/clientes');
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Error creating customer:', error);
        return { success: false, error: 'No se pudo registrar el cliente' };
    }
}

export async function getCustomerByDni(dni: string) {
    try {
        const result = await db.query.customers.findFirst({
            where: eq(customers.dni, dni),
        });
        return result || null;
    } catch (error) {
        console.error('Error fetching customer by DNI:', error);
        return null;
    }
}

export async function updateCustomer(id: string, data: Partial<typeof customers.$inferInsert>) {
    try {
        await db.update(customers)
            .set(data)
            .where(eq(customers.id, id));

        revalidatePath('/clientes');
        return { success: true };
    } catch (error) {
        console.error('Error updating customer:', error);
        return { success: false, error: 'No se pudo actualizar el cliente' };
    }
}
