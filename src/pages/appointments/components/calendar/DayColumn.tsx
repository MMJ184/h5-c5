import dayjs from 'dayjs';

import { CALENDAR_CONFIG } from './calendar.config';

import type { Appointment } from '../../hooks/useAppointments.ts';

interface Props {
	day: dayjs.Dayjs;
	appointments: Appointment[];
	onCreate: (dateTimeIso: string) => void;
	onEdit: (a: Appointment) => void;
}

export default function DayColumn({ day, appointments, onCreate, onEdit }: Props) {
	const { hours, slotHeight, defaultDurationMinutes } = CALENDAR_CONFIG;

	return (
		<div
			style={{
				flex: 1,
				position: 'relative',
				borderLeft: '1px solid #f0f0f0',
			}}
			onClick={(e) => {
				const rect = e.currentTarget.getBoundingClientRect();
				const y = e.clientY - rect.top;
				const minutes = Math.floor(y / slotHeight);
				onCreate(day.startOf('day').add(minutes, 'minute').format('YYYY-MM-DD HH:mm'));
			}}
		>
			{Array.from({ length: hours.end - hours.start }).map((_, i) => (
				<div
					key={i}
					style={{
						height: slotHeight * 60,
						borderBottom: '1px dashed #eee',
					}}
				/>
			))}

			{(appointments ?? []).map((a) => {
				if (!a.time) return null;
				const [h, m] = a.time.split(':').map(Number);
				const top = ((h - hours.start) * 60 + m) * slotHeight;
				const height = (a.durationMinutes ?? defaultDurationMinutes) * slotHeight;

				return (
					<div
						key={a.id}
						onClick={(e) => {
							e.stopPropagation();
							onEdit(a);
						}}
						style={{
							position: 'absolute',
							top,
							left: 6,
							right: 6,
							height,
							background: a.color ?? '#1677ff',
							color: '#fff',
							borderRadius: 6,
							padding: 6,
							fontSize: 12,
						}}
					>
						<strong>{a.time}</strong> {a.title}
						<div style={{ opacity: 0.85 }}>{a.patientName}</div>
					</div>
				);
			})}
		</div>
	);
}
