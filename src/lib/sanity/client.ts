const PROJECT_ID = 'gxiivwaf';
const DATASET = 'production';
const API_VERSION = '2024-01-01';
const BASE_URL = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

export const client = {
	async fetch(query: string, params?: Record<string, string>) {
		const url = new URL(BASE_URL);
		url.searchParams.set('query', query);
		if (params) {
			for (const [key, value] of Object.entries(params)) {
				url.searchParams.set(`$${key}`, JSON.stringify(value));
			}
		}
		const res = await globalThis.fetch(url.toString());
		if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
		const json = await res.json();
		return json.result;
	}
};
