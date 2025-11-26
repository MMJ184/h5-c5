// src/appointments/components/AppointmentCalendar.tsx
import React, { useMemo, useState } from 'react';
import { Card, Calendar, Badge, Button, Row, Col, Space, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Appointment } from '../hooks/useAppointments';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import type { CalendarProps } from 'antd';

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(localizedFormat);

const { Text } = Typography;

type Props = {
  appointments: Appointment[];
  loading?: boolean;
  onCreateForDate?: (dateIso: string) => void;
  onEdit?: (a: Appointment) => void;
};

export default function AppointmentCalendar({ appointments, onCreateForDate, onEdit }: Props) {
  // central "current" date the view uses
  const [current, setCurrent] = useState(dayjs());
  const [view, setView] = useState<'month' | 'week'>('month');

  // helpers
  const formatMonthTitle = (d: dayjs.Dayjs) => d.format('MMMM YYYY');
  const formatWeekTitle = (d: dayjs.Dayjs) =>
    `${d.startOf('week').format('MMM D')} — ${d.endOf('week').format('MMM D, YYYY')}`;

  function goPrev() {
    setCurrent((c) => (view === 'month' ? c.subtract(1, 'month') : c.subtract(1, 'week')));
  }
  function goNext() {
    setCurrent((c) => (view === 'month' ? c.add(1, 'month') : c.add(1, 'week')));
  }
  function goToday() {
    setCurrent(dayjs());
  }

  // month date cell rendering (keeps previous behavior)
  function dateCellRender(value: dayjs.Dayjs) {
    // value is the day cell from calendar
    const list = appointments.filter((a) => {
      // handle a.date possibly containing time or timezone
      try {
        return dayjs(value).isSame(dayjs(a.date), 'day');
      } catch {
        return value.format('YYYY-MM-DD') === String(a.date);
      }
    });

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

  // cellRender wrapper that replaces deprecated dateCellRender and monthCellRender
  const cellRender: CalendarProps['cellRender'] = (currentDate, info) => {
    // only override the date cells; leave month cells (or others) as default
    if (info?.type === 'date') {
      return dateCellRender(currentDate as dayjs.Dayjs);
    }
    return info?.originNode ?? null;
  };

  // week data: list days for the current week (Sun-Sat)
  const weekDays = useMemo(() => {
    const start = current.startOf('week'); // week starts Sunday by default
    return Array.from({ length: 7 }).map((_, i) => start.add(i, 'day'));
  }, [current]);

  // appointments grouped by date iso (normalized to YYYY-MM-DD)
  const apptsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      // normalize key to YYYY-MM-DD so lookups match dayjs(...).format('YYYY-MM-DD')
      const key = dayjs(a.date).format('YYYY-MM-DD');
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return map;
  }, [appointments]);

  // render week cell (list of appointments for a given day)
  function renderWeekDayColumn(d: dayjs.Dayjs) {
    const dateIso = d.format('YYYY-MM-DD');
    const list = apptsByDate.get(dateIso) ?? [];

    return (
      <div style={{ minHeight: 120 }}>
        {list.map((item) => (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(item);
            }}
            style={{
              borderLeft: `3px solid ${item.color ?? '#1677ff'}`,
              padding: '6px 8px',
              marginBottom: 8,
              borderRadius: 4,
              cursor: 'pointer',
              background: 'var(--antd-background-color, #fff)',
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEdit?.(item);
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: 'var(--antd-color-text-secondary,#666)' }}>
              {item.time ? `${item.time} • ` : ''}
              {item.patientName}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      {/* header with nav + view toggle */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col>
          <Space>
            <Button onClick={goPrev} icon={<LeftOutlined />} />
            <Button onClick={goToday}>Today</Button>
            <Button onClick={goNext} icon={<RightOutlined />} />
            <Text strong style={{ marginLeft: 12 }}>
              {view === 'month' ? formatMonthTitle(current) : formatWeekTitle(current)}
            </Text>
          </Space>
        </Col>

        <Col>
          <Space>
            <Button
              type={view === 'month' ? 'primary' : 'default'}
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button
              type={view === 'week' ? 'primary' : 'default'}
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button onClick={() => onCreateForDate?.(dayjs(current).format('YYYY-MM-DD'))}>
              New on {current.format('MMM D')}
            </Button>
          </Space>
        </Col>
      </Row>

      {view === 'month' ? (
        // AntD Calendar for month view; set value to current to control month shown
        <Calendar
          value={current}
          onSelect={(date) => {
            onCreateForDate?.((date as dayjs.Dayjs).format('YYYY-MM-DD'));
            setCurrent((c) => (date ? (date as dayjs.Dayjs) : c));
          }}
          // use the new cellRender which replaces dateCellRender/monthCellRender
          cellRender={cellRender}
          fullscreen={true} // <- show full calendar
        />
      ) : (
        // custom week view
        <div>
          <Row
            style={{
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            {weekDays.map((d) => (
              <Col key={d.format('YYYY-MM-DD')} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 600 }}>{d.format('ddd')}</div>
                <div>{d.format('MMM D')}</div>
              </Col>
            ))}
          </Row>

          <Row gutter={16}>
            {weekDays.map((d) => (
              <Col key={d.format('YYYY-MM-DD')} style={{ flex: 1 }}>
                <div
                  style={{
                    minHeight: 160,
                    padding: 8,
                    borderRight: '1px solid rgba(0,0,0,0.04)',
                  }}
                  onDoubleClick={() => onCreateForDate?.(d.format('YYYY-MM-DD'))}
                >
                  {renderWeekDayColumn(d)}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Card>
  );
}
