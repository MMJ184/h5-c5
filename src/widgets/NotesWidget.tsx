import { Typography } from 'antd';
// src/widgets/NotesWidget.tsx
import React from 'react';

import { useDashboardContext } from '../pages/dashboard/DashboardContext';

const { Text } = Typography;

const NotesWidget: React.FC = () => {
	const { timeRange } = useDashboardContext();
	return (
		<div>
			<Text type="secondary">Range: {timeRange.label}</Text>
			<Text type="secondary">Quick Notes:</Text>
			<ul style={{ paddingLeft: 18, marginTop: 8 }}>
				<li>Sync with DevOps team at 4 PM</li>
				<li>Check error spikes after deployment</li>
				<li>Prepare release notes</li>
			</ul>
		</div>
	);
};

export default NotesWidget;
