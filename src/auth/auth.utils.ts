import type { Tokens } from './auth.types';

const TOKENS_KEY = 'app_tokens';

export function getTokens(): Tokens | null {
	const raw = localStorage.getItem(TOKENS_KEY);
	return raw ? (JSON.parse(raw) as Tokens) : null;
}

export function setTokens(tokens: Tokens) {
	localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
	localStorage.removeItem(TOKENS_KEY);
}
