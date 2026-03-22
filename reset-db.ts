
import 'dotenv/config';
import { db } from './src/lib/db';
import { 
    barbers, 
    services, 
    membershipPlans, 
    customers, 
    sales, 
    customerMemberships, 
    appointments 
} from './src/lib/db/schema';

async function reset() {
    console.log('🗑️  Wiping database...');
    
    try {
        // Delete in order to respect foreign keys
        await db.delete(appointments);
        await db.delete(sales);
        await db.delete(customerMemberships);
        await db.delete(customers);
        await db.delete(services);
        await db.delete(barbers);
        await db.delete(membershipPlans);
        
        console.log('✅ Database cleared!');

        console.log('🌱 Seeding fresh data...');

        // 1. Seed Barbers
        await db.insert(barbers).values([
            { name: 'Luis "Master" Barber', commissionRate: '50.00' },
            { name: 'Carlo "Style" Huamán', commissionRate: '40.00' },
            { name: 'Henry "The King" Arroyo', commissionRate: '50.00' }
        ]);
        console.log('✅ Barbers seeded');

        // 2. Seed Services
        await db.insert(services).values([
            { name: 'Corte Clásico', price: '15.00', category: 'corte', durationMinutes: 30 },
            { name: 'Corte Degradado (Fade)', price: '20.00', category: 'corte', durationMinutes: 45 },
            { name: 'Perfilado de Barba', price: '10.00', category: 'barba', durationMinutes: 20 },
            { name: 'Limpieza Facial Express', price: '10.00', category: 'facial', durationMinutes: 25 },
            { name: 'Combo PRO (Corte + Barba)', price: '35.00', category: 'corte', durationMinutes: 60 }
        ]);
        console.log('✅ Services seeded');

        // 3. Seed Membership Plans
        await db.insert(membershipPlans).values([
            { 
                name: 'Plan Basic', 
                price: '100.00', 
                benefits: '4 Cortes de cabello al mes', 
                config: JSON.stringify({ corte: 4 }) 
            },
            { 
                name: 'Plan Gold', 
                price: '150.00', 
                benefits: '4 Cortes + 2 Perfilados de Barba', 
                config: JSON.stringify({ corte: 4, barba: 2 }) 
            },
            { 
                name: 'Plan Black VIP', 
                price: '200.00', 
                benefits: 'Suscripción ilimitada (4 cortes, 2 barbas, 2 faciales)', 
                config: JSON.stringify({ corte: 4, barba: 2, facial: 2 }) 
            }
        ]);
        console.log('✅ Membership Plans seeded');

        // 4. Seed some initial Customers
        await db.insert(customers).values([
            { name: 'Juan Alberto Perez', phone: '987654321', dni: '00000001' },
            { name: 'Cristian Dominguez', phone: '912345678', dni: '00000002' }
        ]);
        console.log('✅ Sample Customers seeded');

        console.log('✨ Database reset and seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during reset:', error);
        process.exit(1);
    }
}

reset();
