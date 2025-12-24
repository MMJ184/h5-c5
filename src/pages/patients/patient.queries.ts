import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { patientApi } from '../../api/patient.api';

import type { Patient, PatientListResult, PatientQuery } from '../../api/patient.api';

export function usePatientsQuery(params: PatientQuery) {
	return useQuery<PatientListResult>({
		queryKey: ['patients', params],
		queryFn: () => patientApi.list(params),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
}

export function useCreatePatient() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: Partial<Patient>) => patientApi.create(payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
	});
}

export function useUpdatePatient() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: Partial<Patient> }) => patientApi.update(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
	});
}

export function useDeletePatient() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => patientApi.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
	});
}

export function useBulkDeletePatients() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (ids: string[]) => patientApi.bulkDelete(ids),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
	});
}
