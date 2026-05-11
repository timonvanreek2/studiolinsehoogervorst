import { getProjects } from '$lib/sanity/queries';

export async function load() {
	const projects = await getProjects();
	const ARCHIVE_SLUGS = new Set(['masterly-milano']);
	const filtered = projects.filter(p => !ARCHIVE_SLUGS.has(p.slug));
	return { projects: filtered };
}
