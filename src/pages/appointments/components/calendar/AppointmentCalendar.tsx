import { Card } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { CALENDAR_CONFIG } from './calendar.config';
import CalendarHeader from './CalendarHeader';
import DayColumn from './DayColumn';
import MonthView from './MonthView';
import TimeColumn from './TimeColumn';
import WeekView from './WeekView';

import type { Appointment } from '../../hooks/useAppointments.ts';
import type { ViewMode } from './calendar.types.ts';

interface Props {
	appointments: Appointment[];
	onCreateForDate: (dateTimeIso: string) => void;
	onEdit: (a: Appointment) => void;
}

export default function AppointmentCalendar({ appointments, onCreateForDate, onEdit }: Props) {
	const [current, setCurrent] = useState(dayjs());
	const [view, setView] = useState<ViewMode>('week');
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const check = () => {
			const mobile = window.innerWidth < CALENDAR_CONFIG.mobileBreakpoint;
			setIsMobile(mobile);
			if (mobile && view === 'week') setView('day');
		};
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	}, [view]);

	const goPrev = () =>
		setCurrent((c) =>
			view === 'month' ? c.subtract(1, 'month') : view === 'week' ? c.subtract(1, 'week') : c.subtract(1, 'day'),
		);

	const goNext = () =>
		setCurrent((c) => (view === 'month' ? c.add(1, 'month') : view === 'week' ? c.add(1, 'week') : c.add(1, 'day')));

	return (
		<Card>
			<CalendarHeader
				view={view}
				current={current}
				isMobile={isMobile}
				onViewChange={setView}
				onPrev={goPrev}
				onNext={goNext}
				onToday={() => setCurrent(dayjs())}
				onCreateNow={() => onCreateForDate(dayjs().format('YYYY-MM-DD HH:mm'))}
			/>

			{view === 'month' && (
				<MonthView current={current} appointments={appointments} onChange={setCurrent} onEdit={onEdit} />
			)}

			{view === 'day' && (
				<div style={{ display: 'flex' }}>
					<TimeColumn />
					<DayColumn day={current} appointments={appointments} onCreate={onCreateForDate} onEdit={onEdit} />
				</div>
			)}

			{view === 'week' && (
				<WeekView current={current} appointments={appointments} onCreate={onCreateForDate} onEdit={onEdit} />
			)}
		</Card>
	);
}
