import { List, Space, Tag, Typography } from 'antd';
// src/widgets/TodoWidget.tsx
import React from 'react';

const { Text } = Typography;

const TodoWidget: React.FC = () => {
	const data = [
		{ title: 'Fix flaky test in API project' },
		{ title: 'Review PR #204' },
		{ title: 'Prepare dashboard demo' },
	];

	return (
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
	);
};

export default TodoWidget;
