<script lang="ts">
	type Layout = 'single-line' | '2-line' | '3-line' | 'split';
	type Alignment = 'left' | 'center' | 'right';

	type Context = {
		label: string;
		description: string;
		layout: Layout;
		alignment: Alignment;
		tracking: { min: number; default: number; max: number };
		wordGap: { min: number; default: number; max: number };
		lineHeight: { min: number; default: number; max: number };
		separator: boolean;
	};

	const contexts: Record<string, Context> = {
		'website-hero': {
			label: 'Website Hero',
			description: 'Landing page, full viewport',
			layout: 'split',
			alignment: 'left',
			tracking: { min: 0.98, default: 1.0, max: 1.08 },
			wordGap: { min: 14, default: 20, max: 30 },
			lineHeight: { min: 1.6, default: 2.2, max: 3.0 },
			separator: false,
		},
		'website-nav': {
			label: 'Website Nav',
			description: 'Top bar, compact single line',
			layout: 'single-line',
			alignment: 'left',
			tracking: { min: 0.95, default: 1.0, max: 1.05 },
			wordGap: { min: 8, default: 14, max: 22 },
			lineHeight: { min: 1.0, default: 1.0, max: 1.0 },
			separator: false,
		},
		'business-card': {
			label: 'Business Card',
			description: '85 × 55mm, stacked',
			layout: '2-line',
			alignment: 'left',
			tracking: { min: 0.96, default: 1.0, max: 1.08 },
			wordGap: { min: 10, default: 16, max: 24 },
			lineHeight: { min: 1.4, default: 1.8, max: 2.4 },
			separator: false,
		},
		'door-plaque': {
			label: 'Door Plaque',
			description: 'Entrance signage, centered',
			layout: '3-line',
			alignment: 'center',
			tracking: { min: 1.0, default: 1.05, max: 1.15 },
			wordGap: { min: 10, default: 16, max: 24 },
			lineHeight: { min: 1.6, default: 2.0, max: 2.8 },
			separator: false,
		},
		'letterhead': {
			label: 'Letterhead',
			description: 'A4 top, single line or stacked',
			layout: '2-line',
			alignment: 'left',
			tracking: { min: 0.96, default: 1.0, max: 1.06 },
			wordGap: { min: 10, default: 16, max: 22 },
			lineHeight: { min: 1.4, default: 1.7, max: 2.2 },
			separator: false,
		},
		'social': {
			label: 'Social / Avatar',
			description: 'Square crop, tight stacked',
			layout: '3-line',
			alignment: 'center',
			tracking: { min: 0.95, default: 1.0, max: 1.06 },
			wordGap: { min: 6, default: 10, max: 16 },
			lineHeight: { min: 1.3, default: 1.6, max: 2.0 },
			separator: false,
		},
		'signage': {
			label: 'Signage',
			description: 'Large format, generous spacing',
			layout: '3-line',
			alignment: 'left',
			tracking: { min: 1.02, default: 1.08, max: 1.2 },
			wordGap: { min: 14, default: 20, max: 30 },
			lineHeight: { min: 1.8, default: 2.4, max: 3.2 },
			separator: false,
		},
		'email-signature': {
			label: 'Email Signature',
			description: 'Inline, minimal',
			layout: 'single-line',
			alignment: 'left',
			tracking: { min: 0.95, default: 1.0, max: 1.04 },
			wordGap: { min: 6, default: 12, max: 18 },
			lineHeight: { min: 1.0, default: 1.0, max: 1.0 },
			separator: false,
		},
	};

	let activeContext = $state('business-card');
	let ctx = $derived(contexts[activeContext]);

	let density = $state(0.5);
	let inverted = $state(false);
	let showSeparator = $state(false);
	let showGuides = $state(false);

	function lerp(min: number, max: number, t: number) {
		return min + (max - min) * t;
	}

	let tracking = $derived(lerp(ctx.tracking.min, ctx.tracking.max, density));
	let wordGap = $derived(Math.round(lerp(ctx.wordGap.min, ctx.wordGap.max, density)));
	let lineHeight = $derived(lerp(ctx.lineHeight.min, ctx.lineHeight.max, density));
	let layout = $derived(ctx.layout);
	let alignment = $derived(ctx.alignment);

	const STUDIO_W = 87;
	const LINSE_W = 59;
	const HOOGERVORST_W = 178;
	const WORD_H = 19;
	const SEP_W = 8;

	let studioW = $derived(STUDIO_W * tracking);
	let linseW = $derived(LINSE_W * tracking);
	let hoogervorstW = $derived(HOOGERVORST_W * tracking);
	let sepW = $derived(showSeparator ? SEP_W + wordGap : 0);

	type WordPos = { x: number; y: number };

	let positions = $derived.by((): { studio: WordPos; linse: WordPos; hoogervorst: WordPos; width: number; height: number } => {
		const gap = wordGap;
		const lh = WORD_H * lineHeight;

		if (layout === 'single-line') {
			const totalW = studioW + gap + linseW + gap + sepW + hoogervorstW;
			return {
				studio: { x: 0, y: 0 },
				linse: { x: studioW + gap, y: 0 },
				hoogervorst: { x: studioW + gap + linseW + gap + sepW, y: 0 },
				width: totalW,
				height: WORD_H
			};
		}

		if (layout === '2-line') {
			const line2W = linseW + gap + sepW + hoogervorstW;
			const maxW = Math.max(studioW, line2W);
			let studioX = 0;
			let linseX = 0;

			if (alignment === 'center') {
				studioX = (maxW - studioW) / 2;
				linseX = (maxW - line2W) / 2;
			} else if (alignment === 'right') {
				studioX = maxW - studioW;
				linseX = maxW - line2W;
			}

			return {
				studio: { x: studioX, y: 0 },
				linse: { x: linseX, y: lh },
				hoogervorst: { x: linseX + linseW + gap + sepW, y: lh },
				width: maxW,
				height: lh + WORD_H
			};
		}

		if (layout === '3-line') {
			const maxW = Math.max(studioW, linseW, hoogervorstW);
			let studioX = 0;
			let linseX = 0;
			let hoogervorstX = 0;

			if (alignment === 'center') {
				studioX = (maxW - studioW) / 2;
				linseX = (maxW - linseW) / 2;
				hoogervorstX = (maxW - hoogervorstW) / 2;
			} else if (alignment === 'right') {
				studioX = maxW - studioW;
				linseX = maxW - linseW;
				hoogervorstX = maxW - hoogervorstW;
			}

			return {
				studio: { x: studioX, y: 0 },
				linse: { x: linseX, y: lh },
				hoogervorst: { x: hoogervorstX, y: lh * 2 },
				width: maxW,
				height: lh * 2 + WORD_H
			};
		}

		const line2W = linseW + gap + sepW + hoogervorstW;
		const splitW = Math.max(studioW, line2W) * 1.5;
		return {
			studio: { x: splitW - studioW, y: 0 },
			linse: { x: 0, y: lh * 2 },
			hoogervorst: { x: linseW + gap + sepW, y: lh * 2 },
			width: splitW,
			height: lh * 2 + WORD_H
		};
	});

	let separatorPos = $derived.by(() => {
		if (!showSeparator) return null;
		return {
			x: positions.linse.x + linseW + wordGap / 2,
			y: positions.linse.y
		};
	});

	const PAD = 20;
	let viewBox = $derived(
		`${-PAD} ${-PAD} ${positions.width + PAD * 2} ${positions.height + PAD * 2}`
	);

	let svgEl: SVGSVGElement | undefined = $state();

	function exportSVG() {
		if (!svgEl) return;
		const clone = svgEl.cloneNode(true) as SVGSVGElement;
		clone.querySelector('.guides')?.remove();
		clone.querySelector('.canvas-frame')?.remove();
		clone.removeAttribute('class');
		clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		const w = Math.round(positions.width);
		const h = Math.round(positions.height);
		clone.setAttribute('viewBox', `0 0 ${w} ${h}`);
		clone.setAttribute('width', String(w));
		clone.setAttribute('height', String(h));
		const str = new XMLSerializer().serializeToString(clone);
		const blob = new Blob([str], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `studio-linse-hoogervorst-${activeContext}.svg`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function setContext(key: string) {
		activeContext = key;
		density = 0.5;
		showSeparator = contexts[key].separator;
	}
</script>

<div class="tool" class:inverted>
	<div class="canvas-area">
		<svg
			bind:this={svgEl}
			class="logo-canvas"
			viewBox={viewBox}
			xmlns="http://www.w3.org/2000/svg"
		>
			{#if showGuides}
				<g class="guides" opacity="0.12">
					<line x1={-PAD} y1={0} x2={positions.width + PAD} y2={0} stroke="red" stroke-width="0.3" />
					<line x1={-PAD} y1={WORD_H} x2={positions.width + PAD} y2={WORD_H} stroke="red" stroke-width="0.3" />
					{#if layout !== 'single-line'}
						<line x1={-PAD} y1={WORD_H * lineHeight} x2={positions.width + PAD} y2={WORD_H * lineHeight} stroke="blue" stroke-width="0.3" />
						<line x1={-PAD} y1={WORD_H * lineHeight + WORD_H} x2={positions.width + PAD} y2={WORD_H * lineHeight + WORD_H} stroke="blue" stroke-width="0.3" />
					{/if}
					{#if layout === '3-line' || layout === 'split'}
						<line x1={-PAD} y1={WORD_H * lineHeight * 2} x2={positions.width + PAD} y2={WORD_H * lineHeight * 2} stroke="green" stroke-width="0.3" />
						<line x1={-PAD} y1={WORD_H * lineHeight * 2 + WORD_H} x2={positions.width + PAD} y2={WORD_H * lineHeight * 2 + WORD_H} stroke="green" stroke-width="0.3" />
					{/if}
				</g>
			{/if}

				<!-- STUDIO -->
				<g transform="translate({positions.studio.x}, {positions.studio.y}) scale({tracking}, 1)">
					<path d="M84.4314 9.24485C84.4314 7.15825 83.7648 5.39044 82.4897 3.91243C81.1855 2.43443 79.5916 1.68093 77.7369 1.68093C75.8242 1.68093 74.2302 2.43443 72.9551 3.91243C71.651 5.39044 71.0134 7.15825 71.0134 9.24485C71.0134 11.3314 71.651 13.0993 72.9551 14.6062C74.2592 16.1132 75.8531 16.8377 77.7369 16.8377C79.5916 16.8377 81.1566 16.1132 82.4607 14.6062C83.7648 13.0993 84.4314 11.3314 84.4314 9.24485ZM86.9817 9.27383C86.9817 11.998 86.0833 14.2005 84.3444 15.9393C82.5766 17.6782 80.3451 18.5186 77.6789 18.5186C75.0127 18.5186 72.8102 17.6782 71.0714 15.9393C69.3325 14.2005 68.4921 11.998 68.4921 9.27383C68.4921 6.60762 69.3615 4.37612 71.1293 2.63729C72.8681 0.89846 75.0996 0.0290461 77.7658 0.0290461C80.4321 0.0290461 82.6346 0.89846 84.3734 2.63729C86.1122 4.37612 86.9817 6.57864 86.9817 9.27383Z" fill="currentColor"/>
					<path d="M66.043 18.142H62.6233C62.9421 17.6783 63.116 16.6929 63.116 15.128V3.76764C63.116 2.31861 62.9421 1.18837 62.6233 0.4059H66.043C65.6952 1.10143 65.5503 2.23167 65.5503 3.76764V15.2149C65.5503 16.664 65.6952 17.6203 66.043 18.142Z" fill="currentColor"/>
					<path d="M57.7603 9.24496C57.7603 6.98448 57.0937 5.24564 55.7606 3.9705C54.4275 2.72434 52.6307 2.08677 50.3702 2.08677L47.3852 2.05779V15.07C47.3852 15.6207 47.5881 15.9974 48.0228 16.1713C48.4575 16.3742 49.24 16.4611 50.3702 16.4611C52.7466 16.4611 54.5724 15.8525 55.8475 14.6353C57.1227 13.4182 57.7603 11.6214 57.7603 9.24496ZM60.2816 9.24496C60.2816 12.143 59.4411 14.3455 57.7892 15.8525C56.1084 17.3595 53.7609 18.113 50.747 18.113H44.4002C44.748 17.4754 44.9509 16.3742 44.9509 14.7802V3.73866C44.9509 2.28963 44.748 1.15939 44.4002 0.4059H50.689C53.674 0.4059 56.0214 1.21735 57.7313 2.84026C59.4122 4.46317 60.2816 6.60773 60.2816 9.24496Z" fill="currentColor"/>
					<path d="M41.7902 18.142H38.8052V16.577C37.4431 17.8522 35.7333 18.4608 33.6757 18.4608C31.647 18.4608 30.0531 17.8812 28.8359 16.6929C27.6188 15.5047 27.0391 13.8818 27.0391 11.8532V3.8256C27.0391 2.37657 26.8363 1.24633 26.4885 0.4059H29.9372C29.6184 1.27531 29.4735 2.43454 29.4735 3.88356V11.5924C29.4735 15.07 31.0095 16.7799 34.1394 16.7799C36.0521 16.7799 37.617 15.9974 38.8052 14.4325V3.8256C38.8052 2.37657 38.6024 1.24633 38.2546 0.4059H41.7612C41.3845 1.21735 41.2106 2.34759 41.2106 3.79662V15.157C41.2106 16.548 41.3845 17.5624 41.7902 18.142Z" fill="currentColor"/>
					<path d="M24.6473 0.0289802L25.2269 2.89805C24.7052 2.3764 24.0387 2.0866 23.1982 2.0866H19.1989V14.867C19.1989 16.403 19.3728 17.5042 19.7496 18.1418H16.2139C16.5617 17.4173 16.7646 16.345 16.7646 14.896V2.0866H12.7652C12.2146 2.0866 11.8089 2.14456 11.5481 2.26048C11.2583 2.3764 10.9974 2.57927 10.7366 2.89805L11.2872 0C11.577 0.289805 12.1567 0.405727 12.9681 0.405727H22.9954C23.7489 0.405727 24.2995 0.289805 24.6473 0.0289802Z" fill="currentColor"/>
					<path d="M10.2881 13.6789C10.2881 15.0989 9.76643 16.2581 8.7811 17.1565C7.76678 18.0549 6.43367 18.4896 4.78179 18.4896C3.85441 18.4896 2.89805 18.3157 1.94169 17.91C1.13024 17.6202 0.57961 17.7941 0.231844 18.3737V14.3454C1.27514 15.9973 2.75315 16.8088 4.6079 16.8088C5.5063 16.8088 6.25979 16.5479 6.8394 15.9973C7.41901 15.4467 7.7378 14.7222 7.7378 13.8238C7.7378 12.5196 6.95532 11.3894 5.39038 10.4041C5.10057 10.2302 4.63688 9.94038 3.99931 9.53465C3.36174 9.12893 2.95601 8.89708 2.84009 8.81014C0.927376 7.65092 0 6.14393 0 4.34714C0 3.072 0.463688 2.0287 1.44903 1.21725C2.43436 0.434773 3.62256 0.0290461 5.04261 0.0290461C6.02795 0.0290461 6.92634 0.202929 7.76678 0.492733C8.40435 0.753558 8.926 0.666616 9.27376 0.202929V4.05734C8.28843 2.46341 6.92634 1.65195 5.21649 1.65195C4.40504 1.65195 3.70951 1.91278 3.18786 2.40545C2.66621 2.89812 2.40538 3.47773 2.40538 4.17326C2.40538 5.1586 2.89805 5.97005 3.88339 6.57864C4.17319 6.7815 4.69484 7.12927 5.47732 7.59296C6.25979 8.08563 6.81042 8.43339 7.10023 8.60728C9.2158 9.94038 10.2881 11.6213 10.2881 13.6789Z" fill="currentColor"/>
				</g>

				<!-- LINSE -->
				<g transform="translate({positions.linse.x}, {positions.linse.y}) scale({tracking}, 1)">
					<path d="M58.712 15.8814L58.0454 18.1129H48.279C48.6558 17.5913 48.8586 16.49 48.8586 14.8091V3.79655C48.8586 2.34753 48.6558 1.18831 48.308 0.376854H57.9005V2.57937C57.4079 2.20263 56.5964 1.99976 55.4952 1.99976H51.264V8.02771H55.756C56.4805 8.02771 57.0891 7.94077 57.5528 7.7379V9.94042C57.176 9.76654 56.5674 9.65062 55.756 9.65062H51.264V15.5916C51.264 15.9394 51.3509 16.2002 51.5828 16.3161C51.7857 16.4321 52.1624 16.49 52.684 16.49H56.1037C57.205 16.49 58.0744 16.2872 58.712 15.8814Z" fill="currentColor"/>
					<path d="M46.256 13.6498C46.256 15.0699 45.7344 16.2291 44.749 17.1275C43.7347 18.0259 42.4016 18.4606 40.7497 18.4606C39.8224 18.4606 38.866 18.2867 37.9096 17.881C37.0982 17.5912 36.5476 17.7651 36.1998 18.3447V14.3164C37.2431 15.9683 38.7211 16.7797 40.5759 16.7797C41.4743 16.7797 42.2277 16.5189 42.8074 15.9683C43.387 15.4176 43.7057 14.6931 43.7057 13.7947C43.7057 12.4906 42.9233 11.3604 41.3583 10.375C41.0685 10.2011 40.6048 9.91134 39.9673 9.50561C39.3297 9.09988 38.924 8.86804 38.808 8.7811C36.8953 7.62187 35.968 6.11489 35.968 4.3181C35.968 3.04295 36.4316 1.99966 37.417 1.1882C38.4023 0.405727 39.5905 0 41.0106 0C41.9959 0 42.8943 0.173882 43.7347 0.463687C44.3723 0.724512 44.8939 0.63757 45.2417 0.173882V4.02829C44.2564 2.43436 42.8943 1.62291 41.1844 1.62291C40.373 1.62291 39.6775 1.88373 39.1558 2.3764C38.6342 2.86907 38.3733 3.44868 38.3733 4.14421C38.3733 5.12955 38.866 5.941 39.8513 6.5496C40.1411 6.75246 40.6628 7.10023 41.4453 7.56391C42.2277 8.05658 42.7784 8.40435 43.0682 8.57823C45.1838 9.91133 46.256 11.5922 46.256 13.6498Z" fill="currentColor"/>
					<path d="M30.905 0.347808H33.6581C33.2814 1.18824 33.1075 2.31848 33.1075 3.73853V18.0839H32.2381L20.3271 4.14426V15.0989C20.3271 16.49 20.501 17.4753 20.9067 18.0839H18.0956C18.4723 17.5622 18.6752 16.5189 18.6752 15.012V2.20256C18.5303 2.08664 18.3564 1.88378 18.1825 1.59397C17.8348 1.15926 17.3421 0.753535 16.7335 0.37679H20.2981L31.4266 13.418V3.76751C31.4266 2.31848 31.2527 1.18824 30.905 0.347808Z" fill="currentColor"/>
					<path d="M15.2988 18.1129H11.8791C12.1979 17.6492 12.3718 16.6639 12.3718 15.099V3.73859C12.3718 2.28957 12.1979 1.15933 11.8791 0.376854H15.2988C14.951 1.07239 14.8061 2.20263 14.8061 3.73859V15.1859C14.8061 16.6349 14.951 17.5913 15.2988 18.1129Z" fill="currentColor"/>
					<path d="M10.462 15.7945L9.76643 18.1129H0C0.376747 17.5913 0.57961 16.49 0.57961 14.8091V3.79655C0.57961 2.34753 0.376747 1.18831 0.0289806 0.376854H3.53562C3.15888 1.15933 2.98499 2.28957 2.98499 3.76757V15.4177C2.98499 15.8524 3.07193 16.1133 3.2748 16.2292C3.44868 16.3451 3.82543 16.4031 4.40504 16.4031H7.82474C8.98396 16.4031 9.85337 16.2002 10.462 15.7945Z" fill="currentColor"/>
				</g>

				<!-- Separator -->
				{#if showSeparator && separatorPos}
					<g transform="translate({separatorPos.x}, {separatorPos.y})">
						<text font-size="19" fill="currentColor" text-anchor="middle" dominant-baseline="hanging">/</text>
					</g>
				{/if}

				<!-- HOOGERVORST -->
				<g transform="translate({positions.hoogervorst.x}, {positions.hoogervorst.y}) scale({tracking}, 1)">
					<path d="M177.211 0.0289802L177.791 2.89805C177.269 2.3764 176.603 2.0866 175.762 2.0866H171.763V14.867C171.763 16.403 171.937 17.5042 172.314 18.1418H168.778C169.126 17.4173 169.329 16.345 169.329 14.896V2.0866H165.329C164.779 2.0866 164.373 2.14456 164.112 2.26048C163.822 2.3764 163.561 2.57927 163.301 2.89805L163.851 0C164.141 0.289805 164.721 0.405727 165.532 0.405727H175.559C176.313 0.405727 176.864 0.289805 177.211 0.0289802Z" fill="currentColor"/>
					<path d="M162.466 13.6789C162.466 15.0989 161.944 16.2581 160.959 17.1565C159.944 18.0549 158.611 18.4896 156.959 18.4896C156.032 18.4896 155.076 18.3157 154.119 17.91C153.308 17.6202 152.757 17.7941 152.409 18.3737V14.3454C153.453 15.9973 154.931 16.8088 156.785 16.8088C157.684 16.8088 158.437 16.5479 159.017 15.9973C159.597 15.4467 159.915 14.7222 159.915 13.8238C159.915 12.5196 159.133 11.3894 157.568 10.4041C157.278 10.2302 156.814 9.94038 156.177 9.53465C155.539 9.12893 155.133 8.89708 155.018 8.81014C153.105 7.65092 152.177 6.14393 152.177 4.34714C152.177 3.072 152.641 2.0287 153.627 1.21725C154.612 0.434773 155.8 0.029046 157.22 0.029046C158.205 0.029046 159.104 0.202929 159.944 0.492733C160.582 0.753558 161.103 0.666616 161.451 0.202929V4.05734C160.466 2.46341 159.104 1.65195 157.394 1.65195C156.583 1.65195 155.887 1.91278 155.365 2.40545C154.844 2.89812 154.583 3.47773 154.583 4.17326C154.583 5.1586 155.076 5.97005 156.061 6.57864C156.351 6.7815 156.872 7.12927 157.655 7.59296C158.437 8.08563 158.988 8.43339 159.278 8.60728C161.393 9.94038 162.466 11.6213 162.466 13.6789Z" fill="currentColor"/>
					<path d="M146.06 5.04278C146.031 4.11541 145.742 3.39089 145.162 2.84026C144.582 2.31861 143.713 2.02881 142.612 2.02881H141.366V8.02777H142.612C143.713 8.02777 144.582 7.76695 145.191 7.21632C145.771 6.69467 146.06 5.97016 146.06 5.04278ZM151.451 18.113H148.495C148.147 17.8522 147.799 17.4175 147.423 16.8379L143.133 10.3462C142.786 9.88253 142.351 9.65068 141.8 9.65068H141.366V14.7802C141.366 16.3742 141.539 17.4754 141.945 18.113H138.381C138.728 17.4754 138.931 16.3742 138.931 14.7802V3.73866C138.931 2.28963 138.728 1.15939 138.381 0.4059H143.191C144.843 0.4059 146.147 0.811627 147.075 1.62308C148.002 2.43454 148.466 3.56477 148.466 5.0138C148.466 6.202 148.147 7.18734 147.509 7.96981C146.872 8.78127 146.031 9.30292 144.959 9.53476C145.336 9.76661 145.742 10.1723 146.147 10.7519L149.654 15.9684C150.35 17.0117 150.958 17.7362 151.451 18.113Z" fill="currentColor"/>
					<path d="M133.518 9.24485C133.518 7.15825 132.852 5.39044 131.577 3.91243C130.273 2.43443 128.679 1.68093 126.824 1.68093C124.911 1.68093 123.317 2.43443 122.042 3.91243C120.738 5.39044 120.1 7.15825 120.1 9.24485C120.1 11.3314 120.738 13.0993 122.042 14.6062C123.346 16.1132 124.94 16.8377 126.824 16.8377C128.679 16.8377 130.244 16.1132 131.548 14.6062C132.852 13.0993 133.518 11.3314 133.518 9.24485ZM136.069 9.27383C136.069 11.998 135.17 14.2005 133.432 15.9393C131.664 17.6782 129.432 18.5186 126.766 18.5186C124.1 18.5186 121.897 17.6782 120.158 15.9393C118.42 14.2005 117.579 11.998 117.579 9.27383C117.579 6.60762 118.449 4.37612 120.216 2.63729C121.955 0.89846 124.187 0.029046 126.853 0.029046C129.519 0.029046 131.722 0.89846 133.46 2.63729C135.199 4.37612 136.069 6.57864 136.069 9.27383Z" fill="currentColor"/>
					<path d="M114.113 0.4059H116.866C116.576 0.869587 115.91 2.26065 114.924 4.52113L109.07 18.2289H108.346L102.694 4.49215C101.883 2.57944 101.245 1.21735 100.811 0.4059H104.288C104.346 1.50716 104.694 2.7823 105.303 4.23133L109.128 13.8818L113.214 4.02846C113.736 2.81128 114.026 1.5941 114.113 0.4059Z" fill="currentColor"/>
					<path d="M97.6153 5.04278C97.5864 4.11541 97.2966 3.39089 96.717 2.84026C96.1373 2.31861 95.2679 2.02881 94.1667 2.02881H92.9205V8.02777H94.1667C95.2679 8.02777 96.1373 7.76695 96.7459 7.21632C97.3255 6.69467 97.6153 5.97016 97.6153 5.04278ZM103.006 18.113H100.05C99.7019 17.8522 99.3542 17.4175 98.9774 16.8379L94.6883 10.3462C94.3406 9.88253 93.9059 9.65068 93.3552 9.65068H92.9205V14.7802C92.9205 16.3742 93.0944 17.4754 93.5001 18.113H89.9355C90.2833 17.4754 90.4862 16.3742 90.4862 14.7802V3.73866C90.4862 2.28963 90.2833 1.15939 89.9355 0.4059H94.7463C96.3982 0.4059 97.7023 0.811627 98.6297 1.62308C99.557 2.43454 100.021 3.56477 100.021 5.0138C100.021 6.202 99.702 7.18734 99.0644 7.96981C98.4268 8.78127 97.5864 9.30292 96.5141 9.53476C96.8908 9.76661 97.2966 10.1723 97.7023 10.7519L101.209 15.9684C101.904 17.0117 102.513 17.7362 103.006 18.113Z" fill="currentColor"/>
					<path d="M87.7245 15.9105L87.058 18.142H77.2915C77.6683 17.6203 77.8712 16.5191 77.8712 14.8382V3.8256C77.8712 2.37657 77.6683 1.21735 77.3205 0.4059H86.9131V2.60842C86.4204 2.23167 85.6089 2.02881 84.5077 2.02881H80.2765V8.05676H84.7685C85.493 8.05676 86.1016 7.96981 86.5653 7.76695V9.96947C86.1886 9.79559 85.58 9.67966 84.7685 9.67966H80.2765V15.6207C80.2765 15.9684 80.3635 16.2293 80.5953 16.3452C80.7982 16.4611 81.1749 16.5191 81.6966 16.5191H85.1163C86.2175 16.5191 87.087 16.3162 87.7245 15.9105Z" fill="currentColor"/>
					<path d="M70.7478 9.30281H74.8341C74.5442 9.44771 74.3124 9.62159 74.1965 9.85344C74.0806 10.0853 74.0226 10.433 74.0226 10.8967V15.8814C74.0226 16.461 74.1965 16.8667 74.6022 17.0696C72.9213 18.0549 70.8058 18.5186 68.2555 18.5186C65.5603 18.5186 63.2998 17.6492 61.503 15.9104C59.7062 14.1715 58.8078 11.969 58.8078 9.27383C58.8078 6.60762 59.7062 4.37612 61.503 2.63729C63.2998 0.89846 65.5603 0.029046 68.2555 0.029046C69.5306 0.029046 70.6609 0.173948 71.6462 0.463753C72.6895 0.782538 73.5009 0.724578 74.0226 0.260889V4.1153C72.3417 2.55035 70.458 1.7389 68.3134 1.7389C66.4007 1.7389 64.7488 2.49239 63.3867 3.97039C61.9957 5.4484 61.3291 7.21621 61.3291 9.24485C61.3291 11.3025 61.9957 13.0703 63.3867 14.5483C64.7778 16.0553 66.4007 16.7798 68.3134 16.7798C69.7045 16.7798 70.7768 16.5769 71.5882 16.1422V10.8967C71.5882 10.433 71.5303 10.0853 71.4144 9.85344C71.2984 9.62159 71.0666 9.44771 70.7478 9.30281Z" fill="currentColor"/>
					<path d="M54.3516 9.24485C54.3516 7.15825 53.685 5.39044 52.4099 3.91243C51.1058 2.43443 49.5118 1.68093 47.6571 1.68093C45.7444 1.68093 44.1504 2.43443 42.8753 3.91243C41.5712 5.39044 40.9336 7.15825 40.9336 9.24485C40.9336 11.3314 41.5712 13.0993 42.8753 14.6062C44.1794 16.1132 45.7733 16.8377 47.6571 16.8377C49.5118 16.8377 51.0768 16.1132 52.3809 14.6062C53.685 13.0993 54.3516 11.3314 54.3516 9.24485ZM56.9019 9.27383C56.9019 11.998 56.0035 14.2005 54.2646 15.9393C52.4968 17.6782 50.2653 18.5186 47.5991 18.5186C44.9329 18.5186 42.7304 17.6782 40.9916 15.9393C39.2527 14.2005 38.4123 11.998 38.4123 9.27383C38.4123 6.60762 39.2817 4.37612 41.0495 2.63729C42.7883 0.89846 45.0198 0.029046 47.6861 0.029046C50.3523 0.029046 52.5548 0.89846 54.2936 2.63729C56.0324 4.37612 56.9019 6.57864 56.9019 9.27383Z" fill="currentColor"/>
					<path d="M33.8398 9.24485C33.8398 7.15825 33.1733 5.39044 31.8981 3.91243C30.594 2.43443 29.0001 1.68093 27.1453 1.68093C25.2326 1.68093 23.6387 2.43443 22.3636 3.91243C21.0594 5.39044 20.4219 7.15825 20.4219 9.24485C20.4219 11.3314 21.0594 13.0993 22.3636 14.6062C23.6677 16.1132 25.2616 16.8377 27.1453 16.8377C29.0001 16.8377 30.565 16.1132 31.8692 14.6062C33.1733 13.0993 33.8398 11.3314 33.8398 9.24485ZM36.3901 9.27383C36.3901 11.998 35.4917 14.2005 33.7529 15.9393C31.9851 17.6782 29.7536 18.5186 27.0874 18.5186C24.4212 18.5186 22.2187 17.6782 20.4798 15.9393C18.741 14.2005 17.9006 11.998 17.9006 9.27383C17.9006 6.60762 18.77 4.37612 20.5378 2.63729C22.2766 0.89846 24.5081 0.029046 27.1743 0.029046C29.8405 0.029046 32.0431 0.89846 33.7819 2.63729C35.5207 4.37612 36.3901 6.57864 36.3901 9.27383Z" fill="currentColor"/>
					<path d="M15.5915 18.142H12.0269C12.3747 17.5913 12.5775 16.577 12.5775 15.07V9.67966H2.98499V15.157C2.98499 16.548 3.15888 17.5334 3.5646 18.142H0C0.376747 17.6203 0.57961 16.577 0.57961 15.07V3.8256C0.57961 2.37657 0.376747 1.21735 0.0289806 0.4059H3.53562C3.15888 1.24633 2.98499 2.37657 2.98499 3.79662V8.05676H12.5775V3.8256C12.5775 2.37657 12.4037 1.24633 12.0559 0.4059H15.5625C15.1858 1.24633 15.0119 2.37657 15.0119 3.79662V15.157C15.0119 16.577 15.1858 17.5624 15.5915 18.142Z" fill="currentColor"/>
				</g>
		</svg>
	</div>

	<div class="controls">
		<div class="context-selector">
			{#each Object.entries(contexts) as [key, c]}
				<button
					class="context-btn"
					class:active={activeContext === key}
					onclick={() => setContext(key)}
				>
					<span class="context-label">{c.label}</span>
					<span class="context-desc">{c.description}</span>
				</button>
			{/each}
		</div>

		<div class="adjustments">
			<div class="control-group">
				<label>Density <span class="value">{density < 0.33 ? 'Compact' : density > 0.66 ? 'Spacious' : 'Balanced'}</span></label>
				<input type="range" min="0" max="1" step="0.01" bind:value={density} />
			</div>

			<div class="toggles">
				<label class="toggle">
					<input type="checkbox" bind:checked={showSeparator} />
					<span>/</span>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={inverted} />
					<span>Dark</span>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={showGuides} />
					<span>Guides</span>
				</label>
			</div>

			<button class="export-btn" onclick={exportSVG}>Export SVG</button>
		</div>
	</div>
</div>

<style>
	.tool {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: #F7F3F2;
		color: #000;
		font-family: 'ABC Diatype', system-ui, sans-serif;
		font-size: 12px;
		font-weight: 400;
		transition: background 0.3s, color 0.3s;
	}

	.tool.inverted {
		background: #1a1a1a;
		color: #fff;
	}

	.canvas-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60px 40px;
		overflow: hidden;
	}

	.logo-canvas {
		width: 100%;
		height: 100%;
		max-width: 800px;
		color: currentColor;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px 24px;
		border-top: 1px solid currentColor;
		opacity: 0.9;
	}

	.context-selector {
		display: flex;
		gap: 6px;
		overflow-x: auto;
		padding-bottom: 4px;
	}

	.context-btn {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		padding: 8px 12px;
		border: 1px solid currentColor;
		background: none;
		color: inherit;
		font-family: inherit;
		cursor: pointer;
		opacity: 0.3;
		transition: opacity 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.context-btn:hover {
		opacity: 0.6;
	}

	.context-btn.active {
		opacity: 1;
	}

	.context-label {
		font-size: 11px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.context-desc {
		font-size: 9px;
		opacity: 0.5;
	}

	.adjustments {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 180px;
	}

	.control-group label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		display: flex;
		justify-content: space-between;
	}

	.value {
		opacity: 0.5;
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 1px;
		background: currentColor;
		opacity: 0.4;
		outline: none;
		cursor: pointer;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: currentColor;
		cursor: pointer;
	}

	.toggles {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.toggle input {
		cursor: pointer;
	}

	.export-btn {
		margin-left: auto;
		padding: 8px 20px;
		border: 1px solid currentColor;
		background: none;
		color: inherit;
		font-family: inherit;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.export-btn:hover {
		opacity: 0.6;
	}

	@media (max-width: 768px) {
		.context-selector {
			flex-wrap: nowrap;
		}

		.adjustments {
			flex-direction: column;
			align-items: stretch;
			gap: 12px;
		}

		.export-btn {
			margin-left: 0;
		}
	}
</style>
