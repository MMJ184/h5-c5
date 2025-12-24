import { EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Button, Space } from 'antd';

import type { Appointment } from '../hooks/useAppointments';

interface Props {
	item: Appointment;
	onEdit?: (a: Appointment) => void;
	onDelete?: (id: string) => void;
	isOverlay?: boolean;
}

export default function AppointmentCard({ item, onEdit, onDelete, isOverlay }: Props) {
	const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
		id: item.id,
		data: { type: 'card' },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		marginBottom: 8,
		cursor: 'grab',
		zIndex: isOverlay ? 10000 : 'auto',
		boxShadow: isOverlay ? '0 12px 32px rgba(0,0,0,0.25)' : undefined,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			<Card size="small">
				<Space direction="vertical" style={{ width: '100%' }}>
					<Space style={{ justifyContent: 'space-between', width: '100%' }}>
						<strong>{item.title}</strong>
						<DragOutlined {...listeners} />
					</Space>

					<div>{item.patientName}</div>

					{!isOverlay && (
						<Space>
							<Button size="small" icon={<EditOutlined />} onClick={() => onEdit?.(item)} />
							<Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete?.(item.id)} />
						</Space>
					)}
				</Space>
			</Card>
		</div>
	);
}
