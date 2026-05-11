import { defineType, defineField } from 'sanity';

export default defineType({
	name: 'listItem',
	title: 'Press / Award',
	type: 'document',
	fields: [
		defineField({
			name: 'itemType',
			title: 'Type',
			type: 'string',
			options: {
				list: [
					{ title: 'Press', value: 'press' },
					{ title: 'Award', value: 'award' },
				],
			},
			validation: (r) => r.required(),
		}),
		defineField({ name: 'year', title: 'Year', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
	],
	orderings: [{ title: 'Year', name: 'year', by: [{ field: 'year', direction: 'desc' }] }],
	preview: {
		select: { title: 'title', subtitle: 'year' },
	},
});
