import { getProjects } from '$lib/sanity/queries';

export async function load() {
	const projects = await getProjects();
	return { projects };
}
