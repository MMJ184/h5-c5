import {
  LeaveApprovalInput,
  LeaveCalendarFilter,
  LeaveRequest,
  LeaveRequestInput,
  LeaveType,
  LeaveBalance,
} from '../types';

const BASE_URL = import.meta.env.VITE_LEAVE_API_BASE_URL ?? '';

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Leave API error: ${response.status}`);
  }
  return (await response.json()) as T;
};

export const leaveApi = {
  listLeaveTypes: () => request<LeaveType[]>('/leave-types'),
  listLeaveBalance: (userId: string) => request<LeaveBalance[]>(`/leave-balance?userId=${userId}`),
  createLeaveRequest: (payload: LeaveRequestInput) =>
    request<LeaveRequest>('/leave-requests', { method: 'POST', body: JSON.stringify(payload) }),
  listLeaveRequests: (query: { userId?: string; status?: string; from?: string; to?: string }) => {
    const params = new URLSearchParams();
    if (query.userId) params.set('userId', query.userId);
    if (query.status) params.set('status', query.status);
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    return request<LeaveRequest[]>(`/leave-requests?${params.toString()}`);
  },
  listApprovals: () => request<LeaveRequest[]>('/leave-requests/pending-approvals'),
  approveLeave: (id: string, payload: LeaveApprovalInput) =>
    request<LeaveRequest>(`/leave-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  rejectLeave: (id: string, payload: LeaveApprovalInput) =>
    request<LeaveRequest>(`/leave-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  cancelLeave: (id: string) =>
    request<LeaveRequest>(`/leave-requests/${id}/cancel`, { method: 'POST' }),
  listCalendar: (filter: LeaveCalendarFilter) => {
    const params = new URLSearchParams();
    params.set('from', filter.from);
    params.set('to', filter.to);
    if (filter.teamId) params.set('teamId', filter.teamId);
    if (filter.userId) params.set('userId', filter.userId);
    if (filter.leaveTypeId) params.set('leaveTypeId', filter.leaveTypeId);
    if (filter.status) params.set('status', filter.status);
    return request<LeaveRequest[]>(`/leave-calendar?${params.toString()}`);
  },
};
