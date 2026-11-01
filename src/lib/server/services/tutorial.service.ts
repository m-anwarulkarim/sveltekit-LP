import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface TutorialItem {
	id: string;
	title: string;
	youtubeId: string;
	thumbnail: string;
	duration: string;
	category: string;
	tags: string[];
	description?: string;
	createdAt?: string;
}

export const DEFAULT_TUTORIALS: TutorialItem[] = [
	{
		id: 'tut-haqplus-landing-page',
		title: 'এক ক্লিকেই তৈরি করুন আনলিমিটেড ল্যান্ডিং পেজ ! Haq Plus IT',
		youtubeId: 'KJNk1obp8PE',
		thumbnail: 'https://img.youtube.com/vi/KJNk1obp8PE/hqdefault.jpg',
		duration: '০৫:৪০ মিনিট',
		category: 'Landing Page',
		tags: ['Haq Plus IT', 'Landing Page', 'Unlimited Pages', 'Tutorial'],
		description: 'প্রতিটি নতুন প্রোডাক্টের জন্য আলাদা করে ডেভেলপার খোঁজার দিন শেষ! এবার Haq Plus IT-এর স্মার্ট ড্যাশবোর্ড থেকেই মাত্র ১ ক্লিকে তৈরি করুন যত খুশি ল্যান্ডিং পেজ।'
	}
];

export class TutorialService {
	/**
	 * Extracts 11-character YouTube video ID from various URL formats or raw ID
	 */
	static extractYoutubeId(input: string): string {
		const clean = input.trim();
		if (!clean) return '';
		
		// Match standard formats like https://www.youtube.com/watch?v=ID, https://youtu.be/ID, embed/ID
		const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
		if (match && match[1]) {
			return match[1];
		}
		
		// If input is directly an 11-character video ID
		if (/^[\w-]{11}$/.test(clean)) {
			return clean;
		}

		return clean;
	}

	/**
	 * Retrieves list of tutorials from D1 database with fallback to default list
	 */
	static async getTutorials(db: DrizzleD1Database<typeof schema>): Promise<TutorialItem[]> {
		try {
			const rows = await db
				.select()
				.from(schema.storeSettings)
				.where(eq(schema.storeSettings.group, 'tutorials'))
				.all();

			const itemsRow = rows.find((r) => r.key === 'items');
			if (itemsRow && itemsRow.value) {
				const parsed = JSON.parse(itemsRow.value);
				// Filter out old demo videos (those with 'tut-1', 'tut-2', etc. or Saleecom)
				const clean = Array.isArray(parsed)
					? parsed.filter((t: any) => !t.id?.match(/^tut-[1-8]$/) && !t.title?.includes('Saleecom') && t.youtubeId !== '7wtfhZwyrcc')
					: [];
				if (clean.length > 0) {
					return clean;
				}
			}

			// If empty in DB or was old demo, persist the new Haq Plus video
			await this.saveTutorials(db, DEFAULT_TUTORIALS);
			return DEFAULT_TUTORIALS;
		} catch (e) {
			console.error('Failed to get tutorials from D1:', e);
			return DEFAULT_TUTORIALS;
		}
	}

	/**
	 * Persists array of tutorials into D1 store_settings
	 */
	static async saveTutorials(
		db: DrizzleD1Database<typeof schema>,
		items: TutorialItem[]
	): Promise<TutorialItem[]> {
		const valueStr = JSON.stringify(items);
		await db
			.insert(schema.storeSettings)
			.values({
				group: 'tutorials',
				key: 'items',
				value: valueStr,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: [schema.storeSettings.group, schema.storeSettings.key],
				set: {
					value: valueStr,
					updatedAt: new Date()
				}
			});

		return items;
	}

	/**
	 * Adds a new tutorial to D1 database
	 */
	static async addTutorial(
		db: DrizzleD1Database<typeof schema>,
		data: {
			title: string;
			youtubeUrlOrId: string;
			duration?: string;
			category?: string;
			tags?: string[];
			description?: string;
		}
	): Promise<TutorialItem> {
		const list = await this.getTutorials(db);
		const youtubeId = this.extractYoutubeId(data.youtubeUrlOrId);
		const id = `tut-${Date.now()}`;
		const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

		const newTutorial: TutorialItem = {
			id,
			title: data.title.trim(),
			youtubeId,
			thumbnail,
			duration: data.duration?.trim() || '০৫:০০ মিনিট',
			category: data.category?.trim() || 'Getting Started',
			tags: data.tags && data.tags.length > 0 ? data.tags : ['Tutorial', 'Guide'],
			description: data.description?.trim() || '',
			createdAt: new Date().toISOString()
		};

		// Add new video to the beginning of the list
		list.unshift(newTutorial);
		await this.saveTutorials(db, list);
		return newTutorial;
	}

	/**
	 * Deletes a tutorial by ID from D1 database
	 */
	static async deleteTutorial(
		db: DrizzleD1Database<typeof schema>,
		id: string
	): Promise<boolean> {
		const list = await this.getTutorials(db);
		const filtered = list.filter((item) => item.id !== id);
		await this.saveTutorials(db, filtered);
		return true;
	}
}

