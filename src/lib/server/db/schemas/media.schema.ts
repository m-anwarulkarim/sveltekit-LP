import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Media Library & Gallery Assets Table
export const mediaAssets = sqliteTable(
	'media_assets',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		url: text('url').notNull(),
		folder: text('folder').notNull().default('products'), // 'products' | 'banners' | 'categories' | 'avatars'
		size: text('size').notNull().default('50 KB'),
		dimensions: text('dimensions').default('800 x 800'),
		mimeType: text('mime_type').default('image/webp'),
		uploadedBy: text('uploaded_by'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('media_folder_created_idx').on(table.folder, table.createdAt)]
);

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

