import {
	AppstoreOutlined,
	CheckOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import {
	Layout,
	Button,
	Drawer,
	List,
	Card,
	Typography,
	Space,
	theme,
	Tabs,
	Modal,
	Input,
	Tag,
	Tooltip,
	Divider,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import GridLayout, { WidthProvider, type Layout as RGLLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import './index.css';
import { getWidgetComponentByType, getWidgetDefinition, widgetDefinitions } from '../../widgets/WidgetRegistry';

import type { WidgetType, WidgetDefinition } from '../../widgets/types';

const { Content } = Layout;
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
				<Space size={6}>
					<AppstoreOutlined />
					<span>{title}</span>
				</Space>
			}
			extra={
				isEditing ? (
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
				) : null
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
	const [isEditing, setIsEditing] = useState(false);

	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
	const [saveName, setSaveName] = useState('');

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

	const handleAddWidget = (definition: WidgetDefinition) => {
		const id = generateId();
		const nextY = layout.length > 0 ? Math.max(...layout.map((l) => l.y + l.h)) : 0;

		const newLayout: RGLLayout = {
			i: id,
			x: 0,
			y: nextY,
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
		<Layout style={{ height: '100vh' }}>
			<Content style={{ padding: 24 }}>
				<Card style={{ marginBottom: 16 }}>
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Title level={4} style={{ margin: 0 }}>
							Dashboard Builder
						</Title>

						<Space>
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
									<Button icon={<SaveOutlined />} onClick={() => setIsSaveModalOpen(true)}>
										Save
									</Button>

									<Button icon={<PlusOutlined />} type="primary" onClick={() => setDrawerOpen(true)}>
										Add Widget
									</Button>
								</>
							)}
						</Space>
					</Space>

					{dashboards.length > 0 && (
						<>
							<Divider />
							<Tabs
								type="card"
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
						</>
					)}
				</Card>

				<Card>
					<div ref={layoutRef} style={{ minHeight: 500 }}>
						<ReactGridLayout
							layout={layout}
							cols={12}
							rowHeight={30}
							margin={[8, 8]}
							isDraggable={isEditing}
							isResizable={isEditing}
							onLayoutChange={(l: any) => setLayout([...l])}
							draggableCancel=".widget-delete-btn"
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
			</Content>

			<Drawer title="Widget Library" open={drawerOpen} width={360} onClose={() => setDrawerOpen(false)}>
				<List
					dataSource={widgetDefinitions}
					renderItem={(item) => (
						<List.Item
							actions={[
								<Button type="link" icon={<PlusOutlined />} onClick={() => handleAddWidget(item)}>
									Add
								</Button>,
							]}
						>
							<List.Item.Meta title={item.title} description={item.description} />
						</List.Item>
					)}
				/>
			</Drawer>

			<Modal
				title="Save dashboard"
				open={isSaveModalOpen}
				onCancel={() => setIsSaveModalOpen(false)}
				onOk={handleSaveDashboard}
				okButtonProps={{ disabled: !saveName.trim() }}
			>
				<Input placeholder="Dashboard name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
			</Modal>
		</Layout>
	);
};

export default DashboardBuilder;
