import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';

export async function getAvailableSlots(date: Date) {
    // Definimos el horario de atención (9:00 AM - 7:00 PM)
    const startHour = 9;
    const endHour = 19;
    const slotDuration = 30; // Minutos

    // Inicio y fin del día para la consulta
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener citas existentes para ese día
    const existingAppointments = await db.query.appointments.findMany({
        where: and(
            gte(appointments.appointmentTime, startOfDay),
            lte(appointments.appointmentTime, endOfDay)
        )
    });

    const bookedTimes = existingAppointments.map(app => 
        app.appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    );

    const availableSlots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            if (!bookedTimes.includes(timeString)) {
                availableSlots.push(timeString);
            }
        }
    }

    return availableSlots;
}
