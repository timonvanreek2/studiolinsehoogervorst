export type ModuleType =
	| 'full'
	| 'double-balanced'
	| 'double-unbalanced'
	| 'left-offset'
	| 'right-offset'
	| 'portrait-left'
	| 'portrait-right'
	| 'portrait-center'
	| 'triple'
	| 'large-small-left'
	| 'large-small-right';

export interface GalleryItem {
	type: ModuleType;
	images: string[];
}

export function parseDimensions(url: string): { width: number; height: number } | null {
	const match = url.match(/-(\d+)x(\d+)\.\w+(\?|$)/);
	if (!match) return null;
	return { width: parseInt(match[1]), height: parseInt(match[2]) };
}

export function getAspect(url: string): number {
	const dims = parseDimensions(url);
	if (!dims) return 1.5;
	return dims.width / dims.height;
}

export function isLandscape(url: string): boolean {
	return getAspect(url) >= 1;
}

export function isPortrait(url: string): boolean {
	return getAspect(url) < 1;
}

export const LAYOUT_SEQUENCE: { consume: number; type: ModuleType }[] = [
	{ consume: 1, type: 'full' },
	{ consume: 2, type: 'double-balanced' },
	{ consume: 1, type: 'right-offset' },
	{ consume: 1, type: 'left-offset' },
	{ consume: 2, type: 'double-unbalanced' },
	{ consume: 1, type: 'full' },
	{ consume: 1, type: 'left-offset' },
	{ consume: 3, type: 'triple' },
	{ consume: 1, type: 'right-offset' },
	{ consume: 2, type: 'double-balanced' },
	{ consume: 1, type: 'full' },
	{ consume: 1, type: 'right-offset' },
	{ consume: 2, type: 'double-unbalanced' },
	{ consume: 1, type: 'left-offset' },
	{ consume: 1, type: 'full' },
];

export interface ImageWithHint {
	url: string;
	size: string;
}

function hintToModule(hint: string, portraitSide: number): { type: ModuleType; consume: number } {
	switch (hint) {
		case 'full': return { type: 'full', consume: 1 };
		case 'half': return { type: 'double-balanced', consume: 2 };
		case 'offset-left': return { type: 'left-offset', consume: 1 };
		case 'offset-right': return { type: 'right-offset', consume: 1 };
		case 'small': {
			const sides: ModuleType[] = ['portrait-left', 'portrait-right', 'portrait-center'];
			return { type: sides[portraitSide % 3], consume: 1 };
		}
		default: return { type: 'full', consume: 1 };
	}
}

const SINGLE_SEQUENCE: ModuleType[] = [
	'full',
	'right-offset',
	'full',
	'left-offset',
	'full',
	'full',
	'left-offset',
	'full',
	'right-offset',
	'full',
];

export function assignModules(
	images: (string | ImageWithHint)[],
	state: { portraitSide: number; sequenceIndex: number }
): GalleryItem[] {
	const modules: GalleryItem[] = [];
	let i = 0;

	function getUrl(img: string | ImageWithHint): string {
		return typeof img === 'string' ? img : img.url;
	}

	function getHint(img: string | ImageWithHint): string {
		return typeof img === 'string' ? 'auto' : (img.size || 'auto');
	}

	while (i < images.length) {
		const url = getUrl(images[i]);
		const hint = getHint(images[i]);
		const remaining = images.length - i;

		if (hint !== 'auto') {
			if (hint === 'half' && remaining >= 2) {
				modules.push({ type: 'double-balanced', images: [url, getUrl(images[i + 1])] });
				i += 2;
			} else {
				const mapped = hintToModule(hint, state.portraitSide);
				if (hint === 'small') state.portraitSide++;
				modules.push({ type: mapped.type, images: [url] });
				i++;
			}
			state.sequenceIndex++;
			continue;
		}

		if (isPortrait(url)) {
			const sides: ModuleType[] = ['portrait-left', 'portrait-right', 'portrait-center'];
			modules.push({ type: sides[state.portraitSide % 3], images: [url] });
			state.portraitSide++;
		} else {
			const type = SINGLE_SEQUENCE[state.sequenceIndex % SINGLE_SEQUENCE.length];
			modules.push({ type, images: [url] });
		}

		state.sequenceIndex++;
		i++;
	}

	return modules;
}
