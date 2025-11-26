import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Select, InputNumber } from 'antd';
import dayjs from 'dayjs';
import type { Appointment } from '../hooks/useAppointments';

const { TextArea } = Input;

type Props = {
  visible: boolean;
  initial?: Partial<Appointment> | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    title: string;
    patientName: string;
    date: string;
    time?: string;
    status: Appointment['status'];
    notes?: string;
    durationMinutes?: number;
    color?: string;
  }) => Promise<void> | void;
};

export default function AppointmentForm({ visible, initial, confirmLoading, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initial) {
        form.setFieldsValue({
          ...initial,
          date: initial.date ? dayjs(initial.date, 'YYYY-MM-DD') : undefined,
          time: initial.time ? dayjs(initial.time, 'HH:mm') : undefined,
        });
      } else {
        form.resetFields();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initial]);

  async function handleOk() {
    const values = await form.validateFields();
    const payload = {
      title: values.title,
      patientName: values.patientName,
      date: values.date.format('YYYY-MM-DD'),
      time: values.time ? values.time.format('HH:mm') : undefined,
      status: values.status,
      notes: values.notes,
      durationMinutes: values.durationMinutes,
      color: values.color,
    };
    await onSubmit(payload);
    form.resetFields();
  }

  return (
    <Modal
      title={initial ? 'Edit appointment' : 'New appointment'}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnHidden={true}
      okText={initial ? 'Update' : 'Create'}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input placeholder="Appointment purpose" />
        </Form.Item>

        <Form.Item
          name="patientName"
          label="Patient"
          rules={[{ required: true, message: 'Please enter patient name' }]}
        >
          <Input placeholder="Patient name" />
        </Form.Item>

        <Form.Item
          style={{ marginBottom: 8 }}
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Select date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="time" label="Time">
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="status" label="Status" initialValue="pending">
          <Select>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="confirmed">Confirmed</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="durationMinutes" label="Duration (minutes)">
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="color" label="Color (hex)">
          <Input placeholder="#1677ff" />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
