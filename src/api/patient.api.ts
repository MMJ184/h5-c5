import ApiClient from './ApiClient';
import { USE_MOCKS } from './env';

export interface Patient {
	id: string;
	name: string;
	gender: string;
	age: number;
	phone: string;
	doctor?: string;
	lastVisit?: string;
	status?: 'active' | 'inactive' | 'discharged';
	avatarUrl?: string;
}

export interface PatientQuery {
	page?: number;
	pageSize?: number;
	search?: string;
	gender?: string;
	startDate?: string;
	endDate?: string;
	sortBy?: keyof Patient;
	sortOrder?: 'asc' | 'desc';
}

export interface PatientListResult {
	data: Patient[];
	total: number;
	page: number;
	pageSize: number;
}

const BASE = '/patients';
const MOCK_URL = '/mock/patients.json';
const STORE_KEY = 'mock_patients_v1';

async function loadMockPatients(): Promise<Patient[]> {
	const cached = localStorage.getItem(STORE_KEY);
	if (cached) return JSON.parse(cached) as Patient[];

	const res = await fetch(MOCK_URL);
	const json = await res.json();
	const list: Patient[] = json?.data ?? [];
	localStorage.setItem(STORE_KEY, JSON.stringify(list));
	return list;
}

function saveMockPatients(list: Patient[]) {
	localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

function applyQuery(list: Patient[], q?: PatientQuery): PatientListResult {
	const page = q?.page ?? 1;
	const pageSize = q?.pageSize ?? 10;

	let filtered = [...list];

	// search (id/name/phone)
	if (q?.search?.trim()) {
		const s = q.search.trim().toLowerCase();
		filtered = filtered.filter((p) =>
			[p.id, p.name, p.phone].some((x) =>
				String(x ?? '')
					.toLowerCase()
					.includes(s),
			),
		);
	}

	// gender
	if (q?.gender) {
		filtered = filtered.filter((p) => p.gender === q.gender);
	}

	// date range on lastVisit (YYYY-MM-DD)
	if (q?.startDate && q?.endDate) {
		const start = q.startDate;
		const end = q.endDate;
		filtered = filtered.filter((p) => {
			const lv = p.lastVisit ?? '';
			return lv >= start && lv <= end;
		});
	}

	// sort
	if (q?.sortBy) {
		const key = q.sortBy;
		const dir = q.sortOrder === 'desc' ? -1 : 1;

		filtered.sort((a: any, b: any) => {
			const av = a?.[key];
			const bv = b?.[key];
			if (av == null && bv == null) return 0;
			if (av == null) return -1 * dir;
			if (bv == null) return 1 * dir;

			// numeric
			if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;

			// string/date
			return String(av).localeCompare(String(bv)) * dir;
		});
	}

	const total = filtered.length;
	const startIdx = (page - 1) * pageSize;
	const data = filtered.slice(startIdx, startIdx + pageSize);

	return { data, total, page, pageSize };
}

function nextPatientId(list: Patient[]) {
	const nums = list.map((p) => Number(String(p.id).replace(/\D/g, ''))).filter((n) => Number.isFinite(n));
	const next = (nums.length ? Math.max(...nums) : 0) + 1;
	return `P${String(next).padStart(3, '0')}`;
}

export const patientApi = {
	async list(params?: PatientQuery): Promise<PatientListResult> {
		if (USE_MOCKS) {
			const list = await loadMockPatients();
			return applyQuery(list, params);
		}

		const res = await ApiClient.get(BASE, { params });
		// Expect server to return { data, total, page, pageSize } (or normalize here later)
		return res.data;
	},

	async create(payload: Partial<Patient>) {
		if (USE_MOCKS) {
			const list = await loadMockPatients();
			const created: Patient = {
				id: payload.id ?? nextPatientId(list),
				name: payload.name ?? '',
				gender: payload.gender ?? 'Male',
				age: payload.age ?? 0,
				phone: payload.phone ?? '',
				doctor: payload.doctor,
				lastVisit: payload.lastVisit,
				status: payload.status ?? 'active',
				avatarUrl: payload.avatarUrl ?? '',
			};
			const next = [created, ...list];
			saveMockPatients(next);
			return created;
		}

		const res = await ApiClient.post(BASE, payload);
		return res.data;
	},

	async update(id: string, payload: Partial<Patient>) {
		if (USE_MOCKS) {
			const list = await loadMockPatients();
			const next = list.map((p) => (p.id === id ? { ...p, ...payload, id } : p));
			saveMockPatients(next);
			return next.find((p) => p.id === id);
		}

		const res = await ApiClient.put(`${BASE}/${id}`, payload);
		return res.data;
	},

	async remove(id: string) {
		if (USE_MOCKS) {
			const list = await loadMockPatients();
			const next = list.filter((p) => p.id !== id);
			saveMockPatients(next);
			return { ok: true };
		}

		const res = await ApiClient.delete(`${BASE}/${id}`);
		return res.data;
	},

	async bulkDelete(ids: string[]) {
		if (USE_MOCKS) {
			const list = await loadMockPatients();
			const set = new Set(ids);
			const next = list.filter((p) => !set.has(p.id));
			saveMockPatients(next);
			return { ok: true };
		}

		const res = await ApiClient.post(`${BASE}/bulk-delete`, { ids });
		return res.data;
	},
};
