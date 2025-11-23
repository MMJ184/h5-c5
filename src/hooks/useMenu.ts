// src/hooks/useMenu.ts  (DEBUG - use this temporarily)
import { useEffect, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { MenuService } from '../services/MenuService';
import type { RawMenuItem } from '../services/MenuServiceTypes';
import { filterMenuByAccess } from '../utils/menuAccess';

/**
 * Debugging useMenu:
 * - uses console.log (not debug) so messages always appear
 * - logs network/normalized/filtered shapes
 * - dependencies stringify roles/permissions
 */
export function useMenu(url: string) {
  const auth = useAuth(); // keep the object to inspect
  const roles = auth?.roles ?? [];
  const permissions = auth?.permissions ?? [];

  // Expose both raw (normalized) and filtered items
  const [rawItems, setRawItems] = useState<RawMenuItem[] | null>(null);
  const [items, setItems] = useState<RawMenuItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // immediate quick check so we know this hook file is loaded
  console.log('[useMenu] hook mounted - url:', url, 'auth:', {
    roles,
    permissions,
    isAuthenticated: auth?.isAuthenticated,
  });

  useEffect(() => {
    let active = true;
    console.log(
      '[useMenu] start loading menu for url:',
      url,
      'roles:',
      roles,
      'perms:',
      permissions,
    );

    (async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('[useMenu] calling MenuService.fetchMenu()');
        const raw = await MenuService.fetchMenu(url);
        console.log('[useMenu] MenuService.fetchMenu -> raw response:', raw);

        const normalized = MenuService.normalize(raw);
        console.log('[useMenu] normalized:', normalized);

        const filtered = filterMenuByAccess(normalized, roles ?? [], permissions ?? []);
        console.log('[useMenu] filtered by access:', filtered);

        if (!active) {
          console.log('[useMenu] component unmounted before setState, aborting');
          return;
        }

        setRawItems(normalized);
        setItems(filtered);
      } catch (err: any) {
        console.error('[useMenu] menu load error:', err);
        if (active) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (active) setLoading(false);
        console.log('[useMenu] finished loading (active:', active, ')');
      }
    })();

    return () => {
      active = false;
      console.log('[useMenu] cleanup - active set false');
    };
    // stringify roles/permissions so effect re-runs when they change content
  }, [url, JSON.stringify(roles), JSON.stringify(permissions)]);

  return { rawItems, items, loading, error };
}
