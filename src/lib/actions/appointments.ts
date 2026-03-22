'use server';

import { db } from '@/lib/db';
import { appointments, customers } from '@/lib/db/schema';
import { eq, and, gte, lte, or, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createAppointment(data: {
    customerId: string;
    barberId: string;
    serviceId: string;
    appointmentTime: Date;
}) {
    try {
        await db.insert(appointments).values({
            customerId: data.customerId,
            barberId: data.barberId,
            serviceId: data.serviceId,
            appointmentTime: data.appointmentTime,
            status: 'scheduled',
        }).returning();

        // Enviar notificación de WhatsApp (Async - no bloquea la respuesta)
        try {
            const customer = await db.query.customers.findFirst({
                where: eq(customers.id, data.customerId)
            });

            if (customer?.phone) {
                const { sendWhatsAppMessage } = await import('@/lib/whatsapp');
                // IMPORTANTE: Meta requiere una plantilla aprobada. 
                // Usamos 'hello_world' como prueba inicial o el nombre que el usuario defina.
                await sendWhatsAppMessage(
                    customer.phone, 
                    'hello_world', // Plantilla por defecto de prueba
                    []
                );
            }
        } catch (wsError) {
            console.error('Error enviando notificación WhatsApp:', wsError);
        }

        revalidatePath('/');
        revalidatePath('/agenda');
        return { success: true };
    } catch (error) {
        console.error('Error creating appointment:', error);
        return { success: false, error: 'No se pudo agendar la cita' };
    }
}

export async function getAppointments(startDate: Date, endDate: Date) {
    try {
        return await db.query.appointments.findMany({
            where: and(
                gte(appointments.appointmentTime, startDate),
                lte(appointments.appointmentTime, endDate)
            ),
            with: {
                customer: true,
                barber: true,
                service: true,
            },
            orderBy: [desc(appointments.appointmentTime)],
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
}

export async function updateAppointmentStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled') {
    try {
        await db.update(appointments)
            .set({ status })
            .where(eq(appointments.id, id));

        revalidatePath('/agenda');
        return { success: true };
    } catch (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: 'No se pudo actualizar la cita' };
    }
}
