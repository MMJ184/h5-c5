import {
	PieChartOutlined,
	UserOutlined,
	TeamOutlined,
	CalendarOutlined,
	MedicineBoxOutlined,
	WalletOutlined,
	BarChartOutlined,
	SettingOutlined,
} from '@ant-design/icons';
// src/components/IconMapper.tsx
import React from 'react';

/**
 * Central icon resolver for dynamic menu rendering.
 * Icon names must match backend/menu JSON exactly.
 */
const ICON_MAP: Record<string, React.ReactNode> = {
	PieChartOutlined: <PieChartOutlined />,
	UserOutlined: <UserOutlined />,
	TeamOutlined: <TeamOutlined />,
	CalendarOutlined: <CalendarOutlined />,
	MedicineBoxOutlined: <MedicineBoxOutlined />,
	WalletOutlined: <WalletOutlined />,
	BarChartOutlined: <BarChartOutlined />,
	SettingOutlined: <SettingOutlined />,
};

/**
 * Resolve icon by string name.
 * Returns undefined if icon is not registered.
 */
export function resolveIcon(name?: string): React.ReactNode | undefined {
	if (!name) return undefined;
	return ICON_MAP[name];
}
