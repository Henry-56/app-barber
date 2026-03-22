import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from 'dotenv';
import * as schema from './schema';
import { customers, barbers, services, sales, membershipPlans, customerMemberships, appointments } from './schema';

config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log('--- Iniciando limpieza de base de datos ---');
  
  // Limpieza en orden para evitar errores de llaves foráneas
  await db.delete(appointments);
  await db.delete(sales);
  await db.delete(customerMemberships);
  await db.delete(membershipPlans);
  await db.delete(services);
  await db.delete(barbers);
  await db.delete(customers);
  
  console.log('✅ Base de datos limpia');

  console.log('--- Sembrando servicios (Huancayo Style) ---');
  const servicesData = await db.insert(services).values([
    { name: 'Corte Clásico', price: '20.00', category: 'corte', durationMinutes: 30 },
    { name: 'Corte Degradado (FADE)', price: '25.00', category: 'corte', durationMinutes: 45 },
    { name: 'Perfilado de Barba', price: '15.00', category: 'barba', durationMinutes: 20 },
    { name: 'Limpieza Facial Express', price: '12.00', category: 'facial', durationMinutes: 15 },
    { name: 'Combo Galán (Corte + Barba)', price: '32.00', category: 'corte', durationMinutes: 50 },
  ]).returning();
  
  console.log('✅ Servicios creados');

  console.log('--- Sembrando Barberos ---');
  const barbersData = await db.insert(barbers).values([
    { name: "Lucho 'El Galán' Quispe", commissionRate: '40.00', status: 'active' },
    { name: "Kevin 'Barber' Huaman", commissionRate: '50.00', status: 'active' },
    { name: "Junior 'The Cut' Rojas", commissionRate: '35.00', status: 'active' },
  ]).returning();

  console.log('✅ Barberos creados');

  console.log('--- Sembrando Clientes Frecuentes ---');
  const customersData = await db.insert(customers).values([
    { name: 'Wilfredo Tello', phone: '945887123', visitCount: 5 },
    { name: 'Maria Espinoza', phone: '967445112', visitCount: 2 },
    { name: 'Ricardo Gutierrez', phone: '912334556', visitCount: 10 },
    { name: 'Sandro Pomahuari', phone: '988776655', visitCount: 1 },
    { name: 'Juan Carlos Aliaga', phone: '955443322', visitCount: 3 },
  ]).returning();

  console.log('✅ Clientes creados');

  console.log('--- Registrando ventas de hoy ---');
  // Ventas simuladas para hoy
  await db.insert(sales).values([
    { 
      customerId: customersData[0].id, 
      barberId: barbersData[0].id, 
      serviceId: servicesData[1].id, 
      amountPaid: '25.00', 
      paymentMethod: 'yape',
      createdAt: new Date()
    },
    { 
      customerId: customersData[1].id, 
      barberId: barbersData[1].id, 
      serviceId: servicesData[0].id, 
      amountPaid: '20.00', 
      paymentMethod: 'efectivo',
      createdAt: new Date()
    },
    { 
      customerId: customersData[2].id, 
      barberId: barbersData[2].id, 
      serviceId: servicesData[4].id, 
      amountPaid: '32.00', 
      paymentMethod: 'plin',
      createdAt: new Date()
    },
    { 
      customerId: null, // Cliente Casual
      barberId: barbersData[0].id, 
      serviceId: servicesData[0].id, 
      amountPaid: '20.00', 
      paymentMethod: 'efectivo',
      createdAt: new Date()
    },
  ]);

  console.log('✅ Ventas registradas');
  console.log('--- Proceso terminado exitosamente 🏔️ ---');
}

main().catch((e) => {
  console.error('❌ Error en el seed:');
  console.error(e);
  process.exit(1);
});
