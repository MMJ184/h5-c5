import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { message, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import AppointmentCard from './AppointmentCard';
import SortableColumn from './SortableColumn';

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
	onAddNew?: (status: Appointment['status']) => void;
}

export default function AppointmentKanban({ 
	appointments, 
	loading, 
	onEdit, 
	onDelete, 
	onChangeStatus,
	onAddNew 
}: Props) {
	/* ---------- COLUMN CONFIGURATION ---------- */
	const [columns, setColumns] = useState<Column[]>([
		{ id: 'pending', title: 'Pending' },
		{ id: 'confirmed', title: 'Confirmed' },
		{ id: 'completed', title: 'Completed' },
		{ id: 'cancelled', title: 'Cancelled' },
	]);

	const [activeItem, setActiveItem] = useState<Appointment | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	/* ---------- SENSORS ---------- */
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // 8px movement required to start drag
			},
		}),
	);

	/* ---------- GROUP APPOINTMENTS BY STATUS ---------- */
	const grouped = useMemo(() => {
		const result: Record<Appointment['status'], Appointment[]> = {
			pending: [],
			confirmed: [],
			completed: [],
			cancelled: [],
		};
		appointments.forEach((appt) => {
			if (result[appt.status]) {
				result[appt.status].push(appt);
			}
		});
		return result;
	}, [appointments]);

	/* ---------- DRAG HANDLERS ---------- */
	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const item = appointments.find((a) => a.id === active.id);
		if (item) {
			setActiveItem(item);
			setIsDragging(true);
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveItem(null);
		setIsDragging(false);

		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// Check if dropped on a column
		const targetColumn = columns.find((col) => col.id === overId);
		
		if (targetColumn) {
			const item = appointments.find((a) => a.id === activeId);
			if (item && item.status !== targetColumn.id) {
				try {
					await onChangeStatus?.(activeId, targetColumn.id);
					message.success(`Appointment moved to ${targetColumn.title}`);
				} catch (error) {
					message.error('Failed to update appointment status');
					console.error(error);
				}
			}
		} else {
			// Dropped on another card - find which column it belongs to
			const overItem = appointments.find((a) => a.id === overId);
			const activeItem = appointments.find((a) => a.id === activeId);
			
			if (overItem && activeItem && activeItem.status !== overItem.status) {
				try {
					await onChangeStatus?.(activeId, overItem.status);
					message.success(`Appointment moved to ${overItem.status}`);
				} catch (error) {
					message.error('Failed to update appointment status');
					console.error(error);
				}
			}
		}
	};

	const handleDragCancel = () => {
		setActiveItem(null);
		setIsDragging(false);
	};

	/* ---------- COLUMN REORDERING ---------- */
	const handleColumnDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		setColumns((cols) => {
			const oldIndex = cols.findIndex((c) => c.id === active.id);
			const newIndex = cols.findIndex((c) => c.id === over.id);
			return arrayMove(cols, oldIndex, newIndex);
		});
	};

	if (loading) {
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				height: 400 
			}}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<div
				style={{
					display: 'flex',
					gap: 0,
					overflowX: 'auto',
					overflowY: 'hidden',
					padding: '16px 8px',
					background: '#fafafa',
					borderRadius: 8,
					minHeight: 'calc(100vh - 280px)',
				}}
			>
				<SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
					{columns.map((col) => (
						<SortableColumn
							key={col.id}
							column={col}
							items={grouped[col.id]}
							onEdit={onEdit}
							onDelete={onDelete}
							onAddNew={onAddNew}
						/>
					))}
				</SortableContext>
			</div>

			{/* Drag Overlay */}
			<DragOverlay>
				{activeItem ? (
					<div style={{ width: 320, opacity: 0.9 }}>
						<AppointmentCard item={activeItem} isOverlay />
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
