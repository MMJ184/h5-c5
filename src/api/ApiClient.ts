import axios, { AxiosError } from 'axios';

import { getTokens } from '../auth/auth.utils'; // adjust if your path differs

export interface ApiError {
	status: number;
	message: string;
	data?: unknown;
}

const ApiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? '/', // real API later, "/" for same-origin
	timeout: 10_000,
	headers: { 'Content-Type': 'application/json' },
});

// ---------- AUTH HEADER ----------
ApiClient.interceptors.request.use((config) => {
	const tokens = getTokens?.();
	if (tokens?.accessToken) {
		config.headers = config.headers ?? {};
		config.headers.Authorization = `Bearer ${tokens.accessToken}`;
	}
	return config;
});

// ---------- OPTIONAL MOCK INTERCEPTOR FOR DEV ----------
if (import.meta.env.DEV) {
	ApiClient.interceptors.request.use((config) => {
		const url = config.url ?? '';
		if (config.method === 'get' && (url === '/patients' || url === 'patients')) {
			const mockUrl = '/mock/patients.json';

			config.adapter = async () => {
				try {
					const res = await fetch(mockUrl, { signal: config.signal as any });
					const json = await res.json();

					return {
						data: json,
						status: 200,
						statusText: 'OK',
						headers: {},
						config,
						request: null,
					};
				} catch (e: any) {
					return {
						data: null,
						status: 0,
						statusText: e?.message ?? 'Network error',
						headers: {},
						config,
						request: null,
					};
				}
			};
		}

		return config;
	});
}

// ---------- RESPONSE NORMALIZATION ----------
ApiClient.interceptors.response.use(
	(res) => res,
	(err: AxiosError) => {
		const status = err.response?.status ?? 0;
		const data = err.response?.data;

		const message =
			(typeof data === 'object' && data && 'message' in (data as any) ? String((data as any).message) : err.message) ||
			'Network error';

		const apiErr: ApiError = { status, message, data };
		return Promise.reject(apiErr);
	},
);

export default ApiClient;
