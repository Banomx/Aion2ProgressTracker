import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const trackerState = sqliteTable('tracker_state', {profile: text('profile').primaryKey(),data: text('data').notNull()});
