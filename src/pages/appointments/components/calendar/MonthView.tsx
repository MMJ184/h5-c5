import { Calendar, Tooltip } from 'antd';
import dayjs from 'dayjs';

import { dateKey } from './calendar.utils';

import type { Appointment } from '../../hooks/useAppointments.ts';
import type { CalendarProps } from 'antd';

interface Props {
	current: dayjs.Dayjs;
	appointments: Appointment[];
	onChange: (d: dayjs.Dayjs) => void;
	onEdit: (a: Appointment) => void;
}

export default function MonthView({ current, appointments, onChange, onEdit }: Props) {
	// group appointments by date
	const byDate = new Map<string, Appointment[]>();
	appointments.forEach((a) => {
		const key = dateKey(a.date);
		if (!byDate.has(key)) byDate.set(key, []);
		byDate.get(key)!.push(a);
	});

	const cellRender: CalendarProps['cellRender'] = (date, info) => {
		if (info.type !== 'date') return info.originNode;

		const list = byDate.get(dateKey(date)) ?? [];
		if (!list.length) return null;

		return (
			<div style={{ marginTop: 4 }}>
				{list.slice(0, 3).map((a) => (
					<Tooltip key={a.id} title={`${a.time ?? ''} ${a.title} (${a.patientName})`}>
						<div
							onClick={(e) => {
								e.stopPropagation(); // prevent date select
								onEdit(a);
							}}
							style={{
								fontSize: 11,
								lineHeight: '16px',
								padding: '0 4px',
								marginBottom: 2,
								borderRadius: 4,
								background: a.color ?? '#1677ff',
								color: '#fff',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								cursor: 'pointer',
							}}
						>
							{a.time ? `${a.time} ` : ''}
							{a.title}
						</div>
					</Tooltip>
				))}

				{list.length > 3 && (
					<div
						style={{
							fontSize: 11,
							color: '#888',
							cursor: 'pointer',
						}}
						onClick={(e) => {
							e.stopPropagation();
							onChange(date); // switch to day view if needed
						}}
					>
						+{list.length - 3} more
					</div>
				)}
			</div>
		);
	};

	return <Calendar value={current} onSelect={onChange} onPanelChange={onChange} cellRender={cellRender} fullscreen />;
}
