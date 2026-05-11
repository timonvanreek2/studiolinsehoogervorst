let activeView = $state<'selected' | 'index'>('selected');
let imageDark = $state(true);

export function getActiveView() {
	return activeView;
}

export function setActiveView(view: 'selected' | 'index') {
	activeView = view;
}

export function getImageDark() {
	return imageDark;
}

export function setImageDark(dark: boolean) {
	imageDark = dark;
}
