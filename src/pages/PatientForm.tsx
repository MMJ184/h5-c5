// src/pages/PatientForm.tsx
import React, { useEffect } from 'react';

import { Button, DatePicker, Form, Input, Modal, Select, Upload, message } from 'antd';
import type { UploadProps } from 'antd';

import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

export type PatientFormValues = {
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  phone: string;
  doctor?: string;
  lastVisit?: dayjs.Dayjs | null;
  status?: 'active' | 'inactive' | 'discharged';
  avatar?: any; // file list or similar
};

export type PatientFormProps = {
  visible: boolean;
  mode?: 'add' | 'edit';
  initialValues?: Partial<PatientFormValues>;
  onCancel: () => void;
  onSubmit: (values: PatientFormValues) => Promise<void> | void;
  confirmLoading?: boolean;
  /** Optional: text for modal title */
  title?: string;
  /** Optional upload placeholder URL */
  avatarPlaceholderUrl?: string;
};

/**
 * PatientForm component
 * - Controlled by `visible`
 * - Uses antd Form inside a Modal
 * - Calls onSubmit with validated values (lastVisit converted to dayjs)
 */
export default function PatientForm({
  visible,
  mode = 'add',
  initialValues,
  onCancel,
  onSubmit,
  confirmLoading = false,
  title,
  avatarPlaceholderUrl = '/mnt/data/16c3ce9c-8556-44f1-bb3b-ffd76ea34e47.png',
}: PatientFormProps) {
  const [form] = Form.useForm<PatientFormValues>();

  useEffect(() => {
    // populate form when initial values change
    if (visible) {
      const initial = {
        ...initialValues,
        lastVisit: initialValues?.lastVisit ? dayjs(initialValues.lastVisit) : undefined,
      };
      form.setFieldsValue(initial);
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialValues]);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      // prevent auto upload; parent can handle real upload via onSubmit
      return false;
    },
    maxCount: 1,
    onChange(info) {
      // optional: show file name
      if (info.file && info.file.name) {
        // keep small feedback
      }
    },
    onRemove() {
      message.info('Avatar removed (not uploaded)');
    },
  };

  async function handleOk() {
    try {
      const values = await form.validateFields();
      // onSubmit expects lastVisit as dayjs or undefined; keep avatar file list as-is
      await onSubmit(values as PatientFormValues);
    } catch (err) {
      // validation error — form will show messages
    }
  }

  return (
    <Modal
      open={visible}
      title={title ?? (mode === 'add' ? 'Add Patient' : 'Edit Patient')}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'add' ? 'Create' : 'Save'}
      confirmLoading={confirmLoading}
      destroyOnHidden={true}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Full name"
          rules={[{ required: true, message: 'Please enter name' }]}
        >
          <Input placeholder="Patient full name" />
        </Form.Item>

        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
          <Select>
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
          </Select>
        </Form.Item>

        <Form.Item name="age" label="Age" rules={[{ required: true, message: 'Please enter age' }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
          rules={[{ required: true, message: 'Please enter phone' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="doctor" label="Doctor">
          <Input />
        </Form.Item>

        <Form.Item name="lastVisit" label="Last visit">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="status" label="Status" initialValue="active">
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="discharged">Discharged</Option>
          </Select>
        </Form.Item>

        <Form.Item name="avatar" label="Avatar">
          <Upload {...uploadProps} listType="picture">
            <Button icon={<UploadOutlined />}>Choose image</Button>
          </Upload>
          <div style={{ marginTop: 8 }}>
            <small>Placeholder / recommended size: 120×120</small>
            <div style={{ marginTop: 8 }}>
              <img
                src={avatarPlaceholderUrl}
                alt="avatar placeholder"
                style={{ width: 80, borderRadius: 6 }}
              />
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
