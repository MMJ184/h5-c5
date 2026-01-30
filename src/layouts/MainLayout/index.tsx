import { BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BgColorsOutlined } from '@ant-design/icons';
import { Outlet, useRouter, useRouterState } from '@tanstack/react-router';
import { Badge, Button, Layout, Space, Typography, theme as antdTheme } from 'antd';
import React, { useEffect, useState } from 'react';

import { useTheme } from '../../app/providers/ThemeProvider';
import MenuPrefetcher from '../../app/router/MenuPrefetcher.tsx';
import NotificationPanel from '../../components/NotificationPanel';
import { useNotifications } from '../../app/providers/NotificationProvider';
import ThemePanel from '../../components/ThemePanel';
import { findItemByKey, findKeyByPath } from '../../navigation/menuHelpers.ts';
import { useMenu } from '../../navigation/useMenu.ts';
import SidePanelResponsive from '../SidePanel/SidePanelResponsive.tsx';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function MainLayout() {
	const pathname11 = useRouterState({ select: (s) => s.location.pathname });
	console.log('ROUTE:', pathname11);

	/* ---------------- theme ---------------- */
	const { token } = antdTheme.useToken();
	const { dark, toggleDark, primary, setPrimary } = useTheme();

	/* ---------------- menu ---------------- */
	const { items: menuItems } = useMenu();

	const router = useRouter();
	const pathname = useRouterState({
		select: (s) => s.location.pathname,
	});

	const selectedKey = menuItems ? findKeyByPath(menuItems, pathname) : undefined;

	function handleMenuSelect(key: string) {
		if (!menuItems) return;
		const item = findItemByKey(menuItems, key);
		if (item?.path) {
			router.navigate({ to: item.path });
		}
	}

	/* ---------------- responsive ---------------- */
	const BREAKPOINT_PX = 992;
	const [collapsed, setCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState<boolean>(() =>
		typeof window === 'undefined' ? false : window.matchMedia(`(max-width: ${BREAKPOINT_PX}px)`).matches,
	);
	const [mobileOpen, setMobileOpen] = useState(false);

	/* ---------------- theme panel ---------------- */
	const [themeOpen, setThemeOpen] = useState(false);
	const [notificationOpen, setNotificationOpen] = useState(false);
	const { notifications, markAllRead, markRead } = useNotifications();

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

	/* ---------------- render ---------------- */
	return (
		<>
			{/* Prefetch routes marked in menu.json */}
			<MenuPrefetcher menuItems={menuItems} />

			<Layout style={{ minHeight: '100vh' }}>
				<SidePanelResponsive
					collapsed={collapsed}
					onToggleCollapse={() => setCollapsed((c) => !c)}
					selectedKey={selectedKey}
					onSelectKey={handleMenuSelect}
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
								{/* optional page title */}
							</Title>
						</div>

						<Space align="center">
							<Button
								type="text"
								aria-label="Open notifications"
								onClick={() => setNotificationOpen(true)}
								style={{
									height: 40,
									width: 40,
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: 8,
								}}
							>
								<Badge count={notifications.filter((n) => !n.read).length} size="small">
									<BellOutlined style={{ fontSize: 18, color: token.colorText }} />
								</Badge>
							</Button>
							<Button
								type="default"
								icon={<BgColorsOutlined />}
								onClick={() => setThemeOpen(true)}
								aria-label="Open theme settings"
							>
								Theme
							</Button>
						</Space>
					</Header>

					<Content style={{ margin: 16 }}>
						{/* ✅ TanStack Router renders pages here */}
						<div style={{ marginTop: 16 }}>
							<Outlet />
						</div>
					</Content>
				</Layout>

				<ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
				<NotificationPanel
					open={notificationOpen}
					onClose={() => setNotificationOpen(false)}
					notifications={notifications}
					onMarkAllRead={markAllRead}
					onMarkRead={markRead}
				/>
			</Layout>
		</>
	);
}
