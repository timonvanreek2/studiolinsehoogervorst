import { client } from './client';
import type { Project } from '$lib/types';

const PROJECT_FIELDS = `
	_id,
	title,
	"slug": slug.current,
	location,
	category,
	photographer,
	completion,
	description,
	"image": coalesce(gallery[isCover == true][0].asset->url, gallery[0].asset->url),
	"imageLqip": coalesce(gallery[isCover == true][0].asset->metadata.lqip, gallery[0].asset->metadata.lqip),
	"gallery": gallery[]{ "url": asset->url, "lqip": asset->metadata.lqip, "aspectRatio": asset->metadata.dimensions.aspectRatio, isAccent },
	featured,
	isHero,
	heroOrientation
`;

export async function getProjects(): Promise<Project[]> {
	const results = await client.fetch(
		`*[_type == "project"] | order(completion desc, order asc) { ${PROJECT_FIELDS} }`
	);
	return results.map(mapProject);
}

export async function getFeaturedProjects(): Promise<Project[]> {
	const results = await client.fetch(
		`*[_type == "project" && featured == true] | order(order asc) { ${PROJECT_FIELDS} }`
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
		"portraitOne": portraitOne.asset->url,
		"portraitTwo": portraitTwo.asset->url,
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
	const gallery = (raw.gallery || [])
		.map((item: any) =>
			typeof item === 'string'
				? { url: item }
				: { url: item.url || '', lqip: item.lqip || undefined, aspectRatio: item.aspectRatio || undefined, isAccent: item.isAccent || false }
		)
		.filter((g: any) => g.url);

	return {
		slug: raw.slug,
		title: raw.title,
		location: raw.location,
		category: raw.category,
		photographer: raw.photographer,
		completion: raw.completion,
		description: typeof raw.description === 'string'
			? raw.description.split('\n\n').map((p: string) => p.trim()).filter(Boolean)
			: (raw.description || []),
		image: raw.image || '',
		imageLqip: raw.imageLqip || undefined,
		gallery,
		sections: [],
		featured: raw.featured || false,
		isHero: raw.isHero || false,
		heroOrientation: raw.heroOrientation === 'portrait' ? 'portrait' : 'landscape',
	};
}
