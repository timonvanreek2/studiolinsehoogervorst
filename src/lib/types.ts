export type Category = 'hospitality' | 'cultural' | 'corporate-retail' | 'residential';

export interface GalleryImage {
	url: string;
	/** Sanity LQIP — a tiny base64 blur preview for the blur-up reveal. */
	lqip?: string;
	/** width ÷ height, from Sanity asset metadata — lets the detail page size
	 *  every image to one shared height (capped by the widest in the set). */
	aspectRatio?: number;
	/** Editor flag: float this image as a small detail accent in the framed detail
	 *  layout instead of giving it a full row. */
	isAccent?: boolean;
}

export interface Project {
	slug: string;
	title: string;
	location: string;
	category: Category;
	photographer?: string;
	completion?: string;
	description: string[];
	image: string;
	/** LQIP for the cover `image`, for the blur-up placeholder. */
	imageLqip?: string;
	gallery: GalleryImage[];
	sections: EditorialSection[];
	featured?: boolean;
	isHero?: boolean;
	/** When this project is the homepage hero, open it as a landscape (3:2) or
	 *  portrait (4:5) image. Set per project in Sanity. */
	heroOrientation?: 'landscape' | 'portrait';
}

export type EditorialSection =
	| { type: 'full-image'; color: string; aspect?: number }
	| { type: 'two-images'; colors: [string, string]; aspects?: [number, number] }
	| { type: 'image-text'; color: string; text: string; aspect?: number }
	| { type: 'text-image'; color: string; text: string; aspect?: number }
	| { type: 'quote'; text: string; attribution: string };
