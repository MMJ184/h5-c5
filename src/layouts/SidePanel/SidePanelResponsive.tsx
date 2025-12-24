import { Drawer, Layout, Menu, theme as antdTheme } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { router } from '../../app/router';
import { resolveIcon } from '../../navigation/IconMapper';
import { findItemByKey } from '../../navigation/menuHelpers';

import type { RawMenuItem } from '../../navigation/menu.types';
import type { MenuProps } from 'antd';

const { Sider } = Layout;
const { useToken } = antdTheme;

export interface SidePanelResponsiveProps {
	collapsed: boolean;
	onToggleCollapse: () => void;
	selectedKey?: string;
	onSelectKey?: (key: string) => void;
	breakpointPx?: number;
	mobileOpen?: boolean;
	setMobileOpen?: (open: boolean) => void;
	menuItems?: RawMenuItem[] | null;
}

type AntMenuItem = Required<MenuProps>['items'][number];

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

	const [isMobile, setIsMobile] = useState<boolean>(() => {
		if (typeof window === 'undefined') return false;
		return window.matchMedia(`(max-width: ${breakpointPx}px)`).matches;
	});

	const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
	const drawerOpenEffective = typeof mobileOpen === 'boolean' ? mobileOpen : internalDrawerOpen;

	const setDrawerOpenEffective = useCallback(
		(v: boolean) => {
			if (typeof setMobileOpen === 'function') setMobileOpen(v);
			else setInternalDrawerOpen(v);
		},
		[setMobileOpen],
	);

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

	useEffect(() => {
		if (!isMobile) setDrawerOpenEffective(false);
	}, [isMobile, setDrawerOpenEffective]);

	const siderWidth = 240;
	const collapsedWidth = 64;

	const prefetch = useCallback(
		(key: string) => {
			if (!menuItems) return;
			const item = findItemByKey(menuItems, key);
			if (item?.path) router.preloadRoute({ to: item.path });
		},
		[menuItems],
	);

	const onMenuClick = useCallback(
		({ key }: { key: string }) => {
			onSelectKey?.(key);

			if (!menuItems) return;
			const item = findItemByKey(menuItems, key);

			if (item?.path) {
				router.navigate({ to: item.path });
				if (isMobile) setDrawerOpenEffective(false);
			}
		},
		[onSelectKey, menuItems, isMobile, setDrawerOpenEffective],
	);

	const buildMenuNodes = useCallback(
		(items?: RawMenuItem[] | null): AntMenuItem[] => {
			if (!items?.length) return [];

			return items.map((it) => {
				const key = String(it.key);

				const labelNode = (
					<span
						onMouseEnter={() => prefetch(key)}
						onFocus={() => prefetch(key)}
						style={{ display: 'inline-block', width: '100%' }}
					>
						{it.label ?? it.key}
					</span>
				);

				const node: any = {
					key,
					label: labelNode,
					icon: resolveIcon(it.icon),
				};

				if (it.children?.length) node.children = buildMenuNodes(it.children);

				return node as AntMenuItem;
			});
		},
		[prefetch],
	);

	const menuNodes = useMemo(() => buildMenuNodes(menuItems), [buildMenuNodes, menuItems]);

	const menu = useMemo(
		() => (
			<Menu
				mode="inline"
				selectedKeys={selectedKey ? [selectedKey] : []}
				onClick={(info) => onMenuClick({ key: String(info.key) })}
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
		[selectedKey, onMenuClick, menuNodes, token.colorBgContainer, token.colorText],
	);

	if (isMobile) {
		return (
			<>
				<Drawer
					title={<div style={{ fontWeight: 700 }}>Ant Demo</div>}
					placement="left"
					onClose={() => setDrawerOpenEffective(false)}
					open={drawerOpenEffective}
					size={siderWidth} // ✅ correct prop
					destroyOnClose={false} // ✅ correct prop (and keeps menu mounted)
					styles={{
						body: { padding: 0, background: token.colorBgContainer },
						header: { background: token.colorBgElevated },
						mask: { background: 'rgba(0,0,0,0.25)' },
					}}
				>
					<div style={{ height: 64 }} />
					{menu}
				</Drawer>

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
