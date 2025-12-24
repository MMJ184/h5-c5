import { AppstoreOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
// src/widgets/ChartPlaceholderWidget.tsx
import React from 'react';

const { Text } = Typography;

const ChartPlaceholderWidget: React.FC = () => {
	return (
		<div
			style={{
				height: '100%',
				border: '1px dashed #d9d9d9',
				borderRadius: 4,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontStyle: 'italic',
			}}
		>
			<Space direction="vertical" align="center">
				<AppstoreOutlined style={{ fontSize: 28 }} />
				<Text type="secondary">Chart goes here (connect real data later)</Text>
			</Space>
		</div>
	);
};

export default ChartPlaceholderWidget;
