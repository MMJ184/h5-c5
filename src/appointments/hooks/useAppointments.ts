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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.list();
      // backend may wrap data in res.data
      const payload = res?.data ?? res;
      const list = payload?.data ?? payload?.items ?? payload ?? [];
      setAppointments(Array.isArray(list) ? list : []);
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
