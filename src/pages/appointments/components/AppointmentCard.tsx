import React from 'react';
import { Card, Space, Tag, Tooltip, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Appointment } from '../hooks/useAppointments';

type Props = {
  item: Appointment;
  onEdit?: (item: Appointment) => void;
  onDelete?: (id: string) => void;
  onChangeStatus?: (id: string, status: Appointment['status']) => void;
};

export default function AppointmentCard({ item, onEdit, onDelete }: Props) {
  const meta = `${item.patientName}${item.time ? ` • ${item.time}` : ''}`;

  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        borderLeft: `4px solid ${item.color ?? '#1677ff'}`,
      }}
      bodyStyle={{ padding: 8 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{item.title}</div>
          <div style={{ color: 'var(--antd-color-text-secondary, #666)' }}>{meta}</div>
          {item.notes ? (
            <div style={{ marginTop: 6, fontSize: 12, color: '#444' }}>{item.notes}</div>
          ) : null}
        </div>

        <Space direction="vertical" style={{ alignItems: 'flex-end' }}>
          <Tag>{item.status}</Tag>
          <Space>
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />} onClick={() => onEdit?.(item)} />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete?.(item.id)}
              />
            </Tooltip>
          </Space>
        </Space>
      </div>
    </Card>
  );
}
