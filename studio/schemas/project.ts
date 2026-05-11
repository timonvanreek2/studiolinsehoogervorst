import { defineType, defineField } from 'sanity';

export default defineType({
	name: 'project',
	title: 'Project',
	type: 'document',
	fields: [
		defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
		defineField({ name: 'location', title: 'Location', type: 'string' }),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			options: {
				list: [
					{ title: 'Hospitality', value: 'hospitality' },
					{ title: 'Cultural', value: 'cultural' },
					{ title: 'Corporate & Retail', value: 'corporate-retail' },
					{ title: 'Residential', value: 'residential' },
				],
			},
		}),
		defineField({
			name: 'categories',
			title: 'Additional Categories',
			type: 'array',
			of: [{ type: 'string' }],
			options: {
				list: [
					{ title: 'Hospitality', value: 'hospitality' },
					{ title: 'Cultural', value: 'cultural' },
					{ title: 'Corporate & Retail', value: 'corporate-retail' },
					{ title: 'Residential', value: 'residential' },
				],
			},
		}),
		defineField({ name: 'photographer', title: 'Photographer', type: 'string' }),
		defineField({ name: 'completion', title: 'Completion Year', type: 'string' }),
		defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'string' }] }),
		defineField({ name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true } }),
		defineField({
			name: 'gallery',
			title: 'Gallery',
			type: 'array',
			of: [{
				type: 'image',
				options: { hotspot: true },
				fields: [
					defineField({
						name: 'size',
						title: 'Layout size',
						type: 'string',
						options: {
							list: [
								{ title: 'Auto (default)', value: 'auto' },
								{ title: 'Full width', value: 'full' },
								{ title: 'Half (pair with next)', value: 'half' },
								{ title: 'Offset left', value: 'offset-left' },
								{ title: 'Offset right', value: 'offset-right' },
								{ title: 'Small / Portrait', value: 'small' },
							],
						},
						initialValue: 'auto',
					}),
				],
			}],
		}),
		defineField({ name: 'heroColor', title: 'Hero Color (fallback)', type: 'string' }),
		defineField({ name: 'featured', title: 'Featured', type: 'boolean' }),
		defineField({ name: 'order', title: 'Order', type: 'number' }),
	],
	orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
	preview: {
		select: { title: 'title', subtitle: 'location', media: 'heroImage' },
	},
});
