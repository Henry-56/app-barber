import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return new Response(challenge, { status: 200 });
        } else {
            return new Response('Forbidden', { status: 403 });
        }
    }
    return new Response('Bad Request', { status: 400 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Verificar si es un mensaje de WhatsApp
        if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value) {
            const value = body.entry[0].changes[0].value;
            const message = value.messages?.[0];
            
            if (!message) return NextResponse.json({ status: 'ok' });

            const sender = message.from;
            const { sendWhatsAppText, sendWhatsAppButtons } = await import('@/lib/whatsapp');
            const { getAvailableSlots } = await import('@/lib/actions/availability');

            // 1. Manejar Mensajes de Texto
            if (message.type === 'text') {
                const text = message.text.body.toLowerCase();

                if (text.includes('hola') || text.includes('cita') || text.includes('agendar')) {
                    const slots = await getAvailableSlots(new Date());
                    const topSlots = slots.slice(0, 3); // Mostrar solo los primeros 3 para no saturar

                    if (topSlots.length > 0) {
                        await sendWhatsAppButtons(
                            sender,
                            '¡Hola! Tenemos estos horarios disponibles para hoy. ¿Cuál prefieres?',
                            topSlots.map(s => ({ id: `slot_${s}`, title: s }))
                        );
                    } else {
                        await sendWhatsAppText(sender, 'Lo siento, no tenenos más citas disponibles por hoy. ¡Prueba mañana!');
                    }
                }
            }

            // 2. Manejar Clics en Botones (Interactive)
            if (message.type === 'interactive') {
                const responseId = message.interactive.button_reply.id;
                
                if (responseId.startsWith('slot_')) {
                    const time = responseId.replace('slot_', '');
                    // Aquí podrías llamar a createAppointment automáticamente si ya conoces al cliente
                    await sendWhatsAppText(sender, `¡Excelente! He pre-agendado tu cita para las ${time}. Favor de confirmar asistiendo 5 min antes.`);
                }
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
