import { pgTable, text, varchar, timestamp, uuid, decimal, integer, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['active', 'inactive']);
export const paymentMethodEnum = pgEnum('payment_method', ['efectivo', 'yape', 'plin', 'tarjeta']);
export const membershipStatusEnum = pgEnum('membership_status', ['active', 'expired', 'cancelled']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'completed', 'cancelled']);

export const customers = pgTable('customers', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    birthday: timestamp('birthday'),
    notes: text('notes'),
    dni: varchar('dni', { length: 20 }).unique(),
    visitCount: integer('visit_count').default(0),
    lastVisit: timestamp('last_visit'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const barbers = pgTable('barbers', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(),
    status: statusEnum('status').default('active'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const services = pgTable('services', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    category: varchar('category', { length: 50 }).default('corte'), // 'corte', 'facial', 'barba', etc.
    durationMinutes: integer('duration_minutes').default(30),
    createdAt: timestamp('created_at').defaultNow(),
});

export const sales = pgTable('sales', {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id').references(() => customers.id),
    barberId: uuid('barber_id').references(() => barbers.id),
    serviceId: uuid('service_id').references(() => services.id),
    membershipPlanId: uuid('membership_plan_id').references(() => membershipPlans.id),
    amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).notNull(),
    commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }).default('0.00'),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    usedMembership: boolean('used_membership').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// Fase 2 - Membresías
export const membershipPlans = pgTable('membership_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    benefits: text('benefits'), // Description text
    config: text('config'), // JSON string with initial benefits like: {"corte": 4, "facial": 1}
    createdAt: timestamp('created_at').defaultNow(),
});

export const customerMemberships = pgTable('customer_memberships', {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id').references(() => customers.id).notNull(),
    planId: uuid('plan_id').references(() => membershipPlans.id).notNull(),
    startDate: timestamp('start_date').defaultNow(),
    endDate: timestamp('end_date').notNull(),
    benefits: text('benefits'), // Current JSON state: {"corte": 2, "facial": 1}
    status: membershipStatusEnum('status').default('active'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Fase 2 - Agenda
export const appointments = pgTable('appointments', {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id').references(() => customers.id).notNull(),
    barberId: uuid('barber_id').references(() => barbers.id).notNull(),
    serviceId: uuid('service_id').references(() => services.id).notNull(),
    appointmentTime: timestamp('appointment_time').notNull(),
    status: appointmentStatusEnum('status').default('scheduled'),
    createdAt: timestamp('created_at').defaultNow(),
});

// RELATIONS
export const customersRelations = relations(customers, ({ many }) => ({
    sales: many(sales),
    memberships: many(customerMemberships),
    appointments: many(appointments),
}));

export const barbersRelations = relations(barbers, ({ many }) => ({
    sales: many(sales),
    appointments: many(appointments),
}));

export const servicesRelations = relations(services, ({ many }) => ({
    sales: many(sales),
    appointments: many(appointments),
}));

export const salesRelations = relations(sales, ({ one }) => ({
    customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
    barber: one(barbers, { fields: [sales.barberId], references: [barbers.id] }),
    service: one(services, { fields: [sales.serviceId], references: [services.id] }),
    membershipPlan: one(membershipPlans, { fields: [sales.membershipPlanId], references: [membershipPlans.id] }),
}));

export const customerMembershipsRelations = relations(customerMemberships, ({ one }) => ({
    customer: one(customers, { fields: [customerMemberships.customerId], references: [customers.id] }),
    plan: one(membershipPlans, { fields: [customerMemberships.planId], references: [membershipPlans.id] }),
}));

export const membershipPlansRelations = relations(membershipPlans, ({ many }) => ({
    subscriptions: many(customerMemberships),
    sales: many(sales),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
    customer: one(customers, { fields: [appointments.customerId], references: [customers.id] }),
    barber: one(barbers, { fields: [appointments.barberId], references: [barbers.id] }),
    service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
}));
