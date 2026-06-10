// Downloads Figma Dev Mode source assets, crops them with the same window
// the Figma frame uses (277.4 x 346.75 viewport, per-image x/y offset),
// uploads the cropped PNGs to Sanity, and patches each project's
// `featuredImages` field with references to the new assets.
//
// Requires:
//   - Figma Dev Mode running locally so http://localhost:3845/assets/... is reachable
//   - SANITY_TOKEN env var (Editor or Admin scope on the gxiivwaf project)
//
// Run:
//   SANITY_TOKEN=xxx node scripts/upload-featured-images.mjs

import { createClient } from '@sanity/client';
import sharp from 'sharp';
import crypto from 'node:crypto';

const FRAME_W = 277.4;
const FRAME_H = 346.75;

const TEMP_ORDER = [
	'national-gallery',
	'create-restaurant',
	'scheepsvaart-museum',
	'inter-scaldes',
	'hillfloor',
	'nationale-opera-ballet',
	'rijks-restaurant-2',
	'city-hall-leiden',
	'rijksmuseum-atrium-cafe',
	'pillows-grand-boutique-hotel',
	'benedict-retreat-hotel',
	'hotel-the-dylan'
];

const TEMP_IMAGES = {
	'national-gallery': [
		{ url: 'http://localhost:3845/assets/5cda92331300e07d2315febba0a70c170b0a384a.png', w: 277.4, h: 346.75, x: 0, y: 0 },
		{ url: 'http://localhost:3845/assets/31a4667bc49924b49287fab827527fad406e2a1f.png', w: 277.4, h: 416.03, x: 0, y: -34.64 },
		{ url: 'http://localhost:3845/assets/7534505398562e4b12062db6d448ec24022aa1e1.png', w: 277, h: 416, x: 0.8, y: 0 }
	],
	'scheepsvaart-museum': [
		{ url: 'http://localhost:3845/assets/1d024f58820b523470489f3fe6da68acde982358.png', w: 279, h: 372, x: -1.4, y: -13 },
		{ url: 'http://localhost:3845/assets/676442257255a969b960763eeaacb7213672640f.png', w: 377, h: 502, x: -49.2, y: -78 },
		{ url: 'http://localhost:3845/assets/c68b512d699c2cbb0cfe3e7f92b29d7fc682324d.png', w: 554, h: 693, x: 0, y: 0 },
		{ url: 'http://localhost:3845/assets/f5bbf88177a044c4ace5ca74530df7aa2ae4c15c.png', w: 1321, h: 991, x: -765.8, y: -185 }
	],
	hillfloor: [
		{ url: 'http://localhost:3845/assets/cf7a15c8a9847705714b17564bbbda37ae374086.png', w: 278, h: 348, x: -0.4, y: -1 },
		{ url: 'http://localhost:3845/assets/166152da4a70c550c697e368c05d399ec3478461.png', w: 414, h: 517, x: -0.4, y: -70 },
		{ url: 'http://localhost:3845/assets/99e7c8b67a0dbc632927d6a207f05263f2d57714.png', w: 719, h: 575, x: 0.2, y: -178 },
		{ url: 'http://localhost:3845/assets/70e195151ce62d641fa8679156349dbb08d771c7.png', w: 278, h: 347, x: -0.2, y: 0 }
	],
	'nationale-opera-ballet': [
		{ url: 'http://localhost:3845/assets/edd14152a6cba75e05ddaa95ef4f2ad44721ee84.png', w: 532, h: 710, x: -29, y: -346 },
		{ url: 'http://localhost:3845/assets/3145d0c773be31163e8b7483252e5576c49e0e90.png', w: 984, h: 656, x: -109.4, y: -309 },
		{ url: 'http://localhost:3845/assets/fc8ebe48a2980454356a0d100b8387d2c7eb253f.png', w: 361, h: 481, x: -83.4, y: -134 }
	],
	'create-restaurant': [
		{ url: 'http://localhost:3845/assets/42e0173248cf3b15f99075f881be74d264c81b63.png', w: 670, h: 894, x: -249.2, y: -547 },
		{ url: 'http://localhost:3845/assets/5a1b97946b860dfa8e16517ca7253b8377c3062e.png', w: 276, h: 369, x: 0, y: -12 },
		{ url: 'http://localhost:3845/assets/f345cad7529d78131f539f2e407a7f3fea5c2ea1.png', w: 819, h: 614, x: -459, y: 0 },
		{ url: 'http://localhost:3845/assets/b6e23eac44c18f7a3b8f4da508bcebdc3d6e42b9.png', w: 562, h: 421, x: -157.4, y: -37 }
	],
	'rijks-restaurant-2': [
		{ url: 'http://localhost:3845/assets/d3a667f203ce385fca4eb6f2d62ff5516161d4f7.png', w: 377, h: 564, x: 0, y: -67 },
		{ url: 'http://localhost:3845/assets/9cf224bddb278df3d77256f02c9dcab6d82a5f7a.png', w: 614, h: 346, x: -168.4, y: 1 },
		{ url: 'http://localhost:3845/assets/b394799125cd8b9bac4eb6e69383444c42ee94b1.png', w: 432, h: 567, x: 0.2, y: -220 },
		{ url: 'http://localhost:3845/assets/a127817ead20a8382591b02b5730176ff7745627.png', w: 617, h: 347, x: -254.2, y: 0 }
	],
	'city-hall-leiden': [
		{ url: 'http://localhost:3845/assets/4c2dd80c9d00b03efa01891d859baf6c1cfcb5cc.png', w: 1191, h: 670, x: -373.4, y: -110 },
		{ url: 'http://localhost:3845/assets/7e3d414b900e0c6bc018de84326ea2dc7871b0c0.png', w: 385, h: 524, x: -54, y: -177 },
		{ url: 'http://localhost:3845/assets/3a7744bdad973269bbfc285ccb528ac4f4ff8b67.png', w: 902, h: 507, x: -50.8, y: -160 }
	],
	'rijksmuseum-atrium-cafe': [
		{ url: 'http://localhost:3845/assets/410d0c86bea9ae94c1e9f255e3dd81e1901369fd.png', w: 863, h: 486, x: -155, y: -139 },
		{ url: 'http://localhost:3845/assets/b9cc5b6117c1a1e20a8f7f7eabcf080001bc333d.png', w: 1229, h: 691, x: -214.4, y: 0 },
		{ url: 'http://localhost:3845/assets/95f3c24cf94be5fb798c64e4a463ab58d1f5256b.png', w: 716, h: 403, x: -157.8, y: -56 }
	],
	'pillows-grand-boutique-hotel': [
		{ url: 'http://localhost:3845/assets/1b039a5810c7cdf5a666e9f9c52d61a8178a3c8d.png', w: 1503, h: 846, x: -452.2, y: -376 },
		{ url: 'http://localhost:3845/assets/12948850abd2cc301b6626f089edabecdf25be2f.png', w: 277, h: 415, x: 0, y: -68 },
		{ url: 'http://localhost:3845/assets/71dccd2edb3022088eb923f7f1c60cefd2e9ec1b.png', w: 358, h: 431, x: 0.2, y: -84 },
		{ url: 'http://localhost:3845/assets/25293326476d1566bc3ced5a926dde4ed53a5137.png', w: 785, h: 441, x: -85.4, y: -84 }
	],
	'benedict-retreat-hotel': [
		{ url: 'http://localhost:3845/assets/bdd2909446ce4ccbe389d55c2438bcd5af009871.png', w: 796.056, h: 469.549, x: -374.36, y: -102.9 },
		{ url: 'http://localhost:3845/assets/dd896ff73ed53f28b48fe11455a1baa49da961ba.png', w: 351.023, h: 397.385, x: -9.18, y: -41.05 },
		{ url: 'http://localhost:3845/assets/833b70e79bcee298b0c856bb30031dd26674138d.png', w: 305.602, h: 347.421, x: 0, y: -0.67 }
	],
	'hotel-the-dylan': [
		{ url: 'http://localhost:3845/assets/2a3a44e11bfc03a8c9309c94bc9c3c75fa5399d9.png', w: 635.831, h: 357.655, x: -179.22, y: -8.57 },
		{ url: 'http://localhost:3845/assets/8ffe234e9bc2e9073483feae0ac4861dd4c5adf2.png', w: 453.646, h: 510.352, x: -52.89, y: -146.32 },
		{ url: 'http://localhost:3845/assets/d2ef9339c0361ceac3ccf441b826585b2cd0a0c6.png', w: 742.98, h: 835.853, x: -223.89, y: -201.51 }
	],
	'inter-scaldes': [
		{ url: 'http://localhost:3845/assets/7391ed39a8a6da2ccfc6fd81fcedca5d8ed1c5d4.png', w: 1046.932, h: 698.091, x: -606.89, y: -351.34 },
		{ url: 'http://localhost:3845/assets/cfaaa41bf82652c285aa10531a0adb10d4165df8.png', w: 283.238, h: 350.969, x: -3.44, y: -4.22 },
		{ url: 'http://localhost:3845/assets/70a89fbf1771f7fc937d0d8a97f67ddb44d26400.png', w: 365.766, h: 448.917, x: -48.97, y: -98.85 }
	]
};

// Slot sizes per project — caps how many of the entries above get rendered.
const SIZES = {
	'national-gallery': 3,
	'scheepsvaart-museum': 1,
	hillfloor: 2,
	'nationale-opera-ballet': 3,
	'create-restaurant': 3,
	'rijks-restaurant-2': 2,
	'city-hall-leiden': 3,
	'rijksmuseum-atrium-cafe': 1,
	'pillows-grand-boutique-hotel': 3,
	'hotel-the-dylan': 3,
	'benedict-retreat-hotel': 3,
	'inter-scaldes': 3
};

const token = process.env.SANITY_TOKEN;
if (!token) {
	console.error('Missing SANITY_TOKEN env var.');
	process.exit(1);
}

const client = createClient({
	projectId: 'gxiivwaf',
	dataset: 'production',
	apiVersion: '2024-01-01',
	token,
	useCdn: false
});

function key() {
	return crypto.randomBytes(6).toString('hex');
}

async function cropBuffer(sourceUrl, w, h, x, y) {
	const res = await fetch(sourceUrl);
	if (!res.ok) throw new Error(`Failed to fetch ${sourceUrl}: ${res.status}`);
	const buf = Buffer.from(await res.arrayBuffer());

	const targetW = Math.round(FRAME_W);
	const targetH = Math.round(FRAME_H);
	const scaledW = Math.max(targetW, Math.round(w));
	const scaledH = Math.max(targetH, Math.round(h));

	const left = Math.max(0, Math.min(scaledW - targetW, Math.round(-x)));
	const top = Math.max(0, Math.min(scaledH - targetH, Math.round(-y)));

	return sharp(buf)
		.resize(scaledW, scaledH, { fit: 'fill' })
		.extract({ left, top, width: targetW, height: targetH })
		.png()
		.toBuffer();
}

async function processProject(slug) {
	const crops = TEMP_IMAGES[slug];
	if (!crops) {
		console.warn(`  no crops defined, skipping`);
		return;
	}

	const project = await client.fetch(
		`*[_type=="project" && slug.current==$slug][0]{_id, title}`,
		{ slug }
	);
	if (!project) {
		console.warn(`  no project document for slug, skipping`);
		return;
	}

	const slot = SIZES[slug] ?? crops.length;
	const take = Math.min(slot, crops.length);

	const assetRefs = [];
	for (let i = 0; i < take; i++) {
		const c = crops[i];
		process.stdout.write(`  [${i + 1}/${take}] cropping & uploading… `);
		try {
			const buf = await cropBuffer(c.url, c.w, c.h, c.x, c.y);
			const asset = await client.assets.upload('image', buf, {
				filename: `${slug}-${i + 1}.png`,
				contentType: 'image/png'
			});
			assetRefs.push(asset._id);
			console.log('ok');
		} catch (err) {
			console.log(`failed: ${err.message}`);
			throw err;
		}
	}

	const arr = assetRefs.map((id) => ({
		_type: 'image',
		_key: key(),
		asset: { _type: 'reference', _ref: id }
	}));

	await client.patch(project._id).set({ featuredImages: arr }).commit();
	console.log(`  patched ${project.title} with ${arr.length} images`);
}

async function main() {
	for (const slug of TEMP_ORDER) {
		console.log(`\n→ ${slug}`);
		try {
			await processProject(slug);
		} catch (err) {
			console.error(`  ${slug} failed: ${err.message}`);
		}
	}
	console.log('\nDone.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
