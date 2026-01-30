import { dummyLeaveStore } from '../dummy/data';
import {
  LeaveApprovalInput,
  LeaveApprovalsFilter,
  LeaveBalance,
  LeaveCalendarFilter,
  LeaveRequest,
  LeaveRequestInput,
  LeaveType,
  User,
} from '../types';
import { rangesOverlap, toDateOnly } from '../utils/date';

const requiresHrApproval = (days: number) => days > 2;

const withinRange = (request: LeaveRequest, from?: string, to?: string) => {
  if (!from && !to) return true;
  const start = toDateOnly(new Date(request.fromDate));
  const end = toDateOnly(new Date(request.toDate));
  const fromDate = from ? toDateOnly(new Date(from)) : undefined;
  const toDate = to ? toDateOnly(new Date(to)) : undefined;

  if (fromDate && end < fromDate) return false;
  if (toDate && start > toDate) return false;
  return true;
};

const getUser = (userId: string) => dummyLeaveStore.users.find((u) => u.id === userId);

const getLeaveType = (leaveTypeId: string) =>
  dummyLeaveStore.leaveTypes.find((t) => t.id === leaveTypeId);

const updateLeaveBalance = (userId: string, leaveTypeId: string, days: number) => {
  const balance = dummyLeaveStore.leaveBalances.find(
    (b) => b.userId === userId && b.leaveTypeId === leaveTypeId
  );
  if (!balance) return;
  balance.used += days;
  balance.available = Math.max(0, balance.available - days);
};

export const leaveService = {
  async getCurrentUser(): Promise<User> {
    const user = getUser(dummyLeaveStore.currentUserId);
    if (!user) throw new Error('User not found');
    return { ...user };
  },
  async listUsers(): Promise<User[]> {
    return [...dummyLeaveStore.users];
  },
  async listLeaveTypes(): Promise<LeaveType[]> {
    return [...dummyLeaveStore.leaveTypes];
  },
  async listLeaveBalances(userId: string): Promise<LeaveBalance[]> {
    return dummyLeaveStore.leaveBalances.filter((b) => b.userId === userId).map((b) => ({ ...b }));
  },
  async listLeaveRequests(userId: string, filters?: { status?: string; from?: string; to?: string }) {
    return dummyLeaveStore.leaveRequests
      .filter((r) => r.userId === userId)
      .filter((r) => (filters?.status ? r.status === filters.status : true))
      .filter((r) => withinRange(r, filters?.from, filters?.to))
      .map((r) => ({ ...r }));
  },
  async listPendingApprovals(filter: LeaveApprovalsFilter): Promise<LeaveRequest[]> {
    return dummyLeaveStore.leaveRequests
      .filter((r) => r.status === 'PENDING')
      .filter((r) => {
        if (filter.role === 'MANAGER') {
          return !r.managerDecision;
        }
        return !r.hrDecision && r.managerDecision?.status === 'APPROVED';
      })
      .filter((r) => {
        if (!filter.teamId) return true;
        const user = getUser(r.userId);
        return user?.teamId === filter.teamId;
      })
      .map((r) => ({ ...r }));
  },
  async createLeaveRequest(input: LeaveRequestInput): Promise<LeaveRequest> {
    const leaveType = getLeaveType(input.leaveTypeId);
    if (!leaveType) throw new Error('Invalid leave type');

    const start = toDateOnly(new Date(input.fromDate));
    const end = toDateOnly(new Date(input.toDate));

    const approvedOverlap = dummyLeaveStore.leaveRequests.some((r) => {
      if (r.userId !== input.userId) return false;
      if (r.status !== 'APPROVED') return false;
      return rangesOverlap(start, end, new Date(r.fromDate), new Date(r.toDate));
    });

    if (approvedOverlap) {
      throw new Error('Leave overlaps with an approved leave request.');
    }

    const newRequest: LeaveRequest = {
      id: dummyLeaveStore.nextRequestId(),
      userId: input.userId,
      leaveTypeId: input.leaveTypeId,
      fromDate: input.fromDate,
      toDate: input.toDate,
      days: input.days,
      status: 'PENDING',
      reason: input.reason,
      approverManagerId: getUser(input.userId)?.managerId,
      approverHrId: requiresHrApproval(input.days) ? 'u_4' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dummyLeaveStore.leaveRequests.unshift(newRequest);
    return { ...newRequest };
  },
  async approveLeave(input: LeaveApprovalInput): Promise<LeaveRequest> {
    const request = dummyLeaveStore.leaveRequests.find((r) => r.id === input.id);
    if (!request) throw new Error('Leave request not found');

    if (input.role === 'MANAGER') {
      request.managerDecision = {
        status: 'APPROVED',
        comment: input.comment,
        at: new Date().toISOString(),
        byId: input.actorId,
      };

      if (!requiresHrApproval(request.days)) {
        request.status = 'APPROVED';
        updateLeaveBalance(request.userId, request.leaveTypeId, request.days);
      }
    } else {
      request.hrDecision = {
        status: 'APPROVED',
        comment: input.comment,
        at: new Date().toISOString(),
        byId: input.actorId,
      };
      request.status = 'APPROVED';
      updateLeaveBalance(request.userId, request.leaveTypeId, request.days);
    }

    request.updatedAt = new Date().toISOString();
    return { ...request };
  },
  async rejectLeave(input: LeaveApprovalInput): Promise<LeaveRequest> {
    const request = dummyLeaveStore.leaveRequests.find((r) => r.id === input.id);
    if (!request) throw new Error('Leave request not found');

    if (input.role === 'MANAGER') {
      request.managerDecision = {
        status: 'REJECTED',
        comment: input.comment,
        at: new Date().toISOString(),
        byId: input.actorId,
      };
    } else {
      request.hrDecision = {
        status: 'REJECTED',
        comment: input.comment,
        at: new Date().toISOString(),
        byId: input.actorId,
      };
    }

    request.status = 'REJECTED';
    request.updatedAt = new Date().toISOString();
    return { ...request };
  },
  async cancelLeave(input: { id: string; actorId: string }): Promise<LeaveRequest> {
    const request = dummyLeaveStore.leaveRequests.find((r) => r.id === input.id);
    if (!request) throw new Error('Leave request not found');
    request.status = 'CANCELLED';
    request.updatedAt = new Date().toISOString();
    return { ...request };
  },
  async listCalendar(filter: LeaveCalendarFilter): Promise<LeaveRequest[]> {
    return dummyLeaveStore.leaveRequests
      .filter((r) => withinRange(r, filter.from, filter.to))
      .filter((r) => (filter.status ? r.status === filter.status : true))
      .filter((r) => (filter.userId ? r.userId === filter.userId : true))
      .filter((r) => (filter.leaveTypeId ? r.leaveTypeId === filter.leaveTypeId : true))
      .filter((r) => {
        if (!filter.teamId && !filter.departmentId) return true;
        const user = getUser(r.userId);
        if (filter.teamId && user?.teamId !== filter.teamId) return false;
        if (filter.departmentId && user?.departmentId !== filter.departmentId) return false;
        return true;
      })
      .map((r) => ({ ...r }));
  },
};
