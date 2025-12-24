import dayjs from 'dayjs';

import type { Appointment } from '../../hooks/useAppointments.ts';

export type ViewMode = 'day' | 'week' | 'month';

export interface CalendarPropsBase {
	current: dayjs.Dayjs;
	appointments: Appointment[];
	onCreate: (dateTimeIso: string) => void;
	onEdit: (a: Appointment) => void;
}
