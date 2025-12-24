import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Col, Card, Empty } from 'antd';

import AppointmentCard from './AppointmentCard';

import type { Appointment } from '../hooks/useAppointments';

interface Props {
	column: { id: Appointment['status']; title: string };
	items: Appointment[];
	onEdit?: (a: Appointment) => void;
	onDelete?: (id: string) => void;
}

export default function SortableColumn({ column, items, onEdit, onDelete }: Props) {
	const { setNodeRef, transform, transition, attributes, listeners } = useSortable({
		id: column.id,
		data: { type: 'column' },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		minWidth: 260,
	};

	return (
		<Col ref={setNodeRef} style={style} {...attributes}>
			<Card
				size="small"
				title={
					<span {...listeners} style={{ cursor: 'grab' }}>
						{column.title} ({items.length})
					</span>
				}
			>
				{items.length === 0 ? (
					<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
				) : (
					<SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
						{items.map((item) => (
							<AppointmentCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
						))}
					</SortableContext>
				)}
			</Card>
		</Col>
	);
}
