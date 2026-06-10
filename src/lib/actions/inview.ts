let hasScrolled = false;
if (typeof window !== 'undefined') {
	window.addEventListener('scroll', () => { hasScrolled = true; }, { once: true });
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
