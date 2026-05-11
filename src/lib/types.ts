export type Category = 'hospitality' | 'cultural' | 'corporate-retail' | 'residential';

export type GallerySize = 'auto' | 'full' | 'half' | 'offset-left' | 'offset-right' | 'small';

export interface GalleryImage {
	url: string;
	size: GallerySize;
}

export interface Project {
	slug: string;
	title: string;
	location: string;
	category: Category;
	categories?: Category[];
	photographer?: string;
	completion?: string;
	description: string[];
	image: string;
	gallery: GalleryImage[];
	heroColor: string;
	sections: EditorialSection[];
	featured?: boolean;
}

export type EditorialSection =
	| { type: 'full-image'; color: string; aspect?: number }
	| { type: 'two-images'; colors: [string, string]; aspects?: [number, number] }
	| { type: 'image-text'; color: string; text: string; aspect?: number }
	| { type: 'text-image'; color: string; text: string; aspect?: number }
	| { type: 'quote'; text: string; attribution: string };
