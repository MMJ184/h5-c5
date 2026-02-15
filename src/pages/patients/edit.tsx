import { useNavigate, useParams } from '@tanstack/react-router';
import { Button, Result, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';

import PatientForm, { type PatientFormValues } from './PatientForm';
import { usePatientsQuery, useUpdatePatient } from './patient.queries';

const UPLOADED_ASSET = '/vite.svg';

export default function PatientEditPage() {
	const navigate = useNavigate();
	const { patientId } = useParams({ from: '/patients/$patientId/edit' });

	const patientsQuery = usePatientsQuery({ page: 1, pageSize: 1000 });
	const updateMut = useUpdatePatient();

	useEffect(() => {
		if (patientsQuery.isError) {
			message.error('Failed to load patients');
		}
	}, [patientsQuery.isError]);

	const isInitialLoading = (patientsQuery as any).isPending ?? (patientsQuery as any).isLoading ?? false;

	const patient = useMemo(
		() => patientsQuery.data?.data?.find((p) => p.id === patientId),
		[patientsQuery.data, patientId],
	);

	if (isInitialLoading) {
		return (
			<div style={{ padding: 0, display: 'flex', justifyContent: 'center' }}>
				<Spin />
			</div>
		);
	}

	if (!patient) {
		return (
			<Result
				status="404"
				title="Patient not found"
				subTitle="The patient record you are looking for does not exist."
				extra={
					<Button type="primary" onClick={() => navigate({ to: '/patients' })}>
						Back to Patients
					</Button>
				}
			/>
		);
	}

	const initialValues: Partial<PatientFormValues> = {
		name: patient.name,
		gender: patient.gender as PatientFormValues['gender'],
		age: patient.age,
		phone: patient.phone,
		doctor: patient.doctor,
		lastVisit: patient.lastVisit ? dayjs(patient.lastVisit) : undefined,
		status: patient.status,
	};

	async function handleSubmit(values: PatientFormValues) {
		try {
			const payload = {
				...values,
				lastVisit: values.lastVisit ? values.lastVisit.format('YYYY-MM-DD') : undefined,
			};
			await updateMut.mutateAsync({ id: patientId, payload });
			message.success('Patient updated');
			navigate({ to: '/patients' });
		} catch {
			message.error('Failed to update patient');
		}
	}

	return (
		<PatientForm
			variant="page"
			visible
			mode="edit"
			initialValues={initialValues}
			confirmLoading={updateMut.isPending}
			onCancel={() => navigate({ to: '/patients' })}
			onSubmit={handleSubmit}
			avatarPlaceholderUrl={UPLOADED_ASSET}
		/>
	);
}
