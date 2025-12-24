import { useCallback, useEffect, useState } from 'react';

import appointmentApi, { type AppointmentPayload } from '../api/appointmentApi';

export interface Appointment {
	id: string;
	title: string;
	patientName: string;
	date: string;
	time?: string;
	status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
	notes?: string;
	durationMinutes?: number;
	color?: string;
}

export default function useAppointments() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(false);

	/* 🧪 TEMP DUMMY DATA */
	const DUMMY_APPOINTMENTS: Appointment[] = [
		{
			id: 'appt_1',
			title: 'General Checkup',
			patientName: 'John Doe',
			date: '2026-01-12',
			time: '10:30',
			status: 'confirmed',
			durationMinutes: 30,
		},
		{
			id: 'appt_2',
			title: 'Dental Cleaning',
			patientName: 'Priya Sharma',
			date: '2026-01-12',
			time: '14:00',
			status: 'pending',
			durationMinutes: 45,
		},
		{
			id: 'appt_3',
			title: 'Eye Checkup',
			patientName: 'Rahul Mehta',
			date: '2026-01-13',
			time: '09:00',
			status: 'completed',
			durationMinutes: 20,
		},
		{
			id: 'appt_4',
			title: 'Skin Consultation',
			patientName: 'Mira Patel',
			date: '2026-01-15',
			time: '16:00',
			status: 'cancelled',
			durationMinutes: 25,
		},
	];

	/* 🔁 Load (used only on page load / manual refresh) */
	const reload = useCallback(async () => {
		setLoading(true);
		try {
			// 🔁 TEMP: dummy
			setAppointments(DUMMY_APPOINTMENTS);

			// 🔜 REAL API
			// const res = await appointmentApi.list();
			// setAppointments(res.data);
		} finally {
			setLoading(false);
		}
	}, []);

	/* 🟢 CREATE */
	const createAppointment = useCallback(async (payload: AppointmentPayload) => {
		const res = await appointmentApi.create(payload);
		setAppointments((prev) => [...prev, res.data]);
	}, []);

	/* ✏️ UPDATE (edit modal) */
	const updateAppointment = useCallback(async (id: string, payload: Partial<AppointmentPayload>) => {
		const res = await appointmentApi.update(id, payload);
		setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)));
	}, []);

	/* 🔴 DELETE */
	const deleteAppointment = useCallback(async (id: string) => {
		await appointmentApi.remove(id);
		setAppointments((prev) => prev.filter((a) => a.id !== id));
	}, []);

	/* 🔁 STATUS UPDATE (KANBAN ONLY) */
	const updateStatus = useCallback(
		async (id: string, status: Appointment['status']) => {
			const previous = [...appointments];

			/* optimistic */
			setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

			try {
				await appointmentApi.update(id, { status });
			} catch (err) {
				/* rollback */
				setAppointments(previous);
				throw err;
			}
		},
		[appointments],
	);

	useEffect(() => {
		reload();
	}, [reload]);

	return {
		appointments,
		loading,
		reload, // manual refresh only
		setAppointments, // needed for Kanban
		createAppointment,
		updateAppointment,
		deleteAppointment,
		updateStatus, // 🔑 Kanban uses this
	};
}
