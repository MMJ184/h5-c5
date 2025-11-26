import { useEffect, useMemo, useState } from 'react';

import { Drawer, Layout, Menu, theme as antdTheme } from 'antd';

import type { RawMenuItem } from '../services/MenuServiceTypes.ts';
// import type { RawMenuItem } from "../services/MenuService";
import { resolveIcon } from './IconMapper';

const { Sider } = Layout;
const { useToken } = antdTheme;

export type SidePanelResponsiveProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedKey?: string;
  onSelectKey?: (key: string) => void;
  breakpointPx?: number;
  // lifted mobile state (optional). If not provided, component will manage drawer internally.
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  // dynamic items from API (optional)
  menuItems?: RawMenuItem[] | null;
};

export default function SidePanelResponsive({
  collapsed,
  selectedKey,
  onSelectKey,
  breakpointPx = 992,
  mobileOpen,
  setMobileOpen,
  menuItems,
}: SidePanelResponsiveProps) {
  const { token } = useToken();

  // detect mobile by media query
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpointPx}px)`).matches;
  });

  // internal drawer state used only if parent doesn't control mobileOpen
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const drawerOpenEffective = typeof mobileOpen === 'boolean' ? mobileOpen : internalDrawerOpen;
  const setDrawerOpenEffective = (v: boolean) => {
    if (typeof setMobileOpen === 'function') setMobileOpen(v);
    else setInternalDrawerOpen(v);
  };

  // media query listener
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const handler = (ev: MediaQueryListEvent) => setIsMobile(ev.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    setIsMobile(mq.matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, [breakpointPx]);

  // close drawer automatically when leaving mobile
  useEffect(() => {
    if (!isMobile) setDrawerOpenEffective(false);
  }, [isMobile]);

  // layout sizing
  const siderWidth = 240;
  const collapsedWidth = 64;

  // Build Ant Menu items from RawMenuItem[] using icon mapper
  const buildMenuNodes = (items?: RawMenuItem[] | null) => {
    if (!items || items.length === 0) return [];
    return items.map((it) => {
      const node: any = {
        key: String(it.key),
        label: it.label ?? it.key,
        icon: resolveIcon(it.icon),
      };
      if (Array.isArray(it.children) && it.children.length > 0) {
        node.children = buildMenuNodes(it.children);
      }
      return node;
    });
  };

  const menuNodes = useMemo(() => buildMenuNodes(menuItems), [menuItems]);

  const menu = useMemo(
    () => (
      <Menu
        mode="inline"
        selectedKeys={selectedKey ? [selectedKey] : []}
        onClick={({ key }) => onSelectKey?.(String(key))}
        items={menuNodes}
        style={{
          height: 'calc(100% - 64px)',
          borderRight: 0,
          background: token.colorBgContainer,
          color: token.colorText,
        }}
        rootClassName="app-side-menu"
      />
    ),
    [selectedKey, onSelectKey, token.colorBgContainer, token.colorText, menuNodes],
  );

  // Mobile: Drawer overlay
  if (isMobile) {
    return (
      <>
        <Drawer
          title={<div style={{ fontWeight: 700 }}>Ant Demo</div>}
          placement="left"
          onClose={() => setDrawerOpenEffective(false)}
          open={drawerOpenEffective}

          // use `size` for width (accepts 'default' | 'large' | number)
          size={siderWidth}

          // per-area styling moved into `styles`
          styles={{
            body: { padding: 0, background: token.colorBgContainer },    // replaces bodyStyle
            header: { background: token.colorBgElevated },               // replaces headerStyle
            // content: { /* optional: tuning for panel wrapper */ },       // e.g. maxWidth, padding
            mask: { background: 'rgba(0,0,0,0.25)' },                    // replaces maskStyle
          }}

          // keep destroyOnHidden behavior (v5+ prop)
          destroyOnHidden={false}
        >
          <div style={{ height: 64 }} />
          {menu}
        </Drawer>

        {/* invisible placeholder to keep layout alignment when header toggle exists */}
        <div
          style={{
            width: collapsed ? collapsedWidth : 0,
            minWidth: collapsed ? collapsedWidth : 0,
            transition: 'width .2s',
            flex: '0 0 auto',
          }}
          aria-hidden
        />
      </>
    );
  }

  // Desktop: Sider
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={siderWidth}
      collapsedWidth={collapsedWidth}
      style={{
        background: token.colorBgContainer,
        boxShadow: token.boxShadow || undefined,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: collapsed ? '0' : '0 16px',
        }}
      >
        <div
          aria-hidden
          style={{
            width: collapsed ? 60 : 160,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: token.borderRadius,
            background: token.colorFillAlter || token.colorBgElevated,
            color: token.colorText,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {collapsed ? 'HC' : 'H5 C3'}
        </div>
      </div>

      {menu}
    </Sider>
  );
}
