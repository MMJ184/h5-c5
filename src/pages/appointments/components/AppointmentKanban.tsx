import { DndContext, type DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Row } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import AppointmentCard from './AppointmentCard';
import SortableColumn from './SortableColumn.tsx';

import type { Appointment } from '../hooks/useAppointments';

interface Column {
	id: Appointment['status'];
	title: string;
}

interface Props {
	appointments: Appointment[];
	loading?: boolean;
	onEdit?: (a: Appointment) => void;
	onDelete?: (id: string) => void;
	onChangeStatus?: (id: string, status: Appointment['status']) => Promise<void>;
}

export default function AppointmentKanban({ appointments, onEdit, onDelete, onChangeStatus }: Props) {
	/* ---------- COLUMN ORDER ---------- */
	const [columns, setColumns] = useState<Column[]>([
		{ id: 'pending', title: 'Pending' },
		{ id: 'confirmed', title: 'Confirmed' },
		{ id: 'completed', title: 'Completed' },
		{ id: 'cancelled', title: 'Cancelled' },
	]);

	/* ---------- LOCAL CARD STATE ---------- */
	const [items, setItems] = useState<Appointment[]>(appointments);
	const [activeItem, setActiveItem] = useState<Appointment | null>(null);

	useEffect(() => {
		setItems(appointments);
	}, [appointments]);

	/* ---------- GROUP BY STATUS ---------- */
	const grouped = useMemo(() => {
		const map: Record<string, Appointment[]> = {};
		columns.forEach((c) => (map[c.id] = []));
		items.forEach((i) => map[i.status].push(i));
		return map;
	}, [items, columns]);

	/* ---------- DRAG END ---------- */
	const handleDragEnd = async (event: DragEndEvent) => {
		setActiveItem(null);

		const { active, over } = event;
		if (!over) return;

		const activeId = String(active.id);
		const overId = String(over.id);

		/* 🟦 COLUMN DRAG */
		if (active.data.current?.type === 'column') {
			const oldIndex = columns.findIndex((c) => c.id === activeId);
			const newIndex = columns.findIndex((c) => c.id === overId);
			if (oldIndex !== newIndex) {
				setColumns(arrayMove(columns, oldIndex, newIndex));
			}
			return;
		}

		/* 🟩 CARD DRAG */
		const dragged = items.find((i) => i.id === activeId);
		if (!dragged) return;

		const isOverColumn = columns.some((c) => c.id === overId);
		const newStatus = isOverColumn ? (overId as Appointment['status']) : items.find((i) => i.id === overId)?.status;

		if (!newStatus || newStatus === dragged.status) return;

		const previous = [...items];

		/* optimistic */
		setItems((prev) => prev.map((i) => (i.id === activeId ? { ...i, status: newStatus } : i)));

		try {
			await onChangeStatus?.(activeId, newStatus);
		} catch {
			/* rollback */
			setItems(previous);
		}
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragStart={(e) => {
				const item = items.find((i) => i.id === e.active.id);
				if (item) setActiveItem(item);
			}}
			onDragEnd={handleDragEnd}
			onDragCancel={() => setActiveItem(null)}
		>
			<SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
				<Row gutter={16} wrap={false} style={{ overflowX: 'auto' }}>
					{columns.map((col) => (
						<SortableColumn key={col.id} column={col} items={grouped[col.id]} onEdit={onEdit} onDelete={onDelete} />
					))}
				</Row>
			</SortableContext>

			{/* 🔝 DRAG OVERLAY FIX */}
			<DragOverlay>
				{activeItem ? (
					<div style={{ width: 260 }}>
						<AppointmentCard item={activeItem} isOverlay />
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
