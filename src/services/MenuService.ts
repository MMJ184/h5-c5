// src/services/MenuService.ts
import ApiClient from '../api/ApiClient';
import type { RawMenuItem } from './MenuServiceTypes';

/**
 * MenuService:
 * 1. Fetch JSON safely from URL
 * 2. Normalize to consistent RawMenuItem structure
 */
export const MenuService = {
  /**
   * Fetch raw JSON for menu.
   * Supports:
   * - direct array
   * - string JSON
   * - object containing an array somewhere inside
   * - object with data: []
   */
  async fetchMenu(url: string): Promise<RawMenuItem[]> {
    const res = await ApiClient.get(url, { responseType: 'text' });

    let payload: any = res.data;

    // Add this debug line (temporary)
    try {
      console.debug(
        '[MenuService] fetched raw response:',
        typeof payload === 'string' ? payload.slice(0, 1000) : payload,
      );
    } catch (e) {
      console.debug('[MenuService] fetched raw response (unprintable)', e);
    }

    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        throw new Error(`MenuService.fetchMenu: response is not valid JSON (url: ${url})`);
      }
    }

    if (Array.isArray(payload)) return payload as RawMenuItem[];

    if (payload?.data && Array.isArray(payload.data)) {
      return payload.data as RawMenuItem[];
    }

    const arr = Object.values(payload || {}).find((v) => Array.isArray(v));
    if (Array.isArray(arr)) return arr as RawMenuItem[];

    throw new Error(`Unexpected menu payload shape`);
  },

  /**
   * Ensure menu items have consistent structure.
   */
  normalize(items: RawMenuItem[]): RawMenuItem[] {
    return items.map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon ?? undefined,
      path: item.path ?? undefined,
      component: item.component ?? undefined,
      prefetch: item.prefetch ?? false,
      authRequired: item.authRequired ?? false,
      permissions: item.permissions ?? [],
      meta: item.meta ?? {},
      roles: item.roles ?? [],
      children: item.children ? this.normalize(item.children) : undefined,
    }));
  },
};
