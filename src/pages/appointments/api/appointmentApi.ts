import ApiClient from '../../../api/ApiClient.ts';

export interface AppointmentPayload {
	title: string;
	patientName: string;
	date: string; // YYYY-MM-DD
	time?: string; // HH:mm
	status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
	notes?: string;
	durationMinutes?: number;
	color?: string;
}

const base = '/appointments';

const appointmentApi = {
	list: (params?: any) => ApiClient.get(base, { params }),
	get: (id: string) => ApiClient.get(`${base}/${id}`),
	create: (payload: AppointmentPayload) => ApiClient.post(base, payload),
	update: (id: string, payload: Partial<AppointmentPayload>) => ApiClient.put(`${base}/${id}`, payload),
	remove: (id: string) => ApiClient.delete(`${base}/${id}`),
};

export default appointmentApi;
