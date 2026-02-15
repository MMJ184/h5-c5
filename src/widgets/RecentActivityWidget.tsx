import { List, Typography } from 'antd';
// src/widgets/RecentActivityWidget.tsx
import React from 'react';

import { useDashboardContext } from '../pages/dashboard/DashboardContext';

const { Text } = Typography;

const RecentActivityWidget: React.FC = () => {
	const { timeRange } = useDashboardContext();
	const data = [
		'User A pushed commit to main',
		'User B closed work item #1234',
		'Release 1.2.0 deployed to QA',
		'Bug #5678 re-opened by QA',
	];

	return (
		<>
			<Text type="secondary">Range: {timeRange.label}</Text>
			<List
				size="small"
				dataSource={data}
				renderItem={(item) => (
					<List.Item>
						<Text>{item}</Text>
					</List.Item>
				)}
			/>
		</>
	);
};

export default RecentActivityWidget;
