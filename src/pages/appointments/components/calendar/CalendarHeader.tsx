import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Segmented, Space, Typography } from 'antd';
import dayjs from 'dayjs';

import type { ViewMode } from './calendar.types.ts';

const { Text } = Typography;

interface Props {
	view: ViewMode;
	current: dayjs.Dayjs;
	isMobile: boolean;
	onViewChange: (v: ViewMode) => void;
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
	onCreateNow: () => void;
}

export default function CalendarHeader({
	view,
	current,
	isMobile,
	onViewChange,
	onPrev,
	onNext,
	onToday,
	onCreateNow,
}: Props) {
	return (
		<Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
			<Col>
				<Space>
					<Button onClick={onPrev} icon={<LeftOutlined />} />
					<Button onClick={onToday}>Today</Button>
					<Button onClick={onNext} icon={<RightOutlined />} />
					<Text strong>{current.format('MMM D, YYYY')}</Text>
				</Space>
			</Col>

			<Col>
				<Space>
					<Segmented<ViewMode>
						value={view}
						onChange={(v) => onViewChange(v)}
						options={[
							{ label: 'Day', value: 'day' },
							{ label: 'Week', value: 'week', disabled: isMobile },
							{ label: 'Month', value: 'month' },
						]}
					/>
					<Button type="primary" icon={<PlusOutlined />} onClick={onCreateNow}>
						New
					</Button>
				</Space>
			</Col>
		</Row>
	);
}
