import { Tag } from 'antd';
import { LeaveStatus } from '../types';

const statusColor: Record<LeaveStatus, string> = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'default',
};

export const LeaveStatusTag = ({ status }: { status: LeaveStatus }) => {
  return <Tag color={statusColor[status]}>{status}</Tag>;
};
