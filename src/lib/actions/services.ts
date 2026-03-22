'use server';

import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getServices() {
    try {
        return await db.query.services.findMany({
            orderBy: [desc(services.createdAt)],
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

export async function createService(data: {
    name: string;
    price: number;
    category?: string;
    durationMinutes?: number;
}) {
    try {
        await db.insert(services).values({
            name: data.name,
            price: data.price.toString(),
            category: data.category || 'corte',
            durationMinutes: data.durationMinutes || 30,
        });

        revalidatePath('/servicios');
        return { success: true };
    } catch (error) {
        console.error('Error creating service:', error);
        return { success: false, error: 'No se pudo crear el servicio' };
    }
}

export async function updateService(id: string, data: Partial<typeof services.$inferInsert>) {
    try {
        await db.update(services)
            .set(data)
            .where(eq(services.id, id));

        revalidatePath('/servicios');
        return { success: true };
    } catch (error) {
        console.error('Error updating service:', error);
        return { success: false, error: 'No se pudo actualizar el servicio' };
    }
}
