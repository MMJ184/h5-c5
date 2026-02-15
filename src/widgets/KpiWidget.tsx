import { Space, Tag, Typography } from 'antd';
// src/widgets/KpiWidget.tsx
import React from 'react';

import { useDashboardContext } from '../pages/dashboard/DashboardContext';

const { Text } = Typography;

const KpiWidget: React.FC = () => {
	const { timeRange } = useDashboardContext();
	return (
		<Space direction="vertical">
			<Text type="secondary">Range: {timeRange.label}</Text>
			<Text strong>Total Builds: 42</Text>
			<Text type="success">Successful: 39</Text>
			<Text type="danger">Failed: 3</Text>
			<Space>
				<Tag color="green">Prod: Healthy</Tag>
				<Tag color="blue">QA: Ok</Tag>
				<Tag color="orange">Dev: Busy</Tag>
			</Space>
		</Space>
	);
};

export default KpiWidget;
