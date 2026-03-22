import { NextResponse } from 'next/server';
import { sendWhatsAppText, sendWhatsAppButtons } from '@/lib/whatsapp';
import { getAvailableSlots } from '@/lib/actions/availability';

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
            const recipientPhoneId = metadata?.phone_number_id; // Este es el ID dinámico
            
            if (!message) {
                console.log('No message found in payload changes.');
                return NextResponse.json({ status: 'ok' });
            }

            const sender = message.from;
            console.log(`Message from ${sender} using ID ${recipientPhoneId}`);

            // 1. Manejar Mensajes de Texto
            if (message.type === 'text') {
                const text = message.text.body.toLowerCase();
                console.log(`Text Body: ${text}`);

                if (text.includes('hola') || text.includes('cita') || text.includes('agendar')) {
                    console.log('Intent match: Booking');
                    const slots = await getAvailableSlots(new Date());
                    const topSlots = slots.slice(0, 3); 

                    if (topSlots.length > 0) {
                        console.log(`Sending ${topSlots.length} slots...`);
                        await sendWhatsAppButtons(
                            sender,
                            '¡Hola! Soy el asistente de BarberPro. Tenemos estos horarios hoy. ¿Cuál prefieres?',
                            topSlots.map(s => ({ id: `slot_${s}`, title: s })),
                            recipientPhoneId
                        );
                    } else {
                        await sendWhatsAppText(sender, 'Lo siento, no tenenos más citas disponibles por hoy. ¡Prueba mañana!', recipientPhoneId);
                    }
                } else {
                    console.log('Intent mismatch. Sending fallback message.');
                    await sendWhatsAppText(sender, '¡Hola! Escribe "cita" para ver los horarios disponibles o ven a visitarnos directamente.', recipientPhoneId);
                }
            }

            // 2. Manejar Clics en Botones (Interactive)
            if (message.type === 'interactive') {
                const responseId = message.interactive.button_reply?.id;
                console.log(`Interactive Reply ID: ${responseId}`);
                
                if (responseId?.startsWith('slot_')) {
                    const time = responseId.replace('slot_', '');
                    await sendWhatsAppText(sender, `¡Excelente! He anotado tu interés para las ${time}. Favor de confirmar asistiendo 5 min antes.`, recipientPhoneId);
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
