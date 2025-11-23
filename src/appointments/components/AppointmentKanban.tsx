import React, { useMemo } from 'react';
import { Row, Col, Card, Empty, Select } from 'antd';
import AppointmentCard from './AppointmentCard';
import type { Appointment } from '../hooks/useAppointments';

type Props = {
  appointments: Appointment[];
  loading?: boolean;
  onEdit?: (a: Appointment) => void;
  onDelete?: (id: string) => void;
  onChangeStatus?: (id: string, status: Appointment['status']) => void;
};

const STATUSES: { key: Appointment['status']; title: string }[] = [
  { key: 'pending', title: 'Pending' },
  { key: 'confirmed', title: 'Confirmed' },
  { key: 'completed', title: 'Completed' },
  { key: 'cancelled', title: 'Cancelled' },
];

export default function AppointmentKanban({ appointments, onEdit, onDelete, onChangeStatus }: Props) {
  const grouped = useMemo(() => {
    const map: Record<string, Appointment[]> = { pending: [], confirmed: [], completed: [], cancelled: [] };
    appointments.forEach((a) => {
      map[a.status] = map[a.status] || [];
      map[a.status].push(a);
    });
    return map;
  }, [appointments]);

  return (
    <Row gutter={16}>
      {STATUSES.map((s) => (
        <Col key={s.key} xs={24} sm={12} md={6}>
          <Card
            title={`${s.title} (${(grouped[s.key] || []).length})`}
            size="small"
            style={{ minHeight: 200 }}
            bodyStyle={{ padding: 8 }}
          >
            {(grouped[s.key] || []).length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items" />
            ) : (
              (grouped[s.key] || []).map((item) => (
                <div key={item.id}>
                  <AppointmentCard item={item} onEdit={onEdit} onDelete={onDelete} />
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <Select
                      size="small"
                      value={item.status}
                      onChange={(val) => onChangeStatus?.(item.id, val)}
                      style={{ width: 140 }}
                    >
                      <Select.Option value="pending">Pending</Select.Option>
                      <Select.Option value="confirmed">Confirmed</Select.Option>
                      <Select.Option value="completed">Completed</Select.Option>
                      <Select.Option value="cancelled">Cancelled</Select.Option>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
