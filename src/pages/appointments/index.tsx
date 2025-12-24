import { Tabs, Card, message } from 'antd';
import { useState, useCallback } from 'react';

import AppointmentForm from './components/AppointmentForm';
import AppointmentKanban from './components/AppointmentKanban';
import AppointmentList from './components/AppointmentList';
import AppointmentCalendar from './components/calendar/AppointmentCalendar';
import useAppointments, { type Appointment } from './hooks/useAppointments';
import './index.css';

export default function Index() {
	const { appointments, loading, createAppointment, updateAppointment, deleteAppointment, updateStatus } =
		useAppointments();

	const [formVisible, setFormVisible] = useState(false);
	const [editing, setEditing] = useState<Appointment | null>(null);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const openCreateForDate = useCallback((dateIso?: string) => {
		setEditing({
			id: '',
			title: '',
			patientName: '',
			date: dateIso ?? new Date().toISOString().slice(0, 10),
			status: 'pending',
		} as Appointment);
		setFormVisible(true);
	}, []);

	const openEdit = useCallback((a: Appointment) => {
		setEditing(a);
		setFormVisible(true);
	}, []);

	const handleCancel = () => {
		setFormVisible(false);
		setEditing(null);
	};

	async function handleSubmit(values: any) {
		try {
			setConfirmLoading(true);
			if (editing && editing.id) {
				await updateAppointment(editing.id, values);
				message.success('Appointment updated');
			} else {
				await createAppointment(values);
				message.success('Appointment created');
			}
			setFormVisible(false);
			setEditing(null);
		} catch (err) {
			console.error(err);
			message.error('Failed to save appointment');
		} finally {
			setConfirmLoading(false);
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteAppointment(id);
			message.success('Appointment deleted');
		} catch (err) {
			console.error(err);
			message.error('Failed to delete appointment');
		}
	}

	async function handleChangeStatus(id: string, status: Appointment['status']) {
		try {
			await updateStatus(id, status);
			message.success('Status updated');
		} catch (err) {
			console.error(err);
			message.error('Failed to update status');
		}
	}

	return (
		<Card>
			<Tabs
				defaultActiveKey="calendar"
				items={[
					{
						key: 'calendar',
						label: 'Calendar',
						children: (
							<AppointmentCalendar
								appointments={appointments}
								loading={loading}
								onCreateForDate={openCreateForDate}
								onEdit={openEdit}
							/>
						),
					},
					{
						key: 'kanban',
						label: 'Kanban',
						children: (
							<AppointmentKanban
								appointments={appointments}
								loading={loading}
								onEdit={openEdit}
								onDelete={handleDelete}
								onChangeStatus={handleChangeStatus}
							/>
						),
					},
					{
						key: 'list',
						label: 'List',
						children: (
							<AppointmentList
								appointments={appointments}
								loading={loading}
								onEdit={openEdit}
								onDelete={handleDelete}
							/>
						),
					},
				]}
			/>

			<AppointmentForm
				visible={formVisible}
				initial={editing ?? null}
				onCancel={handleCancel}
				onSubmit={handleSubmit}
				confirmLoading={confirmLoading}
			/>
		</Card>
	);
}
