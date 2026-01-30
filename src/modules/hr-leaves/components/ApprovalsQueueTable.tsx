import { Button, Card, Form, Input, Modal, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import { useApproveLeave, useLeaveApprovals, useLeaveTypes, useLeaveUsers, useRejectLeave } from '../hooks/useLeaveData';
import { LeaveRequest } from '../types';
import { LeaveStatusTag } from './LeaveStatusTag';

interface ApprovalsQueueTableProps {
  role: 'MANAGER' | 'HR';
  actorId: string;
  teamId?: string;
}

export const ApprovalsQueueTable = ({ role, actorId, teamId }: ApprovalsQueueTableProps) => {
  const { data: approvals = [], isLoading } = useLeaveApprovals({ role, teamId });
  const { data: users = [] } = useLeaveUsers();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const [activeRequest, setActiveRequest] = useState<LeaveRequest | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users]);
  const typeMap = useMemo(() => new Map(leaveTypes.map((t) => [t.id, t.name])), [leaveTypes]);

  const columns: ColumnsType<LeaveRequest> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      render: (value) => userMap.get(value) ?? 'Employee',
    },
    {
      title: 'Dates',
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
      title: 'Reason',
      dataIndex: 'reason',
      render: (value) => value || '—',
    },
    {
      title: 'Actions',
      render: (_value, record) => (
        <Space>
          <Button size="small" type="primary" onClick={() => {
            setAction('approve');
            setActiveRequest(record);
            setComment('');
          }}>
            Approve
          </Button>
          <Button size="small" danger onClick={() => {
            setAction('reject');
            setActiveRequest(record);
            setComment('');
          }}>
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const handleSubmit = () => {
    if (!activeRequest) return;
    if (action === 'approve') {
      approveLeave.mutate({ id: activeRequest.id, role, actorId, comment });
    } else {
      rejectLeave.mutate({ id: activeRequest.id, role, actorId, comment });
    }
    setActiveRequest(null);
  };

  return (
    <Card
      title={
        <Space>
          <Typography.Text>Pending Approvals</Typography.Text>
          <Tag>{role}</Tag>
        </Space>
      }
    >
      <Table rowKey="id" dataSource={approvals} columns={columns} loading={isLoading} pagination={{ pageSize: 6 }} />

      <Modal
        open={Boolean(activeRequest)}
        title={action === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        onCancel={() => setActiveRequest(null)}
        onOk={handleSubmit}
        okText={action === 'approve' ? 'Approve' : 'Reject'}
        okButtonProps={{ danger: action === 'reject' }}
      >
        <Form layout="vertical">
          <Form.Item label="Comment">
            <Input.TextArea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
