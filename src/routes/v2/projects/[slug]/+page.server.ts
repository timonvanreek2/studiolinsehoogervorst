import { getProjectBySlug } from '$lib/sanity/queries';
import { error } from '@sveltejs/kit';

export async function load({ params }: { params: { slug: string } }) {
	const project = await getProjectBySlug(params.slug);
	if (!project) throw error(404, 'Project not found');
	return { project };
}
