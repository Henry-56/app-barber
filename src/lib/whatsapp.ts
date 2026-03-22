
export async function sendWhatsAppMessage(to: string, templateName: string, parameters: any[] = []) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
        console.error('WhatsApp API credentials missing');
        return { success: false, error: 'Configuración faltante' };
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to.replace(/\D/g, ''), // Clean non-digits
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: 'es', // Primary language
                    },
                    components: parameters.length > 0 ? [
                        {
                            type: 'body',
                            parameters: parameters.map(p => ({
                                type: 'text',
                                text: p,
                            })),
                        }
                    ] : [],
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('WhatsApp API Error:', data);
            return { success: false, error: data.error?.message || 'Error en envío' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('WhatsApp Fetch Error:', error);
        return { success: false, error: 'Error de red' };
    }
}
