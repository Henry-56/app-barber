
export async function sendWhatsAppMessage(to: string, templateName: string, languageCode: string = 'es', phoneIdOverride?: string) {
    const phoneId = phoneIdOverride || process.env.WHATSAPP_PHONE_ID;
    const accessToken = process.env.WHATSAPP_TOKEN;

    if (!phoneId || !accessToken) {
        console.error('Missing WhatsApp credentials');
        return;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to.replace(/\D/g, ''),
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                },
            }),
        });

        const data = await response.json();
        console.log('WhatsApp API Response (Template):', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
}

export async function sendWhatsAppText(to: string, text: string, phoneIdOverride?: string) {
    const phoneId = phoneIdOverride || process.env.WHATSAPP_PHONE_ID;
    const accessToken = process.env.WHATSAPP_TOKEN;

    if (!phoneId || !accessToken) {
        console.error('Missing WhatsApp credentials');
        return;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to.replace(/\D/g, ''),
                type: 'text',
                text: { body: text },
            }),
        });
        const data = await response.json();
        console.log('WhatsApp API Response (Text):', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error sending WhatsApp text:', error);
    }
}

export async function sendWhatsAppButtons(to: string, text: string, buttons: { id: string, title: string }[], phoneIdOverride?: string) {
    const phoneId = phoneIdOverride || process.env.WHATSAPP_PHONE_ID;
    const accessToken = process.env.WHATSAPP_TOKEN;

    if (!phoneId || !accessToken) {
        console.error('Missing WhatsApp credentials');
        return;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to.replace(/\D/g, ''),
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: { text },
                    action: {
                        buttons: buttons.map(b => ({
                            type: 'reply',
                            reply: { id: b.id, title: b.title }
                        }))
                    }
                }
            }),
        });
        const data = await response.json();
        console.log('WhatsApp API Response (Buttons):', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error sending WhatsApp buttons:', error);
    }
}
