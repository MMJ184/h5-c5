export interface User {
	id: string;
	name: string;
	email: string;
	roles?: string[];
}

export interface Tokens {
	accessToken: string;
	refreshToken?: string;
}

export interface AuthState {
	user: User | null;
	tokens: Tokens | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export type AuthContextValue = AuthState & {
	login: (payload: LoginPayload) => Promise<void>;
	logout: () => void;
};
