import { Button, Card, Space, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';

import { useCancelLeave, useLeaveRequests, useLeaveTypes, useLeaveUsers } from '../hooks/useLeaveData';
import { LeaveRequest } from '../types';
import { LeaveStatusTag } from './LeaveStatusTag';

interface LeaveRequestsTableProps {
  userId: string;
}

export const LeaveRequestsTable = ({ userId }: LeaveRequestsTableProps) => {
  const { data: requests = [], isLoading } = useLeaveRequests(userId);
  const { data: leaveTypes = [] } = useLeaveTypes();
  const { data: users = [] } = useLeaveUsers();
  const cancelLeave = useCancelLeave();

  const typeMap = useMemo(() => new Map(leaveTypes.map((t) => [t.id, t.name])), [leaveTypes]);
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users]);

  const columns: ColumnsType<LeaveRequest> = [
    {
      title: 'Dates',
      dataIndex: 'fromDate',
      render: (_value, record) => (
        <Typography.Text>
          {new Date(record.fromDate).toLocaleDateString()} - {new Date(record.toDate).toLocaleDateString()}
        </Typography.Text>
      ),
    },
    {
      title: 'Days',
      dataIndex: 'days',
    },
    {
      title: 'Type',
      dataIndex: 'leaveTypeId',
      render: (value) => typeMap.get(value) ?? 'Leave',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value) => <LeaveStatusTag status={value} />,
    },
    {
      title: 'Approvers',
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          {record.approverManagerId && (
            <Typography.Text type="secondary">
              Manager: {userMap.get(record.approverManagerId) ?? '—'}
            </Typography.Text>
          )}
          {record.approverHrId && (
            <Typography.Text type="secondary">HR: {userMap.get(record.approverHrId) ?? '—'}</Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: 'Actions',
      render: (_value, record) => (
        <Space>
          {record.status === 'PENDING' ? (
            <Tooltip title="Cancel request">
              <Button
                size="small"
                danger
                onClick={() => cancelLeave.mutate({ id: record.id, actorId: userId })}
              >
                Cancel
              </Button>
            </Tooltip>
          ) : (
            <Typography.Text type="secondary">—</Typography.Text>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="My Leave Requests">
      <Table
        rowKey="id"
        dataSource={requests}
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 6 }}
      />
    </Card>
  );
};
