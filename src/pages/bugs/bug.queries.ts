import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bugApi } from '../../api/bug.api';

import type { Bug, BugListResult, BugQuery } from '../../api/bug.api';

export function useBugsQuery(params: BugQuery) {
	return useQuery<BugListResult>({
		queryKey: ['bugs', params],
		queryFn: () => bugApi.list(params),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
}

export function useCreateBug() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: Partial<Bug>) => bugApi.create(payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['bugs'] }),
	});
}

export function useUpdateBug() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: Partial<Bug> }) => bugApi.update(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['bugs'] }),
	});
}

export function useDeleteBug() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => bugApi.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['bugs'] }),
	});
}
