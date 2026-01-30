import { LeaveBalance, LeaveRequest, LeaveType, User } from '../types';

const now = new Date();
const iso = (date: Date) => date.toISOString();
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const users: User[] = [
  { id: 'u_1', name: 'Ava Brooks', role: 'EMPLOYEE', managerId: 'u_3', teamId: 't_1', departmentId: 'd_1' },
  { id: 'u_2', name: 'Ethan Park', role: 'EMPLOYEE', managerId: 'u_3', teamId: 't_1', departmentId: 'd_1' },
  { id: 'u_3', name: 'Maya Singh', role: 'MANAGER', teamId: 't_1', departmentId: 'd_1' },
  { id: 'u_4', name: 'HR Team', role: 'HR', teamId: 't_hr', departmentId: 'd_hr' },
  { id: 'u_5', name: 'Liam Chen', role: 'EMPLOYEE', managerId: 'u_6', teamId: 't_2', departmentId: 'd_2' },
  { id: 'u_6', name: 'Sofia Rivera', role: 'MANAGER', teamId: 't_2', departmentId: 'd_2' },
];

const leaveTypes: LeaveType[] = [
  {
    id: 'lt_annual',
    name: 'Annual Leave',
    unit: 'DAY',
    allowNegativeBalance: false,
    countWeekends: false,
    countHolidays: false,
    maxConsecutiveDays: 10,
  },
  {
    id: 'lt_sick',
    name: 'Sick Leave',
    unit: 'DAY',
    allowNegativeBalance: true,
    countWeekends: false,
    countHolidays: false,
    maxConsecutiveDays: 7,
  },
  {
    id: 'lt_unpaid',
    name: 'Unpaid Leave',
    unit: 'DAY',
    allowNegativeBalance: true,
    countWeekends: true,
    countHolidays: true,
  },
  {
    id: 'lt_half',
    name: 'Half Day',
    unit: 'HALF_DAY',
    allowNegativeBalance: false,
    countWeekends: false,
    countHolidays: false,
  },
];

const leaveBalances: LeaveBalance[] = [
  { userId: 'u_1', leaveTypeId: 'lt_annual', available: 12, used: 4 },
  { userId: 'u_1', leaveTypeId: 'lt_sick', available: 8, used: 1 },
  { userId: 'u_1', leaveTypeId: 'lt_unpaid', available: 0, used: 0 },
  { userId: 'u_1', leaveTypeId: 'lt_half', available: 4, used: 0 },
  { userId: 'u_2', leaveTypeId: 'lt_annual', available: 10, used: 2 },
  { userId: 'u_2', leaveTypeId: 'lt_sick', available: 6, used: 0 },
  { userId: 'u_5', leaveTypeId: 'lt_annual', available: 14, used: 3 },
];

const leaveRequests: LeaveRequest[] = [
  {
    id: 'lr_1',
    userId: 'u_1',
    leaveTypeId: 'lt_annual',
    fromDate: iso(addDays(now, 2)),
    toDate: iso(addDays(now, 4)),
    days: 3,
    status: 'APPROVED',
    approverManagerId: 'u_3',
    approverHrId: 'u_4',
    managerDecision: { status: 'APPROVED', comment: 'OK', at: iso(addDays(now, -2)), byId: 'u_3' },
    hrDecision: { status: 'APPROVED', comment: 'Approved', at: iso(addDays(now, -1)), byId: 'u_4' },
    reason: 'Family trip',
    createdAt: iso(addDays(now, -4)),
    updatedAt: iso(addDays(now, -1)),
  },
  {
    id: 'lr_2',
    userId: 'u_1',
    leaveTypeId: 'lt_sick',
    fromDate: iso(addDays(now, -3)),
    toDate: iso(addDays(now, -3)),
    days: 1,
    status: 'APPROVED',
    approverManagerId: 'u_3',
    managerDecision: { status: 'APPROVED', comment: 'Get well', at: iso(addDays(now, -4)), byId: 'u_3' },
    reason: 'Doctor visit',
    createdAt: iso(addDays(now, -5)),
    updatedAt: iso(addDays(now, -4)),
  },
  {
    id: 'lr_3',
    userId: 'u_2',
    leaveTypeId: 'lt_annual',
    fromDate: iso(addDays(now, 5)),
    toDate: iso(addDays(now, 6)),
    days: 2,
    status: 'PENDING',
    approverManagerId: 'u_3',
    reason: 'Wedding',
    createdAt: iso(addDays(now, -1)),
    updatedAt: iso(addDays(now, -1)),
  },
  {
    id: 'lr_4',
    userId: 'u_5',
    leaveTypeId: 'lt_annual',
    fromDate: iso(addDays(now, 7)),
    toDate: iso(addDays(now, 11)),
    days: 5,
    status: 'PENDING',
    approverManagerId: 'u_6',
    approverHrId: 'u_4',
    reason: 'Extended leave',
    createdAt: iso(addDays(now, -2)),
    updatedAt: iso(addDays(now, -2)),
  },
  {
    id: 'lr_5',
    userId: 'u_2',
    leaveTypeId: 'lt_half',
    fromDate: iso(addDays(now, 1)),
    toDate: iso(addDays(now, 1)),
    days: 0.5,
    status: 'REJECTED',
    approverManagerId: 'u_3',
    managerDecision: { status: 'REJECTED', comment: 'Coverage issue', at: iso(addDays(now, -1)), byId: 'u_3' },
    reason: 'Personal errand',
    createdAt: iso(addDays(now, -2)),
    updatedAt: iso(addDays(now, -1)),
  },
];

export const dummyLeaveStore = {
  users,
  leaveTypes,
  leaveBalances,
  leaveRequests,
  currentUserId: 'u_1',
  nextRequestId: (() => {
    let counter = leaveRequests.length + 1;
    return () => `lr_${counter++}`;
  })(),
};
