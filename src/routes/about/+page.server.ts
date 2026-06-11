import { getListItems } from '$lib/sanity/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { studio } = await parent();
	const [press, awards] = await Promise.all([
		getListItems('press'),
		getListItems('award')
	]);

	return { studio, press, awards };
}
