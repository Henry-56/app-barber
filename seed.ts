import { db } from './src/lib/db';
import { barbers, services } from './src/lib/db/schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    const existingBarbers = await db.select().from(barbers).limit(1);
    if (existingBarbers.length === 0) {
      await db.insert(barbers).values({
        name: 'Luis (Barbero Maestro)',
        commissionRate: '0.50',
        status: 'active',
      });
      console.log('✅ Created default barber: Luis');
    }

    const existingServices = await db.select().from(services).limit(1);
    if (existingServices.length === 0) {
      await db.insert(services).values({
        name: 'Corte de Cabello Premium',
        price: '30.00',
        durationMinutes: 45,
      });
      await db.insert(services).values({
        name: 'Perfilado de Barba',
        price: '15.00',
        durationMinutes: 20,
      });
      console.log('✅ Created default services');
    }

    console.log('✨ Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
