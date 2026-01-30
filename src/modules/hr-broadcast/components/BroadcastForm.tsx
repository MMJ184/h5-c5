import { Button, Card, Form, Input, Radio, Select, Space, Typography, notification } from 'antd';
import { useMemo } from 'react';

import { useNotifications } from '../../../app/providers/NotificationProvider';
import RichTextEditor from '../../../components/RichTextEditor';

interface BroadcastFormValues {
  title: string;
  message: string;
  audience: 'ALL' | 'SPECIFIC';
  recipients?: string[];
  level: 'info' | 'warning' | 'success' | 'error';
}

const dummyUsers = [
  { id: 'u_1', name: 'Ava Brooks' },
  { id: 'u_2', name: 'Ethan Park' },
  { id: 'u_3', name: 'Maya Singh' },
  { id: 'u_4', name: 'HR Team' },
  { id: 'u_5', name: 'Liam Chen' },
];

export const BroadcastForm = () => {
  const [form] = Form.useForm<BroadcastFormValues>();
  const { addNotification } = useNotifications();
  const audience = Form.useWatch('audience', form) ?? 'ALL';

  const userOptions = useMemo(
    () => dummyUsers.map((user) => ({ label: user.name, value: user.id })),
    []
  );

  const handleSubmit = (values: BroadcastFormValues) => {
    const payload = {
      ...values,
      recipients: values.audience === 'ALL' ? [] : values.recipients ?? [],
    };
    addNotification({
      title: values.title,
      description:
        values.audience === 'ALL'
          ? 'Broadcast sent to all users.'
          : `Broadcast sent to ${payload.recipients.length} user(s).`,
      type: values.level,
    });
    notification.success({ message: 'Broadcast sent' });
    form.resetFields();
  };

  return (
    <Card title="Broadcast Message">
      <Typography.Paragraph type="secondary">
        Send a broadcast to all users or selected recipients. This uses dummy data for now.
      </Typography.Paragraph>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ audience: 'ALL', level: 'info' }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Announcement title" />
        </Form.Item>

        <Form.Item
          label="Message"
          name="message"
          rules={[{ required: true, message: 'Please enter the message' }]}
          valuePropName="value"
          getValueFromEvent={(value) => value}
        >
          <RichTextEditor placeholder="Type the broadcast message" />
        </Form.Item>

        <Form.Item label="Severity" name="level">
          <Select
            options={[
              { label: 'Info', value: 'info' },
              { label: 'Warning', value: 'warning' },
              { label: 'Success', value: 'success' },
              { label: 'Error', value: 'error' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Audience" name="audience">
          <Radio.Group>
            <Radio value="ALL">All Users</Radio>
            <Radio value="SPECIFIC">Specific Users</Radio>
          </Radio.Group>
        </Form.Item>

        {audience === 'SPECIFIC' && (
          <Form.Item
            label="Recipients"
            name="recipients"
            rules={[{ required: true, message: 'Select at least one recipient' }]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select users"
              options={userOptions}
            />
          </Form.Item>
        )}

        <Space>
          <Button type="primary" htmlType="submit">
            Send Broadcast
          </Button>
          <Button onClick={() => form.resetFields()}>Reset</Button>
        </Space>
      </Form>
    </Card>
  );
};
