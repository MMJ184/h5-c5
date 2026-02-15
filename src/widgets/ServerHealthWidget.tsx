import { Space, Tag, Typography } from 'antd';
// src/widgets/ServerHealthWidget.tsx
import React from 'react';

import { useDashboardContext } from '../pages/dashboard/DashboardContext';

const { Text } = Typography;

const ServerHealthWidget: React.FC = () => {
	const { timeRange } = useDashboardContext();
	return (
		<Space direction="vertical">
			<Text type="secondary">Range: {timeRange.label}</Text>
			<Space>
				<Tag color="green">API</Tag>
				<Text type="success">Healthy · 45ms avg</Text>
			</Space>
			<Space>
				<Tag color="green">DB</Tag>
				<Text type="success">Healthy · CPU 35%</Text>
			</Space>
			<Space>
				<Tag color="orange">Worker</Tag>
				<Text type="warning">Delayed · Queue size: 120</Text>
			</Space>
		</Space>
	);
};

export default ServerHealthWidget;
