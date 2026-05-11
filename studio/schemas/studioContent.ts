import { defineType, defineField } from 'sanity';

export default defineType({
	name: 'studioContent',
	title: 'Studio Page',
	type: 'document',
	fields: [
		defineField({ name: 'image', title: 'Studio Image', type: 'image' }),
		defineField({ name: 'aboutText', title: 'About Text', type: 'text', rows: 10 }),
		defineField({ name: 'contactEmail', title: 'Contact Email', type: 'string' }),
		defineField({ name: 'contactPhone', title: 'Phone', type: 'string' }),
		defineField({ name: 'address', title: 'Address', type: 'text', rows: 4 }),
		defineField({ name: 'newBusinessEmail', title: 'New Business Email', type: 'string' }),
	],
	preview: {
		prepare: () => ({ title: 'Studio Page Content' }),
	},
});
