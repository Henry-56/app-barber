import { NextResponse } from 'next/server';
import { sendWhatsAppText, sendWhatsAppButtons } from '@/lib/whatsapp';
import { getAvailableSlots } from '@/lib/actions/availability';
import { getBotSession, upsertBotSession, clearBotSession } from '@/lib/actions/bot-sessions';
import { db } from '@/lib/db';
import { appointments, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log('✅ WEBHOOK_VERIFIED');
            return new Response(challenge, { status: 200 });
        } else {
            return new Response('Forbidden', { status: 403 });
        }
    }
    return new Response('Bad Request', { status: 400 });
}

export async function POST(request: Request) {
    console.log('--- INCOMING WEBHOOK START ---');
    try {
        const body = await request.json();
        console.log('Payload:', JSON.stringify(body));

        if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value) {
            const value = body.entry[0].changes[0].value;
            const message = value.messages?.[0];
            const metadata = value.metadata;
            const recipientPhoneId = metadata?.phone_number_id; 
            
            if (!message) return NextResponse.json({ status: 'ok' });

            const sender = message.from;
            const session = await getBotSession(sender);
            let state = session?.state || 'INITIAL';

            console.log(`User ${sender} in current state: ${state}`);

            // 1. Manejar Mensajes de Texto
            if (message.type === 'text') {
                const text = message.text.body.trim().toLowerCase();

                // Comando de RESET universal
                if (text === 'hola' || text === 'reiniciar' || text === 'inicio') {
                    console.log('Resetting session for user');
                    await clearBotSession(sender);
                    state = 'INITIAL';
                    // Continuamos para procesarlo como INITIAL abajo
                }

                if (state === 'INITIAL') {
                    console.log('Bot state INITIAL: Greeting user');
                    await sendWhatsAppText(sender, '¡Hola! Bienvenido a BarberPro. 💈 ¿Cómo te llamas para poder agendarte?', recipientPhoneId);
                    await upsertBotSession(sender, 'AWAITING_NAME');
                    return NextResponse.json({ status: 'ok' });
                }

                if (state === 'AWAITING_NAME') {
                    const name = message.text.body.trim();
                    console.log(`Bot state AWAITING_NAME: Got name ${name}`);
                    const days = getNextThreeDays();
                    console.log('Generating days for buttons:', JSON.stringify(days));
                    
                    await upsertBotSession(sender, 'AWAITING_DAY', { name });
                    await sendWhatsAppButtons(
                        sender,
                        `¡Gusto en conocerte, ${name}! ¿Qué día te gustaría venir?`,
                        days.map(d => ({ id: `day_${d.iso}`, title: d.label })),
                        recipientPhoneId
                    );
                    return NextResponse.json({ status: 'ok' });
                }
            }

            // 2. Manejar Clics en Botones (Interactive)
            if (message.type === 'interactive') {
                const responseId = message.interactive.button_reply?.id;
                console.log(`Interactive Reply ID: ${responseId}`);

                // Selección de DÍA
                if (state === 'AWAITING_DAY' && responseId?.startsWith('day_')) {
                    const selectedDay = responseId.replace('day_', '');
                    const slots = await getAvailableSlots(new Date(selectedDay));
                    const topSlots = slots.slice(0, 3); // Limitamos a 3 por simplicidad de botones

                    if (topSlots.length > 0) {
                        await upsertBotSession(sender, 'AWAITING_SLOT', { day: selectedDay });
                        await sendWhatsAppButtons(
                            sender,
                            `Perfecto. Tengo estos horarios para el ${selectedDay}. ¿Cuál prefieres?`,
                            topSlots.map(s => ({ id: `slot_${s}`, title: s })),
                            recipientPhoneId
                        );
                    } else {
                        await sendWhatsAppText(sender, 'Lo siento, no hay más citas para ese día. Prueba con otro.', recipientPhoneId);
                    }
                    return NextResponse.json({ status: 'ok' });
                }

                // Selección de HORA (Finalización)
                if (state === 'AWAITING_SLOT' && responseId?.startsWith('slot_')) {
                    const time = responseId.replace('slot_', '');
                    const name = (session?.data as any).name;
                    const day = (session?.data as any).day;

                    // Crear Cita y posiblemente Cliente
                    await finalizeBooking(sender, name, day, time);
                    await sendWhatsAppText(sender, `¡Listo, ${name}! Tu cita ha sido agendada para el ${day} a las ${time}. ¡Te esperamos!`, recipientPhoneId);
                    await clearBotSession(sender);
                    return NextResponse.json({ status: 'ok' });
                }
            }
        }

        console.log('--- INCOMING WEBHOOK END ---');
        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('❌ Webhook Processing Error:', error.message || error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// Helpers
function getNextThreeDays() {
    const days = [];
    const now = new Date();
    let count = 0;
    let offset = 0;

    while (count < 3 && offset < 7) {
        const d = new Date(now);
        d.setDate(now.getDate() + offset);
        
        // Saltar domingos
        if (d.getDay() !== 0) {
            const isToday = d.toDateString() === now.toDateString();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const isTomorrow = d.toDateString() === tomorrow.toDateString();

            days.push({
                iso: d.toISOString().split('T')[0],
                label: isToday ? 'Hoy' : isTomorrow ? 'Mañana' : d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
            });
            count++;
        }
        offset++;
    }
    return days;
}

async function finalizeBooking(phone: string, name: string, day: string, time: string) {
    // 1. Buscar o crear cliente
    let customer = await db.query.customers.findFirst({
        where: eq(customers.phone, phone)
    });

    if (!customer) {
        const [newCustomer] = await db.insert(customers).values({
            name,
            phone,
        }).returning();
        customer = newCustomer;
    }

    // 2. Crear cita
    const appointmentTime = new Date(`${day}T${time}:00`);
    // Buscamos un barbero y servicio por defecto si no existen (como fallback)
    const barber = await db.query.barbers.findFirst();
    const service = await db.query.services.findFirst();

    await db.insert(appointments).values({
        customerId: customer.id,
        barberId: barber?.id || '',
        serviceId: service?.id || '',
        appointmentTime,
        status: 'scheduled'
    });
}
