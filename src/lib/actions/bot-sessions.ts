import { db } from '@/lib/db';
import { botSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type BotState = 'INITIAL' | 'AWAITING_NAME' | 'AWAITING_DAY' | 'AWAITING_SLOT';

export async function getBotSession(phone: string) {
    return await db.query.botSessions.findFirst({
        where: eq(botSessions.phone, phone)
    });
}

export async function upsertBotSession(phone: string, state: BotState, data: any = {}) {
    const existing = await getBotSession(phone);
    
    if (existing) {
        await db.update(botSessions)
            .set({ 
                state, 
                data: { ...existing.data as object, ...data },
                updatedAt: new Date()
            })
            .where(eq(botSessions.phone, phone));
    } else {
        await db.insert(botSessions).values({
            phone,
            state,
            data
        });
    }
}

export async function clearBotSession(phone: string) {
    await db.delete(botSessions).where(eq(botSessions.phone, phone));
}
