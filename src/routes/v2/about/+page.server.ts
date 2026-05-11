import { getStudioContent, getListItems } from '$lib/sanity/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [studio, press, awards] = await Promise.all([
		getStudioContent(),
		getListItems('press'),
		getListItems('award')
	]);

	return { studio, press, awards };
};
