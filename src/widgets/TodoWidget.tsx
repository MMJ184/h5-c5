import { List, Space, Tag, Typography } from 'antd';
// src/widgets/TodoWidget.tsx
import React from 'react';

import { useDashboardContext } from '../pages/dashboard/DashboardContext';

const { Text } = Typography;

const TodoWidget: React.FC = () => {
	const { timeRange } = useDashboardContext();
	const data = [
		{ title: 'Fix flaky test in API project' },
		{ title: 'Review PR #204' },
		{ title: 'Prepare dashboard demo' },
	];

	return (
		<>
			<Text type="secondary">Range: {timeRange.label}</Text>
			<List
				size="small"
				dataSource={data}
				renderItem={(item) => (
					<List.Item>
						<Space>
							<Tag color="blue">TODO</Tag>
							<Text>{item.title}</Text>
						</Space>
					</List.Item>
				)}
			/>
		</>
	);
};

export default TodoWidget;
