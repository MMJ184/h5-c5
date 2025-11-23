// src/App.tsx
import { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import AppShell from './components/AppShell';
import Prefetcher from './components/Prefetcher';
import RoutesFromMenu from './components/RoutesFromMenu';
import { useMenu } from './hooks/useMenu';
import { ThemeProvider } from './theme/ThemeProvider';
import { findItemByKey, findKeyByPath } from './utils/menuHelpers';

/**
 * MENU_URL:
 * - development: point to public/mock/menu.json (recommended)
 * - temporary uploaded file (this environment): use platform-local path
 *
 * The platform will transform this local path into a served URL.
 */
const MENU_URL = '/mock/menu.json';
// If you prefer the mock file in public folder, set:
// const MENU_URL = "/mock/menu.json";

export default function App() {
  // load menu
  const { items: menuItems, loading: menuLoading } = useMenu(MENU_URL);

  // selection & navigation wiring for AppShell
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!menuItems) return;
    const k = findKeyByPath(menuItems, location.pathname);
    setSelectedKey(k ?? undefined);
  }, [menuItems, location.pathname]);

  function handleMenuSelect(key: string) {
    if (!menuItems) return;
    const item = findItemByKey(menuItems, key);
    if (item?.path) {
      navigate(item.path);
    } else if (key.startsWith('/')) {
      navigate(key);
    }
  }

  return (
    <ThemeProvider>
      {/* launcher that triggers prefetch for flagged pages */}
      <Prefetcher menuItems={menuItems} />

      {/* top-level layout (sider + header) — now the AppShell renders routes via children */}
      <AppShell
        menuItems={menuItems}
        menuLoading={menuLoading}
        onMenuSelect={handleMenuSelect}
        menuSelectedKey={selectedKey}
      >
        {/* RoutesFromMenu is mounted as child so route elements render in Content */}
        <RoutesFromMenu menuItems={menuItems} />
      </AppShell>
    </ThemeProvider>
  );
}
