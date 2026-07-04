let hasScrolled = false;
if (typeof window !== 'undefined') {
	window.addEventListener('scroll', () => { hasScrolled = true; }, { once: true });
}

/**
 * Crossfade a grid image in over its blur-up placeholder once it is actually
 * ready to paint. We wait for `decode()` (not just `load`) so the fade never
 * starts on a frame the browser hasn't rasterised yet — that decode jank is
 * exactly the "pop" the plain load reveal produced. Errors and the already-
 * cached case both still reveal, so an image can never get stuck invisible.
 */
export function revealOnLoad(node: HTMLImageElement) {
	let done = false;
	const reveal = () => {
		if (done) return;
		done = true;
		node.classList.add('loaded');
	};

	if (node.complete && node.naturalWidth > 0) {
		// Already decoded (cache / SSR markup): reveal next frame so the element
		// paints at opacity 0 first and the transition still plays once.
		requestAnimationFrame(reveal);
	} else {
		node.addEventListener(
			'load',
			() => {
				const ready = node.decode ? node.decode().catch(() => {}) : Promise.resolve();
				ready.then(reveal);
			},
			{ once: true }
		);
		node.addEventListener('error', reveal, { once: true });
	}

	return { destroy() {} };
}

export function fadeIn(node: HTMLElement) {
	// Honour prefers-reduced-motion: skip gate/delay, mark visible immediately.
	if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		node.classList.add('visible');
		return { destroy() {} };
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					if (!hasScrolled) {
						setTimeout(() => node.classList.add('visible'), 1000);
					} else {
						node.classList.add('visible');
					}
					observer.unobserve(node);
				}
			}
		},
		{
			rootMargin: '0px 0px 10% 0px',
			threshold: 0
		}
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
