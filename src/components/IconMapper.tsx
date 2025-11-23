// src/components/IconMapper.tsx
import React from 'react';

import {
  HomeOutlined,
  PieChartOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

const ICON_MAP: Record<string, React.ReactNode> = {
  HomeOutlined: <HomeOutlined />,
  UserOutlined: <UserOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  PieChartOutlined: <PieChartOutlined />,
};

export function resolveIcon(name?: string) {
  if (!name) return undefined;
  return ICON_MAP[name] ?? undefined;
}
