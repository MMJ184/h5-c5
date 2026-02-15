import ApiClient from './ApiClient';
import { USE_MOCKS } from './env';

export type BugStatus = 'new' | 'triage' | 'in_progress' | 'qa' | 'closed';
export type BugPriority = 'low' | 'medium' | 'high' | 'critical';

export interface BugHistoryItem {
	id: string;
	action: string;
	at: string;
	by?: string;
}

export interface Bug {
	id: string;
	title: string;
	descriptionHtml: string;
	status: BugStatus;
	priority: BugPriority;
	assigneeId?: string;
	assigneeName?: string;
	reporterId?: string;
	reporterName?: string;
	createdAt: string;
	updatedAt: string;
	history: BugHistoryItem[];
}

export interface BugQuery {
	search?: string;
	status?: BugStatus | 'all';
	assigneeId?: string;
	scope?: 'all' | 'mine';
	viewerId?: string;
}

export interface BugListResult {
	data: Bug[];
	total: number;
}

const BASE = '/bugs';
const STORE_KEY = 'mock_bugs_v1';

function seedBugs(): Bug[] {
	const now = new Date().toISOString();
	return [
		{
			id: 'BUG-1001',
			title: 'Login screen flashes on redirect',
			descriptionHtml: '<p>Observed a flicker between routes when login completes.</p>',
			status: 'triage',
			priority: 'medium',
			assigneeId: 'u_admin',
			assigneeName: 'Admin',
			reporterId: 'u_admin',
			reporterName: 'Admin',
			createdAt: now,
			updatedAt: now,
			history: [{ id: 'h1', action: 'Created', at: now, by: 'Admin' }],
		},
		{
			id: 'BUG-1002',
			title: 'Kanban drag ghost remains',
			descriptionHtml: '<p>Drag overlay stays visible after drop in rare cases.</p>',
			status: 'in_progress',
			priority: 'high',
			assigneeId: 'u_dev',
			assigneeName: 'Dev User',
			reporterId: 'u_admin',
			reporterName: 'Admin',
			createdAt: now,
			updatedAt: now,
			history: [{ id: 'h2', action: 'Created', at: now, by: 'Admin' }],
		},
	];
}

async function loadMockBugs(): Promise<Bug[]> {
	const cached = localStorage.getItem(STORE_KEY);
	if (cached) return JSON.parse(cached) as Bug[];
	const list = seedBugs();
	localStorage.setItem(STORE_KEY, JSON.stringify(list));
	return list;
}

function saveMockBugs(list: Bug[]) {
	localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

function applyQuery(list: Bug[], q?: BugQuery): BugListResult {
	let filtered = [...list];

	if (q?.search?.trim()) {
		const s = q.search.trim().toLowerCase();
		filtered = filtered.filter((b) => b.title.toLowerCase().includes(s) || b.id.toLowerCase().includes(s));
	}

	if (q?.status && q.status !== 'all') {
		filtered = filtered.filter((b) => b.status === q.status);
	}

	if (q?.scope === 'mine' && q.viewerId) {
		filtered = filtered.filter((b) => b.assigneeId === q.viewerId || b.reporterId === q.viewerId);
	}

	if (q?.assigneeId) {
		filtered = filtered.filter((b) => b.assigneeId === q.assigneeId);
	}

	return { data: filtered, total: filtered.length };
}

function nextBugId(list: Bug[]) {
	const nums = list.map((b) => Number(b.id.replace(/\D/g, ''))).filter((n) => Number.isFinite(n));
	const next = (nums.length ? Math.max(...nums) : 1000) + 1;
	return `BUG-${next}`;
}

export const bugApi = {
	async list(params?: BugQuery): Promise<BugListResult> {
		if (USE_MOCKS) {
			const list = await loadMockBugs();
			return applyQuery(list, params);
		}
		const res = await ApiClient.get(BASE, { params });
		return res.data;
	},

	async create(payload: Partial<Bug>) {
		if (USE_MOCKS) {
			const list = await loadMockBugs();
			const now = new Date().toISOString();
			const created: Bug = {
				id: payload.id ?? nextBugId(list),
				title: payload.title ?? '',
				descriptionHtml: payload.descriptionHtml ?? '',
				status: payload.status ?? 'new',
				priority: payload.priority ?? 'medium',
				assigneeId: payload.assigneeId,
				assigneeName: payload.assigneeName,
				reporterId: payload.reporterId,
				reporterName: payload.reporterName,
				createdAt: now,
				updatedAt: now,
				history: [{ id: `h_${now}`, action: 'Created', at: now, by: payload.reporterName }],
			};
			const next = [created, ...list];
			saveMockBugs(next);
			return created;
		}
		return ApiClient.post(BASE, payload);
	},

	async update(id: string, payload: Partial<Bug>) {
		if (USE_MOCKS) {
			const list = await loadMockBugs();
			const now = new Date().toISOString();
			const next = list.map((b) => {
				if (b.id !== id) return b;
				return {
					...b,
					...payload,
					updatedAt: now,
					history: payload.history ?? b.history,
				};
			});
			saveMockBugs(next);
			return next.find((b) => b.id === id);
		}
		return ApiClient.put(`${BASE}/${id}`, payload);
	},

	async remove(id: string) {
		if (USE_MOCKS) {
			const list = await loadMockBugs();
			const next = list.filter((b) => b.id !== id);
			saveMockBugs(next);
			return true;
		}
		return ApiClient.delete(`${BASE}/${id}`);
	},
};
