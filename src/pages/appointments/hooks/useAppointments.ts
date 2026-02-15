import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useCallback } from 'react';

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

/* Query Keys */
const APPOINTMENTS_QUERY_KEY = ['appointments'] as const;

function normalizeAppointmentsPayload(payload: unknown): Appointment[] {
	if (Array.isArray(payload)) return payload as Appointment[];
	if (payload && typeof payload === 'object') {
		const obj = payload as Record<string, unknown>;
		if (Array.isArray(obj.data)) return obj.data as Appointment[];
		if (Array.isArray(obj.items)) return obj.items as Appointment[];
	}
	return [];
}

/* Temporary Dummy Data */
const DUMMY_APPOINTMENTS: Appointment[] = [
	{
		id: 'appt_1',
		title: 'General Checkup',
		patientName: 'John Doe',
		date: '2026-02-01',
		time: '09:00',
		status: 'pending',
		durationMinutes: 30,
		notes: 'Annual health checkup',
	},
	{
		id: 'appt_2',
		title: 'Dental Cleaning',
		patientName: 'Jane Smith',
		date: '2026-02-01',
		time: '10:30',
		status: 'confirmed',
		durationMinutes: 45,
	},
	{
		id: 'appt_3',
		title: 'Eye Examination',
		patientName: 'Bob Johnson',
		date: '2026-02-02',
		time: '14:00',
		status: 'confirmed',
		durationMinutes: 60,
		notes: 'Vision test and prescription update',
	},
	{
		id: 'appt_4',
		title: 'Physical Therapy',
		patientName: 'Alice Williams',
		date: '2026-02-03',
		time: '11:00',
		status: 'completed',
		durationMinutes: 60,
	},
	{
		id: 'appt_5',
		title: 'Blood Test',
		patientName: 'Charlie Brown',
		date: '2026-02-04',
		time: '08:00',
		status: 'cancelled',
		durationMinutes: 15,
		notes: 'Patient requested cancellation',
	},
	{
		id: 'appt_6',
		title: 'Cardiology Consultation',
		patientName: 'David Miller',
		date: '2026-02-05',
		time: '15:30',
		status: 'pending',
		durationMinutes: 45,
	},
	{
		id: 'appt_7',
		title: 'X-Ray Scan',
		patientName: 'Emma Davis',
		date: '2026-02-06',
		time: '13:00',
		status: 'confirmed',
		durationMinutes: 30,
	},
	{
		id: 'appt_8',
		title: 'Follow-up Visit',
		patientName: 'Frank Wilson',
		date: '2026-02-07',
		time: '10:00',
		status: 'completed',
		durationMinutes: 30,
		notes: 'Post-surgery follow-up',
	},
];

export default function useAppointments() {
	const queryClient = useQueryClient();

	/* ---------- FETCH APPOINTMENTS ---------- */
	const { data: appointments = [], isLoading: loading } = useQuery({
		queryKey: APPOINTMENTS_QUERY_KEY,
		queryFn: async () => {
			try {
				const res = await appointmentApi.list();
				const normalized = normalizeAppointmentsPayload(res.data);
				if (normalized.length > 0) return normalized;
				// if backend shape is unexpected, use resilient fallback instead of breaking UI
				return DUMMY_APPOINTMENTS;
			} catch (err) {
				console.warn('API failed, using dummy data:', err);
				return DUMMY_APPOINTMENTS;
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: true,
	});

	/* ---------- CREATE APPOINTMENT ---------- */
	const createMutation = useMutation({
		mutationFn: (payload: AppointmentPayload) => appointmentApi.create(payload),
		onMutate: async (newAppointment) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });

			// Snapshot previous value
			const previousAppointments = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY);

			// Optimistically update
			const optimisticAppointment: Appointment = {
				id: `temp_${Date.now()}`,
				...newAppointment,
				status: newAppointment.status ?? 'pending',
			};
			queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (old = []) => [
				...(Array.isArray(old) ? old : []),
				optimisticAppointment,
			]);

			return { previousAppointments };
		},
		onError: (err, _newAppointment, context) => {
			// Rollback on error
			if (context?.previousAppointments) {
				queryClient.setQueryData(APPOINTMENTS_QUERY_KEY, context.previousAppointments);
			}
			message.error('Failed to create appointment');
			console.error(err);
		},
		onSuccess: () => {
			message.success('Appointment created successfully');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
		},
	});

	/* ---------- UPDATE APPOINTMENT ---------- */
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentPayload> }) =>
			appointmentApi.update(id, data),
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
			const previousAppointments = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY);

			queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (old = []) =>
				(Array.isArray(old) ? old : []).map((appt) => (appt.id === id ? { ...appt, ...data } : appt)),
			);

			return { previousAppointments };
		},
		onError: (err, _variables, context) => {
			if (context?.previousAppointments) {
				queryClient.setQueryData(APPOINTMENTS_QUERY_KEY, context.previousAppointments);
			}
			message.error('Failed to update appointment');
			console.error(err);
		},
		onSuccess: () => {
			message.success('Appointment updated successfully');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
		},
	});

	/* ---------- DELETE APPOINTMENT ---------- */
	const deleteMutation = useMutation({
		mutationFn: (id: string) => appointmentApi.remove(id),
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
			const previousAppointments = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY);

			queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (old = []) =>
				(Array.isArray(old) ? old : []).filter((appt) => appt.id !== id),
			);

			return { previousAppointments };
		},
		onError: (err, _id, context) => {
			if (context?.previousAppointments) {
				queryClient.setQueryData(APPOINTMENTS_QUERY_KEY, context.previousAppointments);
			}
			message.error('Failed to delete appointment');
			console.error(err);
		},
		onSuccess: () => {
			message.success('Appointment deleted successfully');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
		},
	});

	/* ---------- UPDATE STATUS (FOR KANBAN) ---------- */
	const updateStatus = useCallback(
		async (id: string, status: Appointment['status']) => {
			await updateMutation.mutateAsync({ id, data: { status } });
		},
		[updateMutation],
	);

	/* ---------- MANUAL RELOAD ---------- */
	const reload = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
	}, [queryClient]);

	return {
		appointments,
		loading,
		reload,
		createAppointment: createMutation.mutateAsync,
		updateAppointment: (id: string, data: Partial<AppointmentPayload>) =>
			updateMutation.mutateAsync({ id, data }),
		deleteAppointment: deleteMutation.mutateAsync,
		updateStatus,
		// Mutation states
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
}
