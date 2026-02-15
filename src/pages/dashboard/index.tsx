import {
	AppstoreOutlined,
	CheckOutlined,
	DeleteOutlined,
	DragOutlined,
	EditOutlined,
	EllipsisOutlined,
	PlusOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import {
	Badge,
	Button,
	Drawer,
	Card,
	Typography,
	Space,
	theme,
	Select,
	Tabs,
	Modal,
	Input,
	Tag,
	Tooltip,
	Divider,
	Dropdown,
	Empty,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import GridLayout, { WidthProvider, type Layout as RGLLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import './index.css';
import { getWidgetComponentByType, getWidgetDefinition, widgetDefinitions } from '../../widgets/WidgetRegistry';
import { DashboardProvider, type DashboardTimeRangeKey, useDashboardContext } from './DashboardContext';

import type { WidgetType, WidgetDefinition } from '../../widgets/types';

const { Title } = Typography;

const ReactGridLayout = WidthProvider(GridLayout);

/* ---------- TYPES ---------- */

interface DashboardWidgetInstance {
	id: string;
	type: WidgetType;
}

interface DashboardData {
	id: string;
	name: string;
	widgets: DashboardWidgetInstance[];
	layout: RGLLayout[];
	createdAt: string;
}

const STORAGE_KEY = 'dashboard_builder_multi_v1';

/* ---------- WIDGET CARD ---------- */

interface WidgetCardProps {
	title: string;
	onRemove: () => void;
	children: React.ReactNode;
	isEditing: boolean;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ title, onRemove, children, isEditing }) => {
	const { timeRange } = useDashboardContext();
	return (
		<Card
			size="small"
			className={`widget-card ${isEditing ? 'widget-card--editing' : ''}`}
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				minHeight: 0,
			}}
			bodyStyle={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				minHeight: 0,
				padding: 12,
			}}
			title={
				<Space size={8} className="widget-drag-handle">
					<DragOutlined />
					<AppstoreOutlined />
					<span>{title}</span>
				</Space>
			}
			extra={
				<Space size={6}>
					<Tag className="widget-range-tag">{timeRange.label}</Tag>
					{isEditing ? (
						<Tooltip title="Remove widget">
							<Button
								type="text"
								size="small"
								icon={<DeleteOutlined />}
								className="widget-delete-btn"
								onMouseDown={(e) => e.stopPropagation()}
								onClick={(e) => {
									e.stopPropagation();
									onRemove();
								}}
							/>
						</Tooltip>
					) : null}
				</Space>
			}
		>
			<div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</div>
		</Card>
	);
};

/* ---------- MAIN COMPONENT ---------- */

const DashboardBuilder: React.FC = () => {
	const [widgets, setWidgets] = useState<DashboardWidgetInstance[]>([]);
	const [layout, setLayout] = useState<RGLLayout[]>([]);

	const [dashboards, setDashboards] = useState<DashboardData[]>([]);
	const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(true);

	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
	const [saveName, setSaveName] = useState('');
	const [isRenameOpen, setIsRenameOpen] = useState(false);
	const [renameValue, setRenameValue] = useState('');
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [createValue, setCreateValue] = useState('');
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState<string>('All');
	const [timeRange, setTimeRange] = useState<DashboardTimeRangeKey>('30d');
	const [isDragOver, setIsDragOver] = useState(false);

	theme.useToken();
	const layoutRef = useRef<HTMLDivElement | null>(null);

	const generateId = () => `w_${Math.random().toString(36).substring(2, 9)}`;

	/* ---------- LOAD FROM STORAGE ---------- */

	useEffect(() => {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;

		try {
			const parsed = JSON.parse(raw) as {
				dashboards?: DashboardData[];
				activeDashboardId?: string;
			};

			if (parsed.dashboards?.length) {
				setDashboards(parsed.dashboards);

				const activeId =
					parsed.activeDashboardId && parsed.dashboards.some((d) => d.id === parsed.activeDashboardId)
						? parsed.activeDashboardId
						: parsed.dashboards[0].id;

				setActiveDashboardId(activeId);

				const dash = parsed.dashboards.find((d) => d.id === activeId) ?? parsed.dashboards[0];

				setWidgets(dash.widgets ?? []);
				setLayout(dash.layout ?? []);
			}
		} catch (err) {
			console.error('Failed to load dashboards', err);
		}
	}, []);

	/* ---------- SAVE TO STORAGE ---------- */

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ dashboards, activeDashboardId }));
	}, [dashboards, activeDashboardId]);

	useEffect(() => {
		if (!activeDashboardId) return;
		setDashboards((p) =>
			p.map((d) => (d.id === activeDashboardId ? { ...d, widgets, layout } : d)),
		);
	}, [activeDashboardId, widgets, layout]);

	/* ---------- GRID BACKGROUND CALC ---------- */

	useEffect(() => {
		const updateColWidth = () => {
			if (!layoutRef.current) return;
			const width = layoutRef.current.offsetWidth;
			document.documentElement.style.setProperty('--col-width', `${width / 12}px`);
		};

		updateColWidth();
		window.addEventListener('resize', updateColWidth);
		return () => window.removeEventListener('resize', updateColWidth);
	}, []);

	/* ---------- HELPERS ---------- */

	const _activeDashboard = dashboards.find((d) => d.id === activeDashboardId) ?? null;

	/* ---------- ACTIONS ---------- */

	const handleAddWidget = (definition: WidgetDefinition, drop?: { x: number; y: number }) => {
		if (!activeDashboardId) {
			const id = `d_${Math.random().toString(36).substring(2, 9)}`;
			const newDash: DashboardData = {
				id,
				name: 'My Dashboard',
				widgets: [],
				layout: [],
				createdAt: new Date().toISOString(),
			};
			setDashboards((p) => [...p, newDash]);
			setActiveDashboardId(id);
			setWidgets([]);
			setLayout([]);
		}

		const id = generateId();
		const nextY = layout.length > 0 ? Math.max(...layout.map((l) => l.y + l.h)) : 0;

		const newLayout: RGLLayout = {
			i: id,
			x: drop?.x ?? 0,
			y: drop?.y ?? nextY,
			w: Math.max(definition.defaultW, definition.minW ?? 2),
			h: Math.max(definition.defaultH, definition.minH ?? 3),
			minW: definition.minW,
			minH: definition.minH,
		};

		setWidgets((p) => [...p, { id, type: definition.type }]);
		setLayout((p) => [...p, newLayout]);
	};

	const handleRemoveWidget = (id: string) => {
		setWidgets((p) => p.filter((w) => w.id !== id));
		setLayout((p) => p.filter((l) => l.i !== id));
	};

	const handleCreateDashboard = () => {
		const name = createValue.trim();
		if (!name) return;
		const id = `d_${Math.random().toString(36).substring(2, 9)}`;
		const newDash: DashboardData = {
			id,
			name,
			widgets: [],
			layout: [],
			createdAt: new Date().toISOString(),
		};
		setDashboards((p) => [...p, newDash]);
		setActiveDashboardId(id);
		setWidgets([]);
		setLayout([]);
		setCreateValue('');
		setIsCreateOpen(false);
	};

	const handleRenameDashboard = () => {
		if (!activeDashboardId) return;
		const name = renameValue.trim();
		if (!name) return;
		setDashboards((p) => p.map((d) => (d.id === activeDashboardId ? { ...d, name } : d)));
		setIsRenameOpen(false);
	};

	const handleDeleteDashboard = () => {
		if (!activeDashboardId) return;
		const remaining = dashboards.filter((d) => d.id !== activeDashboardId);
		setDashboards(remaining);
		const next = remaining[0]?.id ?? null;
		setActiveDashboardId(next);
		setWidgets(next ? remaining.find((d) => d.id === next)?.widgets ?? [] : []);
		setLayout(next ? remaining.find((d) => d.id === next)?.layout ?? [] : []);
	};

	const handleCloneDashboard = () => {
		const base = dashboards.find((d) => d.id === activeDashboardId);
		if (!base) return;
		const idMap = new Map<string, string>();
		base.widgets.forEach((w) => {
			idMap.set(w.id, `w_${Math.random().toString(36).substring(2, 9)}`);
		});
		const id = `d_${Math.random().toString(36).substring(2, 9)}`;
		const clone: DashboardData = {
			...base,
			id,
			name: `${base.name} (Copy)`,
			createdAt: new Date().toISOString(),
			layout: base.layout.map((l) => ({ ...l, i: idMap.get(l.i) ?? l.i })),
			widgets: base.widgets.map((w) => ({ ...w, id: idMap.get(w.id) ?? w.id })),
		};
		setDashboards((p) => [...p, clone]);
		setActiveDashboardId(id);
		setWidgets(clone.widgets);
		setLayout(clone.layout);
	};

	const categoryOptions = useMemo(() => {
		const unique = Array.from(new Set(widgetDefinitions.map((w) => w.category))).sort();
		return ['All', ...unique];
	}, []);

	const timeRangeOptions = useMemo(
		() => [
			{ value: '7d', label: 'Last 7 days' },
			{ value: '30d', label: 'Last 30 days' },
			{ value: '90d', label: 'Last 90 days' },
			{ value: 'ytd', label: 'Year to date' },
		],
		[],
	);

	const timeRangeLabel = timeRangeOptions.find((t) => t.value === timeRange)?.label ?? 'Last 30 days';

	const filteredWidgets = useMemo(() => {
		const q = search.trim().toLowerCase();
		return widgetDefinitions.filter((w) => {
			const inCategory = category === 'All' || w.category === category;
			const inSearch =
				!q ||
				w.title.toLowerCase().includes(q) ||
				w.description.toLowerCase().includes(q) ||
				w.category.toLowerCase().includes(q);
			return inCategory && inSearch;
		});
	}, [search, category]);

	const handleSaveDashboard = () => {
		const name = saveName.trim();
		if (!name) return;

		const existing = dashboards.find((d) => d.name === name);

		if (existing) {
			setDashboards((p) => p.map((d) => (d.id === existing.id ? { ...d, widgets, layout } : d)));
			setActiveDashboardId(existing.id);
		} else {
			const id = generateId();
			setDashboards((p) => [
				...p,
				{
					id,
					name,
					widgets,
					layout,
					createdAt: new Date().toISOString(),
				},
			]);
			setActiveDashboardId(id);
		}

		setIsSaveModalOpen(false);
	};

	/* ---------- RENDER ---------- */

		return (
		<DashboardProvider value={{ timeRange: { key: timeRange, label: timeRangeLabel } }}>
		<>
			<Card style={{ marginBottom: 16 }}>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Space>
							<Title level={4} style={{ margin: 0 }}>
								Dashboards
							</Title>
							<Badge count={widgets.length} showZero />
						</Space>

						<Space>
							<Select
								value={timeRange}
								options={timeRangeOptions}
								onChange={(value) => setTimeRange(value as DashboardTimeRangeKey)}
							/>
							<Tag color={isEditing ? 'gold' : 'default'}>{isEditing ? 'Edit mode' : 'View mode'}</Tag>

							<Button
								icon={isEditing ? <CheckOutlined /> : <EditOutlined />}
								type={isEditing ? 'primary' : 'default'}
								onClick={() => setIsEditing((p) => !p)}
							>
								{isEditing ? 'Done' : 'Edit'}
							</Button>

							{isEditing && (
								<>
									<Button icon={<PlusOutlined />} type="primary" onClick={() => setDrawerOpen(true)}>
										Add widget
									</Button>

									<Button icon={<PlusOutlined />} onClick={() => setIsCreateOpen(true)}>
										New dashboard
									</Button>

									<Dropdown
										menu={{
											items: [
												{
													key: 'rename',
													label: 'Rename',
													onClick: () => {
														setRenameValue(_activeDashboard?.name ?? '');
														setIsRenameOpen(true);
													},
												},
												{ key: 'clone', label: 'Clone', onClick: handleCloneDashboard },
												{ key: 'save', label: 'Save as', onClick: () => setIsSaveModalOpen(true) },
												{ type: 'divider' },
												{
													key: 'delete',
													label: 'Delete',
													danger: true,
													onClick: handleDeleteDashboard,
												},
											],
										}}
										trigger={['click']}
									>
										<Button icon={<EllipsisOutlined />} />
									</Dropdown>
								</>
							)}
						</Space>
					</Space>

					{dashboards.length > 0 ? (
						<Tabs
							activeKey={activeDashboardId ?? undefined}
							onChange={(key) => {
								const d = dashboards.find((x) => x.id === key);
								if (!d) return;
								setActiveDashboardId(key);
								setWidgets(d.widgets);
								setLayout(d.layout);
							}}
							items={dashboards.map((d) => ({
								key: d.id,
								label: d.name,
							}))}
						/>
					) : (
						<Empty description="No dashboards yet. Create one to get started." />
					)}
				</Space>
			</Card>

			<Card>
				<div
					ref={layoutRef}
					style={{ minHeight: 500 }}
					onDragOver={(e) => {
						e.preventDefault();
						if (!isDragOver) setIsDragOver(true);
					}}
					onDragLeave={() => setIsDragOver(false)}
					onDrop={() => setIsDragOver(false)}
					className={isDragOver ? 'dashboard-drop-active' : undefined}
				>
					<ReactGridLayout
						className={`dashboard-grid-layout ${isEditing ? 'editing' : ''}`}
						layout={layout}
						cols={12}
						rowHeight={30}
						margin={[8, 8]}
						isDraggable={isEditing}
						isResizable={isEditing}
						isDroppable={isEditing}
						droppingItem={{ i: '__dropping', w: 4, h: 4 }}
						onLayoutChange={(l: any) => setLayout([...l])}
						onDrop={(_layout: unknown, item: { x: number; y: number }, e: DragEvent | undefined) => {
							const type =
								e?.dataTransfer?.getData('widgetType') || e?.dataTransfer?.getData('text/plain');
							if (!type) return;
							const def = widgetDefinitions.find((w) => w.type === type);
							if (!def) return;
							handleAddWidget(def, { x: item.x, y: item.y });
						}}
						draggableCancel=".widget-delete-btn"
						draggableHandle=".widget-drag-handle"
					>
						{widgets.map((w) => {
							const Comp = getWidgetComponentByType(w.type);
							const def = getWidgetDefinition(w.type);
							if (!Comp) return null;

							return (
								<div key={w.id}>
									<WidgetCard
										title={def?.title ?? w.type}
										isEditing={isEditing}
										onRemove={() => handleRemoveWidget(w.id)}
									>
										<Comp />
									</WidgetCard>
								</div>
							);
						})}
					</ReactGridLayout>
				</div>
			</Card>

			<Drawer title="Widget Library" open={drawerOpen} width={420} onClose={() => setDrawerOpen(false)}>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Input.Search placeholder="Search widgets" value={search} onChange={(e) => setSearch(e.target.value)} />
					<Select
						value={category}
						onChange={setCategory}
						options={categoryOptions.map((c) => ({ value: c, label: c }))}
					/>
					<div className="widget-catalog">
						{filteredWidgets.length === 0 ? (
							<Empty description="No widgets found" />
						) : (
							filteredWidgets.map((item) => (
								<div
									key={item.type}
									className="widget-catalog-card"
									draggable
									onDragStart={(e) => {
										e.dataTransfer.setData('widgetType', item.type);
										e.dataTransfer.setData('text/plain', item.type);
										e.dataTransfer.effectAllowed = 'copy';
									}}
								>
									<div className="widget-catalog-preview">
										<div className="widget-catalog-preview-bar" />
										<div className="widget-catalog-preview-grid" />
									</div>
									<div className="widget-catalog-body">
										<div className="widget-catalog-title">{item.title}</div>
										<div className="widget-catalog-meta">{item.category}</div>
										<div className="widget-catalog-desc">{item.description}</div>
										<div className="widget-catalog-actions">
											<Button size="small" type="primary" onClick={() => handleAddWidget(item)}>
												Add
											</Button>
											<Button size="small" type="text">
												Preview
											</Button>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</Space>
			</Drawer>

			<Modal
				title="Save dashboard as"
				open={isSaveModalOpen}
				onCancel={() => setIsSaveModalOpen(false)}
				onOk={handleSaveDashboard}
				okButtonProps={{ disabled: !saveName.trim() }}
			>
				<Input placeholder="Dashboard name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
			</Modal>

			<Modal
				title="New dashboard"
				open={isCreateOpen}
				onCancel={() => setIsCreateOpen(false)}
				onOk={handleCreateDashboard}
				okButtonProps={{ disabled: !createValue.trim() }}
			>
				<Input placeholder="Dashboard name" value={createValue} onChange={(e) => setCreateValue(e.target.value)} />
			</Modal>

			<Modal
				title="Rename dashboard"
				open={isRenameOpen}
				onCancel={() => setIsRenameOpen(false)}
				onOk={handleRenameDashboard}
				okButtonProps={{ disabled: !renameValue.trim() }}
			>
				<Input placeholder="Dashboard name" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
			</Modal>
		</>
		</DashboardProvider>
	);
};

export default DashboardBuilder;
