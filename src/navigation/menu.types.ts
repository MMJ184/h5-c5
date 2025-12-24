// src/services/MenuServiceTypes.ts

/**
 * Meta information for a menu item.
 */
export interface MenuMeta {
	title?: string;
	[key: string]: any;
}

/**
 * Raw menu item returned by backend (or mock JSON).
 * This shape is used everywhere in your system:
 * - SidePanel
 * - Router generation
 * - Prefetcher
 * - Menu normalization
 */
export interface RawMenuItem {
	key: string;
	label: string;

	icon?: string; // "HomeOutlined", "UserOutlined", etc.
	path?: string; // Optional route path
	component?: string; // "Index" => src/pages/index.tsx

	prefetch?: boolean;
	authRequired?: boolean;
	permissions?: string[];
	meta?: MenuMeta;

	roles?: string[];
	children?: RawMenuItem[];
}
