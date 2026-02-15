import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';

import { leaveService } from '../services/leaveService';
import {
  LeaveApprovalInput,
  LeaveApprovalsFilter,
  LeaveCalendarFilter,
  LeaveRequestInput,
  LeaveCancelInput,
} from '../types';
import {
  leaveApprovalsKey,
  leaveBalanceKey,
  leaveCalendarKey,
  leaveCurrentUserKey,
  leaveRequestsKey,
  leaveTypesKey,
  leaveUsersKey,
} from './queryKeys';

export const useLeaveCurrentUser = () =>
  useQuery({ queryKey: leaveCurrentUserKey, queryFn: () => leaveService.getCurrentUser() });

export const useLeaveUsers = () =>
  useQuery({ queryKey: leaveUsersKey, queryFn: () => leaveService.listUsers() });

export const useLeaveTypes = () =>
  useQuery({ queryKey: leaveTypesKey, queryFn: () => leaveService.listLeaveTypes() });

export const useLeaveBalance = (userId?: string) =>
  useQuery({
    queryKey: leaveBalanceKey(userId ?? 'unknown'),
    queryFn: () => leaveService.listLeaveBalances(userId ?? ''),
    enabled: Boolean(userId),
  });

export const useLeaveRequests = (userId?: string, filters: { status?: string; from?: string; to?: string } = {}) =>
  useQuery({
    queryKey: leaveRequestsKey(userId ?? 'unknown', filters),
    queryFn: () => leaveService.listLeaveRequests(userId ?? '', filters),
    enabled: Boolean(userId),
  });

export const useLeaveApprovals = (filters: LeaveApprovalsFilter) =>
  useQuery({
    queryKey: leaveApprovalsKey(filters),
    queryFn: () => leaveService.listPendingApprovals(filters),
  });

export const useLeaveCalendar = (filters: LeaveCalendarFilter) =>
  useQuery({
    queryKey: leaveCalendarKey(filters),
    queryFn: () => leaveService.listCalendar(filters),
  });

export const useApplyLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaveRequestInput) => leaveService.createLeaveRequest(input),
    onSuccess: () => {
      notification.success({ title: 'Leave request submitted' });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveCalendar'] });
      queryClient.invalidateQueries({ queryKey: ['leaveApprovals'] });
    },
    onError: (error: any) => {
      notification.error({ title: 'Unable to submit request', description: error?.message });
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaveApprovalInput) => leaveService.approveLeave(input),
    onSuccess: () => {
      notification.success({ title: 'Leave approved' });
      queryClient.invalidateQueries({ queryKey: ['leaveApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['leaveCalendar'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
    onError: (error: any) => {
      notification.error({ title: 'Unable to approve', description: error?.message });
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaveApprovalInput) => leaveService.rejectLeave(input),
    onSuccess: () => {
      notification.success({ title: 'Leave rejected' });
      queryClient.invalidateQueries({ queryKey: ['leaveApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveCalendar'] });
    },
    onError: (error: any) => {
      notification.error({ title: 'Unable to reject', description: error?.message });
    },
  });
};

export const useCancelLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaveCancelInput) => leaveService.cancelLeave(input),
    onSuccess: () => {
      notification.success({ title: 'Leave cancelled' });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveCalendar'] });
    },
    onError: (error: any) => {
      notification.error({ title: 'Unable to cancel', description: error?.message });
    },
  });
};
