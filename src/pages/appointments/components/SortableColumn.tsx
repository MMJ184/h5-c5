import { PlusOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge, Button, Empty, Typography } from 'antd';
import { useMemo } from 'react';

import AppointmentCard from './AppointmentCard';

import type { Appointment } from '../hooks/useAppointments';

interface Props {
	column: { id: Appointment['status']; title: string };
	items: Appointment[];
	onEdit?: (a: Appointment) => void;
	onDelete?: (id: string) => void;
	onAddNew?: (status: Appointment['status']) => void;
}

const statusColors: Record<Appointment['status'], string> = {
	pending: '#faad14',
	confirmed: '#1890ff',
	completed: '#52c41a',
	cancelled: '#ff4d4f',
};

const statusBackgrounds: Record<Appointment['status'], string> = {
	pending: '#fffbe6',
	confirmed: '#e6f7ff',
	completed: '#f6ffed',
	cancelled: '#fff1f0',
};

export default function SortableColumn({ column, items, onEdit, onDelete, onAddNew }: Props) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id,
		data: { type: 'column', accepts: ['card'] },
	});

	const itemIds = useMemo(() => items.map((i) => i.id), [items]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: 320,
				minWidth: 320,
				maxWidth: 320,
				height: 'calc(100vh - 280px)',
				background: '#f5f5f5',
				borderRadius: 8,
				padding: 12,
				marginRight: 16,
				transition: 'all 0.3s ease',
				boxShadow: isOver 
					? '0 4px 12px rgba(0,0,0,0.15)' 
					: '0 1px 3px rgba(0,0,0,0.05)',
				border: isOver ? `2px solid ${statusColors[column.id]}` : '2px solid transparent',
			}}
		>
			{/* Column Header */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: 12,
					padding: '8px 12px',
					background: statusBackgrounds[column.id],
					borderRadius: 6,
					borderLeft: `4px solid ${statusColors[column.id]}`,
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<Typography.Text strong style={{ fontSize: 14, color: '#262626' }}>
						{column.title}
					</Typography.Text>
					<Badge 
						count={items.length} 
						style={{ 
							backgroundColor: statusColors[column.id],
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
						}} 
					/>
				</div>
				{onAddNew && (
					<Button
						type="text"
						size="small"
						icon={<PlusOutlined />}
						onClick={() => onAddNew(column.id)}
						style={{ 
							color: statusColors[column.id],
							fontSize: 16,
						}}
					/>
				)}
			</div>

			{/* Scrollable Card Area */}
			<div
				ref={setNodeRef}
				style={{
					flex: 1,
					overflowY: 'auto',
					overflowX: 'hidden',
					padding: '4px 4px 0 4px',
					minHeight: 200,
					background: isOver ? 'rgba(24, 144, 255, 0.05)' : 'transparent',
					borderRadius: 4,
					transition: 'background 0.2s ease',
				}}
			>
				{items.length === 0 ? (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
							minHeight: 200,
						}}
					>
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<span style={{ color: '#8c8c8c', fontSize: 12 }}>
									No appointments
								</span>
							}
						/>
					</div>
				) : (
					<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
						{items.map((item) => (
							<AppointmentCard 
								key={item.id} 
								item={item} 
								onEdit={onEdit} 
								onDelete={onDelete} 
							/>
						))}
					</SortableContext>
				)}
			</div>

			{/* Footer Stats */}
			<div
				style={{
					marginTop: 8,
					padding: '8px 12px',
					background: '#ffffff',
					borderRadius: 6,
					fontSize: 11,
					color: '#8c8c8c',
					textAlign: 'center',
					border: '1px solid #f0f0f0',
				}}
			>
				{items.length} {items.length === 1 ? 'appointment' : 'appointments'}
			</div>
		</div>
	);
}
