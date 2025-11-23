// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';

import {
  Card,
  Col,
  DatePicker,
  Divider,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

type RecentActivity = {
  key: string;
  time: string;
  user: string;
  action: string;
  status?: string;
};

export default function Dashboard(): JSX.Element {
  // mock state — replace with real API calls
  const [range, setRange] = useState<[moment.Moment | null, moment.Moment | null] | null>(null);
  const [department, setDepartment] = useState<string | 'all'>('all');

  // KPI counts (mock)
  const stats = useMemo(
    () => ({
      patientsToday: 124,
      newPatients: 12,
      appointmentsToday: 58,
      pendingLabResults: 9,
      patientsDelta: 6.4, // percent
      apptDelta: -3.2,
    }),
    [],
  );

  // Line chart data — appointments over last 12 days (mock)
  const appointmentTrend = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        date: new Date(Date.now() - (11 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        value: Math.round(30 + Math.random() * 40 - i * 0.5),
      })),
    [],
  );

  // Column chart: patient admissions by hour (mock)
  const admissionsByHour = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        hour: `${8 + i}:00`,
        count: Math.round(5 + Math.random() * 20),
      })),
    [],
  );

  // Pie chart: patient type distribution
  const patientDistribution = useMemo(
    () => [
      { type: 'Outpatient', value: 520 },
      { type: 'Inpatient', value: 120 },
      { type: 'Emergency', value: 60 },
    ],
    [],
  );

  // Recent activity table (mock)
  const [recent, setRecent] = useState<RecentActivity[]>([]);
  useEffect(() => {
    const rows: RecentActivity[] = [
      {
        key: '1',
        time: '2025-11-21 09:12',
        user: 'Dr. Patel',
        action: 'Added diagnosis to #P-00123',
        status: 'success',
      },
      {
        key: '2',
        time: '2025-11-21 08:45',
        user: 'Lab Tech',
        action: 'Uploaded lab results for #P-00107',
        status: 'success',
      },
      {
        key: '3',
        time: '2025-11-20 17:02',
        user: 'Reception',
        action: 'Checked in appointment #A-0099',
        status: 'info',
      },
      {
        key: '4',
        time: '2025-11-20 16:20',
        user: 'Dr. Sharma',
        action: 'Prescribed medication for #P-00101',
        status: 'success',
      },
      {
        key: '5',
        time: '2025-11-19 11:42',
        user: 'Billing',
        action: 'Created invoice INV-2025-1120',
        status: 'warning',
      },
    ];
    setRecent(rows);
  }, []);

  const columns: ColumnsType<RecentActivity> = [
    { title: 'Time', dataIndex: 'time', key: 'time', width: 180 },
    { title: 'User', dataIndex: 'user', key: 'user', width: 140 },
    { title: 'Action', dataIndex: 'action', key: 'action' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => {
        const color = s === 'success' ? 'green' : s === 'warning' ? 'orange' : 'blue';
        return <Tag color={color}>{s}</Tag>;
      },
    },
  ];

  // Chart configs
  const lineConfig = {
    data: appointmentTrend,
    xField: 'date',
    yField: 'value',
    smooth: true,
    height: 240,
    point: { size: 4, shape: 'circle' },
    xAxis: { tickCount: 6 },
    tooltip: { showMarkers: false },
  };

  const columnConfig = {
    data: admissionsByHour,
    xField: 'hour',
    yField: 'count',
    height: 240,
    label: { position: 'middle' as const },
    tooltip: {},
    columnStyle: { borderRadius: 4 },
  };

  const pieConfig = {
    appendPadding: 10,
    data: patientDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    height: 240,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <div style={{ padding: 8 }}>
      {/* header block with uploaded image */}
      <Row gutter={12} style={{ marginBottom: 12, alignItems: 'center' }}>
        <Col flex="280px">
          <Card size="small" bodyStyle={{ padding: 8 }}>
            {/* Uploaded file path used as image src (platform will transform local path into a served URL) */}
            <img
              src="/mnt/data/16c3ce9c-8556-44f1-bb3b-ffd76ea34e47.png"
              alt="H5-Care"
              style={{ width: '100%', height: 64, objectFit: 'cover', borderRadius: 6 }}
            />
          </Card>
        </Col>

        <Col flex="auto">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                H5-Care — Dashboard
              </Title>
              <div style={{ color: 'rgba(0,0,0,0.45)' }}>
                Overview of current patients, appointments and clinical activity
              </div>
            </Col>

            <Col>
              <Space>
                <RangePicker onChange={(r) => setRange(r)} />
                <Select
                  value={department}
                  onChange={(v) => setDepartment(v)}
                  style={{ width: 160 }}
                >
                  <Option value="all">All departments</Option>
                  <Option value="opd">OPD</Option>
                  <Option value="ipd">IPD</Option>
                  <Option value="lab">Lab</Option>
                  <Option value="pharmacy">Pharmacy</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* KPI cards */}
      <Row gutter={12}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Patients Today"
              value={stats.patientsToday}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={stats.patientsDelta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix={`${stats.patientsDelta >= 0 ? '+' : ''}${stats.patientsDelta}%`}
            />
            <div style={{ marginTop: 8, color: 'rgba(0,0,0,0.45)' }}>
              New today: {stats.newPatients}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Appointments Today"
              value={stats.appointmentsToday}
              precision={0}
              valueStyle={{ color: stats.apptDelta >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={stats.apptDelta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix={`${stats.apptDelta >= 0 ? '+' : ''}${stats.apptDelta}%`}
            />
            <div style={{ marginTop: 8, color: 'rgba(0,0,0,0.45)' }}>
              Pending lab results: {stats.pendingLabResults}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Active Doctors" value={24} />
            <div style={{ marginTop: 8, color: 'rgba(0,0,0,0.45)' }}>On duty: 8</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Open Invoices" value={37} />
            <div style={{ marginTop: 8, color: 'rgba(0,0,0,0.45)' }}>Due today: 5</div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* charts + table */}
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <Card title="Appointments Trend (last 12 days)">
            <Line {...lineConfig} />
          </Card>

          <Card title="Admissions by Hour" style={{ marginTop: 12 }}>
            <Column {...columnConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Patient Type Distribution">
            <Pie {...pieConfig} />
          </Card>

          <Card title="Recent Activity" style={{ marginTop: 12 }}>
            <Table columns={columns} dataSource={recent} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* quick analysis cards */}
      <Row gutter={12}>
        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Top Diagnoses (This Week)</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>Hypertension</strong> <span style={{ float: 'right' }}>120</span>
              </div>
              <div>
                <strong>Diabetes</strong> <span style={{ float: 'right' }}>96</span>
              </div>
              <div>
                <strong>Upper Respiratory</strong> <span style={{ float: 'right' }}>72</span>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Pharmacy — Top Prescriptions</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <span>Amoxicillin</span> <span style={{ float: 'right' }}>48</span>
              </div>
              <div>
                <span>Metformin</span> <span style={{ float: 'right' }}>42</span>
              </div>
              <div>
                <span>Atorvastatin</span> <span style={{ float: 'right' }}>30</span>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Operational</Title>
            <div>
              Bed occupancy: <strong>72%</strong>
            </div>
            <div style={{ marginTop: 8 }}>
              Avg. Turnaround (lab): <strong>4.2 hrs</strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
