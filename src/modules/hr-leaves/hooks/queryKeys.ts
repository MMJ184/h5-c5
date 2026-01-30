export const leaveTypesKey = ['leaveTypes'];
export const leaveBalanceKey = (userId: string) => ['leaveBalance', userId];
export const leaveRequestsKey = (userId: string, filters: Record<string, unknown>) => [
  'leaveRequests',
  userId,
  filters,
];
export const leaveApprovalsKey = (filters: Record<string, unknown>) => ['leaveApprovals', filters];
export const leaveCalendarKey = (filters: Record<string, unknown>) => ['leaveCalendar', filters];
export const leaveUsersKey = ['leaveUsers'];
export const leaveCurrentUserKey = ['leaveCurrentUser'];
