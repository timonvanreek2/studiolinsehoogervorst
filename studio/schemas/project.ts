import { defineType, defineField } from 'sanity';
import GalleryPreviewInput from '../components/GalleryPreviewInput';

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
		defineField({ name: 'photographer', title: 'Photographer', type: 'string' }),
		defineField({ name: 'completion', title: 'Completion Year', type: 'string' }),
		defineField({ name: 'description', title: 'Description', type: 'text', rows: 6 }),
		defineField({
			name: 'gallery',
			title: 'Gallery',
			type: 'array',
			components: { input: GalleryPreviewInput },
			of: [{
				type: 'image',
				options: { hotspot: true },
				fields: [
					defineField({
						name: 'isCover',
						title: 'Use as cover image',
						description: 'This image will be shown in the homepage grid and as the first image in the detail view.',
						type: 'boolean',
						initialValue: false,
					}),
					defineField({
						name: 'isAccent',
						title: 'Show as small accent',
						description: 'Promote this image to a small detail image that floats beside a larger one in the framed detail layout, instead of taking a full row.',
						type: 'boolean',
						initialValue: false,
					}),
				],
			}],
		}),
		defineField({ name: 'featured', title: 'Show on homepage', type: 'boolean' }),
		defineField({ name: 'isHero', title: 'Homepage hero', description: 'Mark one project as the scroll-animation hero on the homepage. Only one project should have this enabled.', type: 'boolean' }),
		defineField({
			name: 'heroOrientation',
			title: 'Homepage hero orientation',
			description: 'When this is the homepage hero, open it as a landscape (3:2) or portrait (4:5) image. Only applies to the project marked “Homepage hero”.',
			type: 'string',
			options: {
				list: [
					{ title: 'Landscape (3:2)', value: 'landscape' },
					{ title: 'Portrait (4:5)', value: 'portrait' },
				],
				layout: 'radio',
			},
			initialValue: 'landscape',
		}),
		defineField({ name: 'order', title: 'Order', type: 'number' }),
	],
	orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
	preview: {
		select: { title: 'title', subtitle: 'location', media: 'gallery.0' },
	},
});
