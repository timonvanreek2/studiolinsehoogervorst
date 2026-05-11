export function inview(node: HTMLElement, callback: (slug: string) => void) {
	const slug = node.dataset.slug || '';

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					callback(slug);
				}
			}
		},
		{
			rootMargin: '-50% 0px -50% 0px',
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

export function fadeIn(node: HTMLElement) {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('visible');
					observer.unobserve(node);
				}
			}
		},
		{
			rootMargin: '0px 0px -10% 0px',
			threshold: 0.1
		}
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
