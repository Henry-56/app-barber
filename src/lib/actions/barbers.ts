'use server';

import { db } from '@/lib/db';
import { barbers } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getBarbers() {
    try {
        return await db.query.barbers.findMany({
            with: {
                sales: true
            },
            orderBy: [desc(barbers.createdAt)],
        });
    } catch (error) {
        console.error('Error fetching barbers:', error);
        return [];
    }
}

export async function createBarber(data: {
    name: string;
    commissionRate: number;
}) {
    try {
        await db.insert(barbers).values({
            name: data.name,
            commissionRate: data.commissionRate.toString(),
            status: 'active',
        });

        revalidatePath('/barberos');
        return { success: true };
    } catch (error) {
        console.error('Error creating barber:', error);
        return { success: false, error: 'No se pudo registrar el barbero' };
    }
}

export async function updateBarber(id: string, data: Partial<typeof barbers.$inferInsert>) {
    try {
        await db.update(barbers)
            .set(data)
            .where(eq(barbers.id, id));

        revalidatePath('/barberos');
        return { success: true };
    } catch (error) {
        console.error('Error updating barber:', error);
        return { success: false, error: 'No se pudo actualizar el barbero' };
    }
}
