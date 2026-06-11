import { getStudioContent } from '$lib/sanity/queries';

export async function load() {
	const studio = await getStudioContent();
	return { studio };
}
