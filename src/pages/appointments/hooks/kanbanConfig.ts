import type { Appointment } from './useAppointments.ts';

export const STATUSES: {
	key: Appointment['status'];
	title: string;
}[] = [
	{ key: 'pending', title: 'Pending' },
	{ key: 'confirmed', title: 'Confirmed' },
	{ key: 'completed', title: 'Completed' },
	{ key: 'cancelled', title: 'Cancelled' },
];

// types.ts
export interface KanbanColumn {
	id: string; // same as status key
	title: string;
}
