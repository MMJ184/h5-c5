import { Space, Tag, Typography } from 'antd';
// src/widgets/KpiWidget.tsx
import React from 'react';

const { Text } = Typography;

const KpiWidget: React.FC = () => {
	return (
		<Space direction="vertical">
			<Text strong>Total Builds Today: 42</Text>
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
