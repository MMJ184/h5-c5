import { Row, Col } from 'antd';
import dayjs from 'dayjs';

import { dateKey } from './calendar.utils';
import DayColumn from './DayColumn';
import TimeColumn from './TimeColumn';

import type { Appointment } from './calendar.types.ts';

interface Props {
	current: dayjs.Dayjs;
	appointments: Appointment[];
	onCreate: (dateTimeIso: string) => void;
	onEdit: (a: Appointment) => void;
}

export default function WeekView({ current, appointments, onCreate, onEdit }: Props) {
	const start = current.startOf('week');
	const days = Array.from({ length: 7 }).map((_, i) => start.add(i, 'day'));

	const byDate = new Map<string, Appointment[]>();
	appointments.forEach((a) => {
		const key = dateKey(a.date);
		if (!byDate.has(key)) byDate.set(key, []);
		byDate.get(key)!.push(a);
	});

	return (
		<>
			<Row style={{ marginLeft: 64 }}>
				{days.map((d) => (
					<Col key={d.format('YYYY-MM-DD')} style={{ flex: 1, textAlign: 'center' }}>
						<strong>{d.format('ddd')}</strong>
						<div>{d.format('MMM D')}</div>
					</Col>
				))}
			</Row>

			<div style={{ display: 'flex' }}>
				<TimeColumn />
				{days.map((d) => (
					<DayColumn
						key={d.format('YYYY-MM-DD')}
						day={d}
						appointments={byDate.get(dateKey(d)) ?? []}
						onCreate={onCreate}
						onEdit={onEdit}
					/>
				))}
			</div>
		</>
	);
}
