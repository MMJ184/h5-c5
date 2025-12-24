import { Space, Tag, Typography } from 'antd';
// src/widgets/TeamSummaryWidget.tsx
import React from 'react';

const { Text } = Typography;

const TeamSummaryWidget: React.FC = () => {
	return (
		<Space direction="vertical">
			<Text strong>Team Status</Text>
			<Space>
				<Tag color="green">3 Online</Tag>
				<Tag color="blue">2 In Meeting</Tag>
				<Tag color="default">1 Offline</Tag>
			</Space>
			<Text type="secondary">Next standup: Today 10:00 AM</Text>
		</Space>
	);
};

export default TeamSummaryWidget;
