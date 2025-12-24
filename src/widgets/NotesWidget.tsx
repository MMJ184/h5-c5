import { Typography } from 'antd';
// src/widgets/NotesWidget.tsx
import React from 'react';

const { Text } = Typography;

const NotesWidget: React.FC = () => {
	return (
		<div>
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
