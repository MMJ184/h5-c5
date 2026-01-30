export type LeaveRole = 'EMPLOYEE' | 'MANAGER' | 'HR';

export interface User {
  id: string;
  name: string;
  role: LeaveRole;
  managerId?: string;
  teamId?: string;
  departmentId?: string;
}

export type LeaveUnit = 'DAY' | 'HALF_DAY';

export interface LeaveType {
  id: string;
  name: string;
  unit: LeaveUnit;
  allowNegativeBalance: boolean;
  countWeekends: boolean;
  countHolidays: boolean;
  maxConsecutiveDays?: number;
}

export interface LeaveBalance {
  userId: string;
  leaveTypeId: string;
  available: number;
  used: number;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveDecision {
  status: 'APPROVED' | 'REJECTED';
  comment?: string;
  at: string;
  byId: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: LeaveStatus;
  reason?: string;
  approverManagerId?: string;
  approverHrId?: string;
  managerDecision?: LeaveDecision;
  hrDecision?: LeaveDecision;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestInput {
  userId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string;
}

export interface LeaveApprovalInput {
  id: string;
  role: 'MANAGER' | 'HR';
  comment?: string;
  actorId: string;
}

export interface LeaveCancelInput {
  id: string;
  actorId: string;
}

export interface LeaveFilters {
  status?: LeaveStatus;
  from?: string;
  to?: string;
}

export interface LeaveApprovalsFilter {
  role: 'MANAGER' | 'HR';
  teamId?: string;
}

export interface LeaveCalendarFilter {
  from: string;
  to: string;
  teamId?: string;
  departmentId?: string;
  userId?: string;
  leaveTypeId?: string;
  status?: LeaveStatus;
}

export interface LeaveCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: LeaveStatus;
  userId: string;
  userName: string;
  leaveTypeName: string;
  leaveTypeId: string;
  requestId: string;
}
