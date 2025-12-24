import { Space, Tag, Typography } from 'antd';
// src/widgets/ServerHealthWidget.tsx
import React from 'react';

const { Text } = Typography;

const ServerHealthWidget: React.FC = () => {
	return (
		<Space direction="vertical">
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
