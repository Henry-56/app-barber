
async function simulateButtonReply() {
    console.log('--- Simulando Clic en Botón: "slot_10:00" ---');
    
    const mockButtonMsg = {
        object: 'whatsapp_business_account',
        entry: [{
            changes: [{
                value: {
                    messages: [{
                        from: '51939449734',
                        type: 'interactive',
                        interactive: {
                            type: 'button_reply',
                            button_reply: { id: 'slot_10:00', title: '10:00' }
                        }
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
            body: JSON.stringify(mockButtonMsg)
        });

        const data = await response.json();
        console.log('Respuesta del Webhook (Botón):', data);
        
    } catch (error) {
        console.error('Error en simulación de botón:', error);
    }
}

simulateButtonReply();
