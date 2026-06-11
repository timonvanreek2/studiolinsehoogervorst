import { defineType, defineField } from 'sanity';

export default defineType({
	name: 'studioContent',
	title: 'Studio Page',
	type: 'document',
	fields: [
		defineField({
			name: 'portraitOne',
			title: 'Portrait — left',
			type: 'image',
			options: { hotspot: true },
		}),
		defineField({
			name: 'portraitTwo',
			title: 'Portrait — right',
			type: 'image',
			options: { hotspot: true },
		}),
		defineField({ name: 'aboutText', title: 'About Text', type: 'text', rows: 10 }),
		defineField({ name: 'contactEmail', title: 'Contact Email', type: 'string' }),
		defineField({ name: 'contactPhone', title: 'Phone', type: 'string' }),
		defineField({ name: 'address', title: 'Address', type: 'text', rows: 4 }),
		defineField({ name: 'instagram', title: 'Instagram handle', description: 'Without the @ sign', type: 'string' }),
	],
	preview: {
		prepare: () => ({ title: 'Studio Page Content' }),
	},
});
