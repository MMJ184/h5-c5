import { CalendarOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Button, Card, Space, Tag, Tooltip, theme } from 'antd';
import dayjs from 'dayjs';
import type { CSSProperties } from 'react';

import type { Appointment } from '../hooks/useAppointments';

interface Props {
	item: Appointment;
	onEdit?: (a: Appointment) => void;
	onDelete?: (id: string) => void;
	isOverlay?: boolean;
}

const statusColors: Record<Appointment['status'], string> = {
	pending: '#faad14',
	confirmed: '#1890ff',
	completed: '#52c41a',
	cancelled: '#ff4d4f',
};

export default function AppointmentCard({ item, onEdit, onDelete, isOverlay }: Props) {
	const { token } = theme.useToken();
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: item.id,
		data: { type: 'card', item },
	});

	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		marginBottom: 12,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			<Card
				hoverable
				size="small"
				style={{
					borderRadius: 8,
					boxShadow: isOverlay 
						? token.boxShadowSecondary 
						: token.boxShadow,
					borderLeft: `4px solid ${statusColors[item.status]}`,
					cursor: isDragging ? 'grabbing' : 'pointer',
					background: token.colorBgContainer,
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				}}
				bodyStyle={{ padding: '12px' }}
				{...listeners}
			>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					{/* Title */}
					<div style={{ 
						fontWeight: 600, 
						fontSize: '14px', 
						color: token.colorText,
						lineHeight: '20px',
					}}>
						{item.title}
					</div>

					{/* Patient Info */}
					<Space size="small" style={{ color: token.colorTextSecondary, fontSize: '13px' }}>
						<UserOutlined style={{ fontSize: '12px' }} />
						<span>{item.patientName}</span>
					</Space>

					{/* Date & Time */}
					<Space size="small" wrap style={{ fontSize: '12px', color: token.colorTextSecondary }}>
						<Space size={4}>
							<CalendarOutlined />
							<span>{dayjs(item.date).format('MMM DD, YYYY')}</span>
						</Space>
						{item.time && (
							<Space size={4}>
								<ClockCircleOutlined />
								<span>{item.time}</span>
							</Space>
						)}
					</Space>

					{/* Duration Tag */}
					{item.durationMinutes && (
						<Tag color="blue" style={{ width: 'fit-content', fontSize: '11px' }}>
							{item.durationMinutes} min
						</Tag>
					)}

					{/* Notes Preview */}
					{item.notes && (
						<Tooltip title={item.notes}>
							<div style={{ 
								fontSize: '12px', 
								color: token.colorTextSecondary,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}>
								{item.notes}
							</div>
						</Tooltip>
					)}

					{/* Actions - Only show when not dragging */}
					{!isOverlay && (
						<div 
							style={{ 
								display: 'flex', 
								justifyContent: 'flex-end', 
								gap: 8,
								marginTop: 8,
								paddingTop: 8,
								borderTop: `1px solid ${token.colorBorderSecondary}`
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<Tooltip title="Edit">
								<Button 
									size="small" 
									type="text"
									icon={<EditOutlined />} 
									onClick={(e) => {
										e.stopPropagation();
										onEdit?.(item);
									}}
									style={{ color: '#1890ff' }}
								/>
							</Tooltip>
							<Tooltip title="Delete">
								<Button 
									size="small" 
									type="text"
									danger 
									icon={<DeleteOutlined />} 
									onClick={(e) => {
										e.stopPropagation();
										onDelete?.(item.id);
									}}
								/>
							</Tooltip>
						</div>
					)}
				</Space>
			</Card>
		</div>
	);
}
