import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

// User Profiles linked to Supabase Auth
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(), // References auth.users
  email: text('email').notNull(),
  credits: integer('credits').default(5),
  createdAt: timestamp('created_at').defaultNow(),
});

// Wallpaper History
export const wallpapers = pgTable('wallpapers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  imageUrl: text('image_url').notNull(),
  cloudinaryId: text('cloudinary_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    // ⚡ Optimized query: Get wallpapers for a user ordered by date
    userIdDateIdx: index('user_id_date_idx').on(table.userId, table.createdAt),
  };
});
