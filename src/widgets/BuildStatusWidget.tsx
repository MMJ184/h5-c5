import { List, Space, Tag, Typography } from 'antd';
// src/widgets/BuildStatusWidget.tsx
import React from 'react';

import { useDashboardContext } from '../pages/dashboard/DashboardContext';

const { Text } = Typography;

const BuildStatusWidget: React.FC = () => {
	const { timeRange } = useDashboardContext();
	const data = [
		{ name: 'CI - WebApp', status: 'Success', branch: 'main' },
		{ name: 'CI - API', status: 'Failed', branch: 'develop' },
		{ name: 'CD - Prod', status: 'Running', branch: 'release/1.0' },
	];

	return (
		<>
			<Text type="secondary">Range: {timeRange.label}</Text>
			<List
				size="small"
				dataSource={data}
				renderItem={(item) => (
					<List.Item>
						<Space direction="vertical" style={{ width: '100%' }}>
							<Space style={{ justifyContent: 'space-between', width: '100%' }}>
								<Text strong>{item.name}</Text>
								<Tag color={item.status === 'Success' ? 'green' : item.status === 'Failed' ? 'red' : 'blue'}>
									{item.status}
								</Tag>
							</Space>
							<Text type="secondary">Branch: {item.branch}</Text>
						</Space>
					</List.Item>
				)}
			/>
		</>
	);
};

export default BuildStatusWidget;
