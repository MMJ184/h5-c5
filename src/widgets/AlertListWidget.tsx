import { List, Space, Tag, Typography } from 'antd';
// src/widgets/AlertListWidget.tsx
import React from 'react';

const { Text } = Typography;

const AlertListWidget: React.FC = () => {
	const data = [
		{ title: 'High error rate on API', severity: 'High' },
		{ title: 'Queue length above threshold', severity: 'Medium' },
		{ title: 'Stale deployments in Dev', severity: 'Low' },
	];

	return (
		<List
			size="small"
			dataSource={data}
			renderItem={(item) => (
				<List.Item>
					<Space direction="vertical">
						<Space>
							<Tag color={item.severity === 'High' ? 'red' : item.severity === 'Medium' ? 'orange' : 'blue'}>
								{item.severity}
							</Tag>
							<Text>{item.title}</Text>
						</Space>
					</Space>
				</List.Item>
			)}
		/>
	);
};

export default AlertListWidget;
