// src/components/AppShell.tsx
import React, { useEffect, useState } from 'react';

import { Button, Layout, Space, Typography, theme as antdTheme } from 'antd';

import { MenuFoldOutlined, MenuUnfoldOutlined, BgColorsOutlined } from '@ant-design/icons';

import type { RawMenuItem } from '../services/MenuServiceTypes.ts';
import { useTheme } from '../theme/ThemeProvider';
import SidePanelResponsive from './SidePanelResponsive';
import ThemePanel from './ThemePanel';

const { Header, Content } = Layout;
const { Title } = Typography;

type Props = {
  menuItems?: RawMenuItem[] | null;
  menuLoading?: boolean;
  onMenuSelect?: (key: string) => void;
  menuSelectedKey?: string | undefined;
  children?: React.ReactNode; // route outlet will be passed here
};

export default function AppShell({ menuItems, onMenuSelect, menuSelectedKey, children }: Props) {
  const { dark, toggleDark, primary, setPrimary } = useTheme();
  const { token } = antdTheme.useToken();

  const BREAKPOINT_PX = 992;
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia(`(max-width: ${BREAKPOINT_PX}px)`).matches,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // theme drawer state
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT_PX}px)`);
    const handler = (ev: MediaQueryListEvent) => setIsMobile(ev.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    setIsMobile(mq.matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SidePanelResponsive
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        selectedKey={menuSelectedKey}
        onSelectKey={(k) => onMenuSelect?.(k)}
        breakpointPx={BREAKPOINT_PX}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        menuItems={menuItems ?? []}
      />

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: token.colorBgContainer,
            color: token.colorText,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              onClick={() => {
                if (isMobile) setMobileOpen(true);
                else setCollapsed((c) => !c);
              }}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                height: 40,
                width: 40,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                color: token.colorText,
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>

            <Title level={5} style={{ margin: 0, color: token.colorText }}>

            </Title>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Space align="center">
              {/* Theme panel opener */}
              <Button
                type="default"
                icon={<BgColorsOutlined />}
                onClick={() => setThemeOpen(true)}
                aria-label="Open theme settings"
              >
                Theme
              </Button>
            </Space>
          </div>
        </Header>

        <Content style={{ margin: 16 }}>
          {/* THIS IS THE IMPORTANT PART — render route outlet (children) here */}
          <div style={{ marginTop: 16 }}>{children}</div>
        </Content>
      </Layout>

      <ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </Layout>
  );
}
