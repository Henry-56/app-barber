import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';

export async function getAvailableSlots(date: Date) {
    // 1. Validar que sea Lunes a Sábados (0=Domingo, 6=Sábado)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return []; // No atendemos Domingos

    // 2. Definimos el horario de atención (9:00 AM - 7:00 PM)
    const startHour = 9;
    const endHour = 19;
    const slotDuration = 30; // Minutos

    // Inicio y fin del día para la consulta
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfRange = new Date(date);
    endOfRange.setHours(23, 59, 59, 999);

    // Obtener citas existentes para ese día
    const existingAppointments = await db.query.appointments.findMany({
        where: and(
            gte(appointments.appointmentTime, startOfDay),
            lte(appointments.appointmentTime, endOfRange)
        )
    });

    const bookedTimes = existingAppointments.map(app => 
        app.appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    );

    const availableSlots: string[] = [];

    // Si es hoy, no mostrar horas del pasado
    const now = new Date();
    const isToday = startOfDay.toDateString() === now.toDateString();

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Si es hoy, filtrar slots pasados
            if (isToday) {
                const [h, m] = timeString.split(':').map(Number);
                if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) {
                    continue;
                }
            }

            if (!bookedTimes.includes(timeString)) {
                availableSlots.push(timeString);
            }
        }
    }

    return availableSlots;
}
