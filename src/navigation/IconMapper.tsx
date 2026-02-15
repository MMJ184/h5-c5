import {
	BookOutlined,
	CalendarOutlined,
	CheckCircleOutlined,
	ExperimentOutlined,
	FileDoneOutlined,
	FileTextOutlined,
	FormOutlined,
	HeartOutlined,
	PieChartOutlined,
	ProfileOutlined,
	SafetyCertificateOutlined,
	SettingOutlined,
	SoundOutlined,
	UserOutlined,
	UserSwitchOutlined,
	TeamOutlined,
	MedicineBoxOutlined,
	WalletOutlined,
	BarChartOutlined,
	WarningOutlined,
	BugOutlined,
} from '@ant-design/icons';
// src/components/IconMapper.tsx
import React from 'react';

/**
 * Central icon resolver for dynamic menu rendering.
 * Icon names must match backend/menu JSON exactly.
 */
const ICON_MAP: Record<string, React.ReactNode> = {
	BookOutlined: <BookOutlined />,
	CalendarOutlined: <CalendarOutlined />,
	CheckCircleOutlined: <CheckCircleOutlined />,
	ExperimentOutlined: <ExperimentOutlined />,
	FileDoneOutlined: <FileDoneOutlined />,
	FileTextOutlined: <FileTextOutlined />,
	FormOutlined: <FormOutlined />,
	HeartOutlined: <HeartOutlined />,
	PieChartOutlined: <PieChartOutlined />,
	ProfileOutlined: <ProfileOutlined />,
	SafetyCertificateOutlined: <SafetyCertificateOutlined />,
	SettingOutlined: <SettingOutlined />,
	SoundOutlined: <SoundOutlined />,
	UserOutlined: <UserOutlined />,
	UserSwitchOutlined: <UserSwitchOutlined />,
	TeamOutlined: <TeamOutlined />,
	MedicineBoxOutlined: <MedicineBoxOutlined />,
	WalletOutlined: <WalletOutlined />,
	BarChartOutlined: <BarChartOutlined />,
	WarningOutlined: <WarningOutlined />,
	BugOutlined: <BugOutlined />,
};

/**
 * Resolve icon by string name.
 * Returns undefined if icon is not registered.
 */
export function resolveIcon(name?: string): React.ReactNode | undefined {
	if (!name) return undefined;
	return ICON_MAP[name];
}
