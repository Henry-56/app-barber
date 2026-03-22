import { sendWhatsAppMessage } from './src/lib/whatsapp';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('--- Iniciando Prueba de WhatsApp API ---');
    console.log('Token:', process.env.WHATSAPP_TOKEN ? 'Presente' : 'Faltante');
    console.log('Phone ID:', process.env.WHATSAPP_PHONE_ID);

    // Usaremos el número de prueba o el número del usuario si desea
    const testNumber = '51939449734'; // El número que ya está vinculado en Meta como remitente (a veces funciona como receptor de prueba)
    
    console.log(`Enviando mensaje de prueba a: ${testNumber}...`);
    
    const result = await sendWhatsAppMessage(testNumber, 'hello_world', 'en_US');
    
    if (result && !result.error) {
        console.log('✅ ¡ÉXITO! Mensaje enviado correctamente.');
        console.log('Respuesta de Meta:', JSON.stringify(result, null, 2));
    } else {
        console.error('❌ ERROR al enviar mensaje.');
        console.error('Detalle:', result?.error || 'Unknown error');
    }
}

test();
