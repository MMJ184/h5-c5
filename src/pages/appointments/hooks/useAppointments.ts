import { useCallback, useEffect, useState } from 'react';
import appointmentApi, { AppointmentPayload } from '../api/appointmentApi';

export type Appointment = {
  id: string;
  title: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  durationMinutes?: number;
  color?: string;
};

export default function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const DUMMY_APPOINTMENTS: Appointment[] = [
    {
      id: 'appt_1',
      title: 'General Checkup',
      patientName: 'John Doe',
      date: '2025-01-12',
      time: '10:30',
      status: 'confirmed',
      notes: 'Has mild fever for 2 days.',
      durationMinutes: 30,
      color: '#1677ff',
    },
    {
      id: 'appt_2',
      title: 'Dental Cleaning',
      patientName: 'Priya Sharma',
      date: '2025-01-12',
      time: '14:00',
      status: 'pending',
      notes: 'First-time consultation.',
      durationMinutes: 45,
      color: '#fa541c',
    },
    {
      id: 'appt_3',
      title: 'Eye Checkup',
      patientName: 'Rahul Mehta',
      date: '2025-01-13',
      time: '09:00',
      status: 'completed',
      notes: '',
      durationMinutes: 20,
      color: '#13c2c2',
    },
    {
      id: 'appt_4',
      title: 'Skin Consultation',
      patientName: 'Mira Patel',
      date: '2025-01-15',
      time: '16:00',
      status: 'cancelled',
      notes: 'Cancelled by patient.',
      durationMinutes: 25,
      color: '#722ed1',
    },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAppointments(DUMMY_APPOINTMENTS);
      //
      // const res = await appointmentApi.list();
      // // backend may wrap data in res.data
      // const payload = res?.data ?? res;
      // const list = payload?.data ?? payload?.items ?? payload ?? [];
      // setAppointments(Array.isArray(list) ? list : []);
    } catch (err) {
      // console.error handled by caller if needed
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (payload: AppointmentPayload) => {
    await appointmentApi.create(payload);
    await load();
  }, [load]);

  const updateAppointment = useCallback(async (id: string, payload: Partial<AppointmentPayload>) => {
    await appointmentApi.update(id, payload);
    await load();
  }, [load]);

  const deleteAppointment = useCallback(async (id: string) => {
    await appointmentApi.remove(id);
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    appointments,
    loading,
    reload: load,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
}
