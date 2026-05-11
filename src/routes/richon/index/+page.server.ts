import { getProjects } from '$lib/sanity/queries';

export async function load() {
	const projects = await getProjects();
	const ARCHIVE_SLUGS = new Set(['masterly-milano']);
	return { projects: projects.filter(p => !ARCHIVE_SLUGS.has(p.slug)) };
}
