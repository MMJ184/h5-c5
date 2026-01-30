import { Alert, Button, Card, Form, Input, Select, Space, Typography } from 'antd';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';

import { useApplyLeave, useLeaveBalance, useLeaveCurrentUser, useLeaveRequests, useLeaveTypes } from '../hooks/useLeaveData';
import { calculateLeaveDays, rangesOverlap } from '../utils/date';

const { RangePicker } = DatePicker;

interface FormValues {
  range?: [Dayjs, Dayjs];
  leaveTypeId?: string;
  reason?: string;
}

export const ApplyLeaveForm = () => {
  const [form] = Form.useForm<FormValues>();
  const { data: currentUser } = useLeaveCurrentUser();
  const { data: leaveTypes = [], isLoading: leaveTypesLoading } = useLeaveTypes();
  const { data: balances = [] } = useLeaveBalance(currentUser?.id);
  const { data: myRequests = [] } = useLeaveRequests(currentUser?.id);
  const applyLeave = useApplyLeave();

  const range = Form.useWatch('range', form);
  const leaveTypeId = Form.useWatch('leaveTypeId', form);

  const selectedType = useMemo(
    () => leaveTypes.find((type) => type.id === leaveTypeId),
    [leaveTypes, leaveTypeId]
  );

  const calculation = useMemo(() => {
    if (!range || !selectedType) return null;
    return calculateLeaveDays(range[0].toDate(), range[1].toDate(), selectedType);
  }, [range, selectedType]);

  const balance = useMemo(() => {
    if (!leaveTypeId || !currentUser) return undefined;
    return balances.find((b) => b.leaveTypeId === leaveTypeId);
  }, [balances, currentUser, leaveTypeId]);

  const overlapWarning = useMemo(() => {
    if (!range || !currentUser) return false;
    const start = range[0].toDate();
    const end = range[1].toDate();
    return myRequests.some((request) => {
      if (request.status !== 'PENDING') return false;
      return rangesOverlap(start, end, new Date(request.fromDate), new Date(request.toDate));
    });
  }, [range, myRequests, currentUser]);

  const canSubmit = calculation && calculation.days > 0;

  const onFinish = async (values: FormValues) => {
    if (!currentUser || !values.range || !selectedType || !calculation) return;

    const maxConsecutive = selectedType.maxConsecutiveDays;
    if (maxConsecutive && calculation.days > maxConsecutive) {
      form.setFields([
        {
          name: 'range',
          errors: [`Max consecutive days allowed: ${maxConsecutive}`],
        },
      ]);
      return;
    }

    if (balance && !selectedType.allowNegativeBalance) {
      const remaining = balance.available - calculation.days;
      if (remaining < 0) {
        form.setFields([
          {
            name: 'leaveTypeId',
            errors: ['Insufficient leave balance.'],
          },
        ]);
        return;
      }
    }

    await applyLeave.mutateAsync({
      userId: currentUser.id,
      leaveTypeId: selectedType.id,
      fromDate: values.range[0].startOf('day').toISOString(),
      toDate: values.range[1].startOf('day').toISOString(),
      days: calculation.days,
      reason: values.reason,
    });

    form.resetFields();
  };

  return (
    <Card title="Apply for Leave">
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Leave Dates"
          name="range"
          rules={[{ required: true, message: 'Please select dates' }]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Leave Type"
          name="leaveTypeId"
          rules={[{ required: true, message: 'Please select a leave type' }]}
        >
          <Select
            loading={leaveTypesLoading}
            placeholder="Select leave type"
            options={leaveTypes.map((type) => ({ label: type.name, value: type.id }))}
          />
        </Form.Item>

        <Form.Item label="Reason" name="reason">
          <Input.TextArea rows={3} placeholder="Optional" />
        </Form.Item>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>Leave Days:</Typography.Text>{' '}
            <Typography.Text>{calculation ? calculation.days : '-'} day(s)</Typography.Text>
          </div>
          {balance && (
            <div>
              <Typography.Text strong>Balance:</Typography.Text>{' '}
              <Typography.Text>
                {balance.available} available / {balance.used} used
              </Typography.Text>
            </div>
          )}
          {overlapWarning && (
            <Alert
              type="warning"
              showIcon
              message="You have pending leave requests that overlap these dates."
            />
          )}
        </Space>

        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit" loading={applyLeave.isPending} disabled={!canSubmit}>
            Apply
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
