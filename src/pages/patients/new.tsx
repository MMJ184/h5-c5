import { useNavigate } from '@tanstack/react-router';
import { message } from 'antd';

import PatientForm, { type PatientFormValues } from './PatientForm';
import { useCreatePatient } from './patient.queries';

const UPLOADED_ASSET = '/vite.svg';

export default function PatientCreatePage() {
	const navigate = useNavigate();
	const createMut = useCreatePatient();

	async function handleSubmit(values: PatientFormValues) {
		try {
			const payload = {
				...values,
				lastVisit: values.lastVisit ? values.lastVisit.format('YYYY-MM-DD') : undefined,
			};
			await createMut.mutateAsync(payload);
			message.success('Patient created');
			navigate({ to: '/patients' });
		} catch {
			message.error('Failed to create patient');
		}
	}

	return (
		<PatientForm
			variant="page"
			visible
			mode="add"
			confirmLoading={createMut.isPending}
			onCancel={() => navigate({ to: '/patients' })}
			onSubmit={handleSubmit}
			avatarPlaceholderUrl={UPLOADED_ASSET}
		/>
	);
}
