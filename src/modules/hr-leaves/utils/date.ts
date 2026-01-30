import { LeaveType } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatIsoDate = (date: Date) => date.toISOString().split('T')[0];

export const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const getHolidays = (): string[] => {
  return ['2026-01-01', '2026-07-04', '2026-12-25'];
};

export const calculateLeaveDays = (
  fromDate: Date,
  toDate: Date,
  leaveType: LeaveType
): { days: number; skipped: number } => {
  const start = toDateOnly(fromDate);
  const end = toDateOnly(toDate);
  const holidays = new Set(getHolidays());

  let days = 0;
  let skipped = 0;
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = new Date(d.getTime() + MS_PER_DAY)) {
    const iso = formatIsoDate(d);
    if (!leaveType.countWeekends && isWeekend(d)) {
      skipped += 1;
      continue;
    }
    if (!leaveType.countHolidays && holidays.has(iso)) {
      skipped += 1;
      continue;
    }
    days += 1;
  }

  if (leaveType.unit === 'HALF_DAY') {
    return { days: 0.5, skipped };
  }

  return { days, skipped };
};

export const rangesOverlap = (startA: Date, endA: Date, startB: Date, endB: Date) => {
  return startA.getTime() <= endB.getTime() && startB.getTime() <= endA.getTime();
};
