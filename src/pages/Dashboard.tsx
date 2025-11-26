// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

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
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { useToken } = theme;

type RecentActivity = {
  key: string;
  time: string;
  user: string;
  action: string;
  status?: string;
};

export default function Dashboard(): JSX.Element {
  // ant design tokens (responsive to dark / light)
  const { token } = useToken();

  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [department, setDepartment] = useState<string | 'all'>('all');

  const stats = useMemo(
    () => ({
      patientsToday: 124,
      newPatients: 12,
      appointmentsToday: 58,
      pendingLabResults: 9,
      patientsDelta: 6.4,
      apptDelta: -3.2,
    }),
    [],
  );

  const appointmentTrend = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        date: dayjs().subtract(11 - i, 'day').format('YYYY-MM-DD'),
        value: Math.round(30 + Math.random() * 40 - i * 0.5),
      })),
    [],
  );

  const admissionsByHour = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        hour: `${8 + i}:00`,
        count: Math.round(5 + Math.random() * 20),
      })),
    [],
  );

  const patientDistribution = useMemo(
    () => [
      { type: 'Outpatient', value: 520 },
      { type: 'Inpatient', value: 120 },
      { type: 'Emergency', value: 60 },
    ],
    [],
  );

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

  // ---------- Chart configs (safe / compatible) ----------
  const lineConfig = {
    data: appointmentTrend,
    xField: 'date',
    yField: 'value',
    smooth: true,
    height: 240,
    point: { size: 4, shape: 'circle' },
    xAxis: {
      tickCount: 6,
      label: { style: { fill: token.colorTextSecondary } }, // axis label color
      title: { style: { fill: token.colorText } },
    },
    yAxis: {
      label: { style: { fill: token.colorTextSecondary } },
      title: { style: { fill: token.colorText } },
    },
    tooltip: { showMarkers: false },
    legend: { itemName: { style: { fill: token.colorText } } },
    annotations: [],
    // apply theme-level text color fallback for labels
    theme: { style: { fontFamily: undefined } },
  };

  // robust helper to extract numbers from different datum shapes
  function extractValue(datum: any): number | null {
    if (!datum) return null;
    if (typeof datum.value === 'number') return datum.value;
    if (typeof datum.count === 'number') return datum.count;
    if (datum.data && typeof datum.data.value === 'number') return datum.data.value;
    if (datum._origin && typeof datum._origin.value === 'number') return datum._origin.value;
    if (typeof datum === 'number') return datum;
    return null;
  }

  // COLUMN chart (admissions by hour)
  const columnConfig = {
    data: admissionsByHour,
    xField: 'hour',
    yField: 'count',
    height: 240,
    label: {
      position: 'top',
      formatter: (datum: any) => {
        const v = extractValue(datum) ?? extractValue(datum?.data) ?? extractValue(datum?._origin);
        return v === null ? '' : String(v);
      },
      // ensure label text follows tokens (fixes black labels in dark mode)
      style: { fill: token.colorTextSecondary },
    },
    xAxis: { label: { style: { fill: token.colorTextSecondary } } },
    yAxis: { label: { style: { fill: token.colorTextSecondary } } },
    tooltip: {},
    interactions: [{ type: 'active-region' }],
    limitInPlot: true,
    legend: { itemName: { style: { fill: token.colorText } } },
  };

// PIE chart (patient distribution)
  const totalPatients = patientDistribution.reduce((s, d) => s + (d?.value ?? 0), 0);
  const pieConfig = {
    data: patientDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    height: 240,
    label: {
      formatter: (datum: any) => {
        const v = extractValue(datum) ?? extractValue(datum?.data) ?? extractValue(datum?._origin);
        if (v === null) return '';
        const percent = totalPatients ? Math.round((v / totalPatients) * 100) : 0;
        return `${datum?.type ?? datum?.data?.type ?? ''} ${percent}%`;
      },
      // ensure pie label color follows tokens
      style: { fill: token.colorText },
    },
    interactions: [{ type: 'element-active' }],
    legend: { text: { style: { fill: token.colorText } } },
  };
  // ---------- End chart configs ----------

  // token-aware inline styles
  const secondaryText = { color: token.colorTextSecondary };
  const mutedBg = { background: token.colorBgContainer };

  return (
    <div style={{ padding: 8 }}>
      {/* header block */}
      <Row gutter={12} style={{ marginBottom: 12, alignItems: 'center' }}>
        <Col flex="280px">
          <Card size="small" styles={{ body: { padding: 8 }, root: { background: token.colorBgElevated } }}>
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
              <Title level={4} style={{ margin: 0, color: token.colorText }}>
                H5-Care — Dashboard
              </Title>
              <div style={secondaryText}>
                Overview of current patients, appointments and clinical activity
              </div>
            </Col>

            <Col>
              <Space>
                <RangePicker
                  value={range ?? undefined}
                  onChange={(r) => setRange(r as [Dayjs | null, Dayjs | null] | null)}
                />
                <Select
                  value={department}
                  onChange={(v) => setDepartment(v as string | 'all')}
                  style={{ width: 160 }}
                  options={[
                    { label: 'All departments', value: 'all' },
                    { label: 'OPD', value: 'opd' },
                    { label: 'IPD', value: 'ipd' },
                    { label: 'Lab', value: 'lab' },
                    { label: 'Pharmacy', value: 'pharmacy' },
                  ]}
                />
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* KPI cards */}
      <Row gutter={12}>
        <Col xs={24} sm={12} md={6}>
          <Card styles={{ body: { padding: 12 } }}>
            <Statistic
              title="Patients Today"
              value={stats.patientsToday}
              precision={0}
              styles={{ content: { color: token.colorSuccess } }}
              prefix={stats.patientsDelta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix={`${stats.patientsDelta >= 0 ? '+' : ''}${stats.patientsDelta}%`}
            />
            <div style={{ marginTop: 8, ...secondaryText }}>
              New today: {stats.newPatients}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card styles={{ body: { padding: 12 } }}>
            <Statistic
              title="Appointments Today"
              value={stats.appointmentsToday}
              precision={0}
              styles={{ content: { color: stats.apptDelta >= 0 ? token.colorSuccess : token.colorError } }}
              prefix={stats.apptDelta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix={`${stats.apptDelta >= 0 ? '+' : ''}${stats.apptDelta}%`}
            />
            <div style={{ marginTop: 8, ...secondaryText }}>
              Pending lab results: {stats.pendingLabResults}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card styles={{ body: { padding: 12 } }}>
            <Statistic title="Active Doctors" value={24} styles={{ content: { color: token.colorText } }} />
            <div style={{ marginTop: 8, ...secondaryText }}>On duty: 8</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card styles={{ body: { padding: 12 } }}>
            <Statistic title="Open Invoices" value={37} styles={{ content: { color: token.colorText } }} />
            <div style={{ marginTop: 8, ...secondaryText }}>Due today: 5</div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* charts + table */}
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <Card title="Appointments Trend (last 12 days)" styles={{ body: { padding: 12 } }}>
            <Line {...lineConfig} />
          </Card>

          <Card title="Admissions by Hour" styles={{ body: { padding: 12 }, root: { marginTop: 12 } }}>
            <Column {...columnConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Patient Type Distribution" styles={{ body: { padding: 12 } }}>
            <Pie {...pieConfig} />
          </Card>

          <Card title="Recent Activity" styles={{ body: { padding: 12 }, root: { marginTop: 12 } }}>
            <Table
              columns={columns}
              dataSource={recent}
              pagination={false}
              size="small"
              style={{ background: token.colorBgContainer }}
              rowClassName={() => 'no-select'}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* quick analysis cards */}
      <Row gutter={12}>
        <Col xs={24} md={8}>
          <Card styles={{ body: { padding: 12 } }}>
            <Title level={5} style={{ color: token.colorText }}>
              Top Diagnoses (This Week)
            </Title>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <div style={secondaryText}>
                <strong style={{ color: token.colorText }}>Hypertension</strong>{' '}
                <span style={{ float: 'right', color: token.colorText }}>120</span>
              </div>
              <div style={secondaryText}>
                <strong style={{ color: token.colorText }}>Diabetes</strong>{' '}
                <span style={{ float: 'right', color: token.colorText }}>96</span>
              </div>
              <div style={secondaryText}>
                <strong style={{ color: token.colorText }}>Upper Respiratory</strong>{' '}
                <span style={{ float: 'right', color: token.colorText }}>72</span>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card styles={{ body: { padding: 12 } }}>
            <Title level={5} style={{ color: token.colorText }}>
              Pharmacy — Top Prescriptions
            </Title>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <div style={secondaryText}>
                <span style={{ color: token.colorText }}>Amoxicillin</span>{' '}
                <span style={{ float: 'right', color: token.colorText }}>48</span>
              </div>
              <div style={secondaryText}>
                <span style={{ color: token.colorText }}>Metformin</span>{' '}
                <span style={{ float: 'right', color: token.colorText }}>42</span>
              </div>
              <div style={secondaryText}>
                <span style={{ color: token.colorText }}>Atorvastatin</span>{' '}
                <span style={{ float: 'right', color: token.colorText }}>30</span>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card styles={{ body: { padding: 12 } }}>
            <Title level={5} style={{ color: token.colorText }}>
              Operational
            </Title>
            <div style={secondaryText}>
              Bed occupancy: <strong style={{ color: token.colorText }}>72%</strong>
            </div>
            <div style={{ marginTop: 8, ...secondaryText }}>
              Avg. Turnaround (lab): <strong style={{ color: token.colorText }}>4.2 hrs</strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
