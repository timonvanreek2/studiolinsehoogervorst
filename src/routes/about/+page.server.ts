import { getStudioContent, getListItems } from '$lib/sanity/queries';

export async function load() {
	const [studio, press, awards] = await Promise.all([
		getStudioContent(),
		getListItems('press'),
		getListItems('award')
	]);

	return { studio, press, awards };
}
