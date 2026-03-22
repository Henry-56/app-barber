
async function simulateWebhook() {
    console.log('--- Simulando Mensaje de Cliente: "Hola, quiero una cita" ---');
    
    const mockTextMsg = {
        object: 'whatsapp_business_account',
        entry: [{
            changes: [{
                value: {
                    messages: [{
                        from: '51939449734',
                        type: 'text',
                        text: { body: 'Hola, quiero una cita' }
                    }]
                },
                field: 'messages'
            }]
        }]
    };

    try {
        const response = await fetch('http://localhost:3000/api/webhook/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockTextMsg)
        });

        const data = await response.json();
        console.log('Respuesta del Webhook:', data);
        console.log('REVISA LA CONSOLA DEL SERVIDOR (npm run dev) para ver los logs de envío.');
        
    } catch (error) {
        console.error('Error en simulación:', error);
    }
}

simulateWebhook();
