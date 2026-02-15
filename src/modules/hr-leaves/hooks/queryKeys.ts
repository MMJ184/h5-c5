export const leaveTypesKey = ['leaveTypes'];
export const leaveBalanceKey = (userId: string) => ['leaveBalance', userId];
export const leaveRequestsKey = (userId: string, filters: object) => [
  'leaveRequests',
  userId,
  filters,
];
export const leaveApprovalsKey = (filters: object) => ['leaveApprovals', filters];
export const leaveCalendarKey = (filters: object) => ['leaveCalendar', filters];
export const leaveUsersKey = ['leaveUsers'];
export const leaveCurrentUserKey = ['leaveCurrentUser'];
