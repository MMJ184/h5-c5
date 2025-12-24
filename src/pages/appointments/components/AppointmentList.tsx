import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Table, Button, Tag, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import type { Appointment } from '../hooks/useAppointments.ts';

interface Props {
	appointments: Appointment[];
	loading?: boolean;
	onEdit?: (a: Appointment) => void;
	onDelete?: (id: string) => void;
}

export default function AppointmentList({ appointments, loading, onEdit, onDelete }: Props) {
	const columns = useMemo(
		() => [
			{
				title: 'Title',
				dataIndex: 'title',
				key: 'title',
			},
			{
				title: 'Patient',
				dataIndex: 'patientName',
				key: 'patientName',
			},
			{
				title: 'Date',
				dataIndex: 'date',
				key: 'date',
				render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
			},
			{
				title: 'Time',
				dataIndex: 'time',
				key: 'time',
			},
			{
				title: 'Status',
				dataIndex: 'status',
				key: 'status',
				render: (s: Appointment['status']) => {
					const color = s === 'confirmed' ? 'green' : s === 'pending' ? 'orange' : s === 'completed' ? 'blue' : 'red';
					return <Tag color={color}>{s}</Tag>;
				},
			},
			{
				title: 'Actions',
				key: 'actions',
				render: (_: any, record: Appointment) => (
					<Space>
						<Tooltip title="Edit">
							<Button icon={<EditOutlined />} size="small" onClick={() => onEdit?.(record)} />
						</Tooltip>
						<Tooltip title="Delete">
							<Button danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete?.(record.id)} />
						</Tooltip>
					</Space>
				),
			},
		],
		[onEdit, onDelete],
	);

	return <Table rowKey="id" columns={columns} dataSource={appointments} loading={loading} />;
}
