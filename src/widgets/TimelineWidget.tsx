import { Space, Typography } from 'antd';
// src/widgets/TimelineWidget.tsx
import React from 'react';

import { useDashboardContext } from '../pages/dashboard/DashboardContext';

const { Text } = Typography;

const TimelineWidget: React.FC = () => {
	const { timeRange } = useDashboardContext();
	return (
		<Space direction="vertical">
			<Text type="secondary">Range: {timeRange.label}</Text>
			<Text strong>Release Timeline</Text>
			<ul style={{ paddingLeft: 18 }}>
				<li>
					<Text>Sprint 25 End – 01 Dec</Text>
				</li>
				<li>
					<Text>Release 1.3.0 to QA – 03 Dec</Text>
				</li>
				<li>
					<Text>Production Freeze – 10 Dec</Text>
				</li>
			</ul>
		</Space>
	);
};

export default TimelineWidget;
