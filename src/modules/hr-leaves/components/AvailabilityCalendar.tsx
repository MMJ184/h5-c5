import { Badge, Calendar, Card, Col, Divider, Row, Select, Space, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import CalendarHeader from '../../../pages/appointments/components/calendar/CalendarHeader';
import { CALENDAR_CONFIG } from '../../../pages/appointments/components/calendar/calendar.config';
import { dateKey } from '../../../pages/appointments/components/calendar/calendar.utils';
import type { CalendarProps } from 'antd';
import type { ViewMode } from '../../../pages/appointments/components/calendar/calendar.types';

import { useLeaveCalendar, useLeaveCurrentUser, useLeaveTypes, useLeaveUsers } from '../hooks/useLeaveData';
import { LeaveStatus } from '../types';
import { mapRequestsToCalendarEvents } from '../utils/mappers';

interface DayEventItem {
  id: string;
  title: string;
  userName: string;
  leaveTypeName: string;
  status: LeaveStatus;
}

const statusColors: Record<LeaveStatus, string> = {
  APPROVED: '#52c41a',
  PENDING: '#faad14',
  REJECTED: '#f5222d',
  CANCELLED: '#8c8c8c',
};

const statusTagColor: Record<LeaveStatus, string> = {
  APPROVED: 'green',
  PENDING: 'gold',
  REJECTED: 'red',
  CANCELLED: 'default',
};

export const AvailabilityCalendar = () => {
  const navigate = useNavigate();
  const { data: currentUser } = useLeaveCurrentUser();
  const { data: users = [] } = useLeaveUsers();
  const { data: leaveTypes = [] } = useLeaveTypes();

  const [filters, setFilters] = useState({
    teamId: undefined as string | undefined,
    departmentId: undefined as string | undefined,
    userId: undefined as string | undefined,
    leaveTypeId: undefined as string | undefined,
    status: 'APPROVED' as LeaveStatus | undefined,
  });

  const [current, setCurrent] = useState(dayjs());
  const [view, setView] = useState<ViewMode>('month');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < CALENDAR_CONFIG.mobileBreakpoint;
      setIsMobile(mobile);
      if (mobile && view === 'week') setView('day');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [view]);

  const range = useMemo(() => {
    if (view === 'month') {
      return { from: current.startOf('month').toISOString(), to: current.endOf('month').toISOString() };
    }
    if (view === 'week') {
      return { from: current.startOf('week').toISOString(), to: current.endOf('week').toISOString() };
    }
    return { from: current.startOf('day').toISOString(), to: current.endOf('day').toISOString() };
  }, [current, view]);

  const { data: calendarRequests = [], isLoading } = useLeaveCalendar({
    from: range.from,
    to: range.to,
    ...filters,
  });

  const events = useMemo(() => {
    const mapped = mapRequestsToCalendarEvents(calendarRequests, users, leaveTypes);
    if (!filters.status && currentUser) {
      return mapped.filter(
        (item) => item.status === 'APPROVED' || (item.status === 'PENDING' && item.userId === currentUser.id)
      );
    }
    return mapped;
  }, [calendarRequests, users, leaveTypes, filters.status, currentUser]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, DayEventItem[]>();
    events.forEach((event) => {
      const start = dayjs(event.start);
      const end = dayjs(event.end).subtract(1, 'day');
      for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
        const key = dateKey(d);
        const list = map.get(key) ?? [];
        list.push({
          id: event.id,
          title: event.title,
          userName: event.userName,
          leaveTypeName: event.leaveTypeName,
          status: event.status,
        });
        map.set(key, list);
      }
    });
    return map;
  }, [events]);

  const teamOptions = useMemo(() => {
    const teams = Array.from(new Set(users.map((u) => u.teamId).filter(Boolean)));
    return teams.map((team) => ({ label: team, value: team }));
  }, [users]);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(users.map((u) => u.departmentId).filter(Boolean)));
    return depts.map((dept) => ({ label: dept, value: dept }));
  }, [users]);

  const userOptions = useMemo(() => users.map((u) => ({ label: u.name, value: u.id })), [users]);
  const typeOptions = useMemo(() => leaveTypes.map((t) => ({ label: t.name, value: t.id })), [leaveTypes]);

  const cellRender: CalendarProps['cellRender'] = (date, info) => {
    if (info.type !== 'date') return info.originNode;
    const list = eventsByDate.get(dateKey(date)) ?? [];
    if (!list.length) return null;

    return (
      <div style={{ marginTop: 4 }}>
        {list.slice(0, 3).map((item) => (
          <Tooltip key={item.id} title={`${item.userName} · ${item.leaveTypeName}`}>
            <div
              style={{
                fontSize: 11,
                lineHeight: '16px',
                padding: '0 4px',
                marginBottom: 2,
                borderRadius: 4,
                background: statusColors[item.status],
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.title}
            </div>
          </Tooltip>
        ))}
        {list.length > 3 && (
          <div
            style={{
              fontSize: 11,
              color: '#888',
              cursor: 'pointer',
            }}
            onClick={(event) => {
              event.stopPropagation();
              setCurrent(dayjs(date));
              setView('day');
            }}
          >
            +{list.length - 3} more
          </div>
        )}
      </div>
    );
  };

  const renderDayList = (day: dayjs.Dayjs) => {
    const list = eventsByDate.get(dateKey(day)) ?? [];
    return (
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        {list.length === 0 && (
          <Typography.Text type="secondary">No leave records</Typography.Text>
        )}
        {list.map((item) => (
          <Badge
            key={item.id}
            color={statusColors[item.status]}
            text={
              <Space size={6}>
                <Typography.Text>{item.title}</Typography.Text>
                <Tag color={statusTagColor[item.status]}>{item.status}</Tag>
              </Space>
            }
          />
        ))}
      </Space>
    );
  };

  const weekDays = Array.from({ length: 7 }).map((_, i) => current.startOf('week').add(i, 'day'));

  return (
    <Card title="Availability Calendar" loading={isLoading}>
      <Space wrap style={{ marginBottom: 12 }}>
        <Select
          allowClear
          placeholder="Team"
          options={teamOptions}
          value={filters.teamId}
          onChange={(value) => setFilters((prev) => ({ ...prev, teamId: value }))}
          style={{ minWidth: 160 }}
        />
        <Select
          allowClear
          placeholder="Department"
          options={departmentOptions}
          value={filters.departmentId}
          onChange={(value) => setFilters((prev) => ({ ...prev, departmentId: value }))}
          style={{ minWidth: 180 }}
        />
        <Select
          allowClear
          placeholder="User"
          options={userOptions}
          value={filters.userId}
          onChange={(value) => setFilters((prev) => ({ ...prev, userId: value }))}
          style={{ minWidth: 180 }}
        />
        <Select
          allowClear
          placeholder="Leave Type"
          options={typeOptions}
          value={filters.leaveTypeId}
          onChange={(value) => setFilters((prev) => ({ ...prev, leaveTypeId: value }))}
          style={{ minWidth: 180 }}
        />
        <Select
          allowClear
          placeholder="Status"
          value={filters.status}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          style={{ minWidth: 140 }}
          options={[
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Rejected', value: 'REJECTED' },
          ]}
        />
      </Space>

      <CalendarHeader
        view={view}
        current={current}
        isMobile={isMobile}
        onViewChange={setView}
        onPrev={() =>
          setCurrent((c) =>
            view === 'month' ? c.subtract(1, 'month') : view === 'week' ? c.subtract(1, 'week') : c.subtract(1, 'day')
          )
        }
        onNext={() =>
          setCurrent((c) => (view === 'month' ? c.add(1, 'month') : view === 'week' ? c.add(1, 'week') : c.add(1, 'day')))
        }
        onToday={() => setCurrent(dayjs())}
        onCreateNow={() => navigate({ to: '/hr/leaves/apply' })}
      />

      {view === 'month' && (
        <Calendar
          value={current}
          onSelect={(value) => {
            setCurrent(dayjs(value));
            if (view !== 'month') return;
          }}
          onPanelChange={(value) => setCurrent(dayjs(value))}
          cellRender={cellRender}
          fullscreen
        />
      )}

      {view === 'week' && (
        <Row gutter={12}>
          {weekDays.map((day) => (
            <Col key={day.format('YYYY-MM-DD')} style={{ flex: 1 }}>
              <Card size="small" title={`${day.format('ddd')} · ${day.format('MMM D')}`}>
                {renderDayList(day)}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {view === 'day' && (
        <Card size="small" title={current.format('dddd, MMM D')}>
          {renderDayList(current)}
        </Card>
      )}

      <Divider />
      <Space wrap>
        <Tag color="green">Approved</Tag>
        <Tag color="gold">Pending</Tag>
        <Tag color="default">Holiday</Tag>
      </Space>
    </Card>
  );
};
