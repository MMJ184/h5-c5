import { LeaveCalendarEvent, LeaveRequest, LeaveType, User } from '../types';
import { toDateOnly } from './date';

export const mapRequestsToCalendarEvents = (
  requests: LeaveRequest[],
  users: User[],
  leaveTypes: LeaveType[]
): LeaveCalendarEvent[] => {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const typeMap = new Map(leaveTypes.map((t) => [t.id, t]));

  return requests.map((request) => {
    const user = userMap.get(request.userId);
    const leaveType = typeMap.get(request.leaveTypeId);

    const start = toDateOnly(new Date(request.fromDate));
    const end = toDateOnly(new Date(request.toDate));
    end.setDate(end.getDate() + 1);

    return {
      id: request.id,
      title: `${user?.name ?? 'Employee'} · ${leaveType?.name ?? 'Leave'}`,
      start,
      end,
      status: request.status,
      userId: request.userId,
      userName: user?.name ?? 'Employee',
      leaveTypeName: leaveType?.name ?? 'Leave',
      leaveTypeId: request.leaveTypeId,
      requestId: request.id,
    };
  });
};
