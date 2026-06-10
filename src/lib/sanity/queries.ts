import { client } from './client';
import type { Project } from '$lib/types';

const PROJECT_FIELDS = `
	_id,
	title,
	"slug": slug.current,
	location,
	category,
	categories,
	photographer,
	completion,
	description,
	"image": heroImage.asset->url,
	"heroHotspot": heroImage.hotspot,
	"gallery": gallery[]{ "url": asset->url, "size": coalesce(size, "auto") },
	"featuredImages": featuredImages[].asset->url,
	heroColor,
	featured
`;

export async function getProjects(): Promise<Project[]> {
	const results = await client.fetch(
		`*[_type == "project"] | order(completion desc, order asc) { ${PROJECT_FIELDS} }`
	);
	return results.map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
	const result = await client.fetch(
		`*[_type == "project" && slug.current == $slug][0] { ${PROJECT_FIELDS} }`,
		{ slug }
	);
	return result ? mapProject(result) : null;
}

export async function getStudioContent() {
	return client.fetch(`*[_type == "studioContent"][0] {
		"image": image.asset->url,
		aboutText,
		contactEmail,
		contactPhone,
		address,
		instagram
	}`);
}

export async function getListItems(type: 'press' | 'award') {
	return client.fetch(
		`*[_type == "listItem" && itemType == $type] | order(year desc) { year, title }`,
		{ type }
	);
}

function mapProject(raw: any): Project {
	const rawGallery = raw.gallery || [];
	const gallery = rawGallery.map((item: any) => {
		if (typeof item === 'string') return { url: item, size: 'auto' as const };
		return { url: item.url || '', size: item.size || 'auto' };
	}).filter((g: any) => g.url);

	const featuredImages: string[] = (raw.featuredImages || []).filter((u: unknown) => typeof u === 'string' && u.length > 0);

	return {
		slug: raw.slug,
		title: raw.title,
		location: raw.location,
		category: raw.category,
		categories: raw.categories,
		photographer: raw.photographer,
		completion: raw.completion,
		description: raw.description || [],
		image: raw.image || '',
		gallery,
		featuredImages,
		heroColor: raw.heroColor || '#999',
		sections: [],
		featured: raw.featured || false
	};
}
