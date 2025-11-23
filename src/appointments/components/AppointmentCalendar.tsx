import React from 'react';
import { Calendar, Badge, Card, Button } from 'antd';
import type { Appointment } from '../hooks/useAppointments';
import dayjs from 'dayjs';

type Props = {
  appointments: Appointment[];
  loading?: boolean;
  onCreateForDate?: (dateIso: string) => void;
  onEdit?: (a: Appointment) => void;
};

export default function AppointmentCalendar({ appointments, onCreateForDate, onEdit }: Props) {
  function dateCellRender(value: dayjs.Dayjs) {
    const date = value.format('YYYY-MM-DD');
    const list = appointments.filter((a) => a.date === date);

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {list.map((item) => (
          <li key={item.id} style={{ marginBottom: 6 }}>
            <Badge
              color={item.color ?? 'blue'}
              text={
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(item);
                  }}
                >
                  {item.time ? `${item.time} • ` : ''}
                  {item.title}
                </a>
              }
            />
          </li>
        ))}
      </ul>
    );
  }

  function onPanelChange(value: any) {
    // not required; placeholder
  }

  return (
    <Card>
      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => onCreateForDate?.(dayjs().format('YYYY-MM-DD'))}>New Today</Button>
      </div>
      <Calendar
        dateCellRender={dateCellRender}
        onPanelChange={onPanelChange}
        fullscreen
        onSelect={(date) => {
          // open create modal for selected date
          onCreateForDate?.((date as any).format('YYYY-MM-DD'));
        }}
      />
    </Card>
  );
}
