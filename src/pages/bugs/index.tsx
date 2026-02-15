import { BugOutlined, PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import {
	Badge,
	Button,
	Card,
	Col,
	Drawer,
	Form,
	Input,
	Popconfirm,
	Row,
	Select,
	Space,
	Tag,
	Timeline,
	Typography,
	message,
	theme,
} from 'antd';

import { useAuth } from '../../auth/useAuth';
import { useCreateBug, useDeleteBug, useBugsQuery, useUpdateBug } from './bug.queries';

import type { Bug, BugHistoryItem, BugPriority, BugStatus } from '../../api/bug.api';

import 'react-quill/dist/quill.snow.css';

const { Title, Text } = Typography;

const STATUS_OPTIONS: { value: BugStatus; label: string; color: string }[] = [
	{ value: 'new', label: 'New', color: 'blue' },
	{ value: 'triage', label: 'Triage', color: 'gold' },
	{ value: 'in_progress', label: 'In Progress', color: 'cyan' },
	{ value: 'qa', label: 'QA', color: 'purple' },
	{ value: 'closed', label: 'Closed', color: 'green' },
];

const PRIORITY_OPTIONS: { value: BugPriority; label: string; color: string }[] = [
	{ value: 'low', label: 'Low', color: 'default' },
	{ value: 'medium', label: 'Medium', color: 'blue' },
	{ value: 'high', label: 'High', color: 'orange' },
	{ value: 'critical', label: 'Critical', color: 'red' },
];

export default function BugsPage() {
	const { token } = theme.useToken();
	const auth = useAuth();
	const currentUser = auth.user ?? { id: 'u_admin', name: 'Admin', email: 'admin@example.com' };

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editing, setEditing] = useState<Bug | null>(null);
	const [description, setDescription] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<BugStatus | 'all'>('all');
	const [scope, setScope] = useState<'all' | 'mine'>('all');

	const users = useMemo(
		() => [
			{ id: currentUser.id, name: currentUser.name },
			{ id: 'u_dev', name: 'Dev User' },
			{ id: 'u_qa', name: 'QA User' },
		],
		[currentUser.id, currentUser.name],
	);

	const query = useBugsQuery({
		search,
		status,
		scope,
		viewerId: currentUser.id,
	});

	const createMut = useCreateBug();
	const updateMut = useUpdateBug();
	const deleteMut = useDeleteBug();

	const data = query.data?.data ?? [];

	const openCreate = () => {
		setEditing(null);
		setDescription('');
		setDrawerOpen(true);
	};

	const openEdit = (bug: Bug) => {
		setEditing(bug);
		setDescription(bug.descriptionHtml);
		setDrawerOpen(true);
	};

	const handleSubmit = async (values: any) => {
		try {
			if (editing) {
				const history: BugHistoryItem[] = [...editing.history];
				if (editing.status !== values.status) {
					history.unshift({
						id: `h_${Date.now()}`,
						action: `Status changed to ${values.status}`,
						at: new Date().toISOString(),
						by: currentUser.name,
					});
				}
				await updateMut.mutateAsync({
					id: editing.id,
					payload: {
						title: values.title,
						descriptionHtml: description,
						status: values.status,
						priority: values.priority,
						assigneeId: values.assigneeId,
						assigneeName: users.find((u) => u.id === values.assigneeId)?.name,
						history,
					},
				});
				message.success('Bug updated');
			} else {
				await createMut.mutateAsync({
					title: values.title,
					descriptionHtml: description,
					status: values.status,
					priority: values.priority,
					assigneeId: values.assigneeId,
					assigneeName: users.find((u) => u.id === values.assigneeId)?.name,
					reporterId: currentUser.id,
					reporterName: currentUser.name,
				});
				message.success('Bug created');
			}

			setDrawerOpen(false);
			setEditing(null);
			setDescription('');
		} catch {
			message.error('Save failed');
		}
	};

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			width: 110,
		},
		{
			title: 'Title',
			dataIndex: 'title',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			width: 130,
			render: (value: BugStatus) => {
				const opt = STATUS_OPTIONS.find((s) => s.value === value);
				return <Tag color={opt?.color}>{opt?.label ?? value}</Tag>;
			},
		},
		{
			title: 'Priority',
			dataIndex: 'priority',
			width: 130,
			render: (value: BugPriority) => {
				const opt = PRIORITY_OPTIONS.find((s) => s.value === value);
				return <Tag color={opt?.color}>{opt?.label ?? value}</Tag>;
			},
		},
		{
			title: 'Assignee',
			dataIndex: 'assigneeName',
			width: 160,
			render: (value: string) => value || 'Unassigned',
		},
		{
			title: 'Updated',
			dataIndex: 'updatedAt',
			width: 180,
			render: (value: string) => (value ? new Date(value).toLocaleString() : ''),
		},
		{
			title: 'Actions',
			dataIndex: 'actions',
			width: 160,
			render: (_: any, record: Bug) => (
				<Space>
					<Button size="small" onClick={() => openEdit(record)}>
						Edit
					</Button>
					<Popconfirm title="Delete bug?" onConfirm={() => deleteMut.mutateAsync(record.id)}>
						<Button size="small" danger>
							Delete
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div className="bug-tracker">
			<Card style={{ marginBottom: 16 }}>
				<Row justify="space-between" align="middle">
					<Col>
						<Space>
							<BugOutlined />
							<Title level={4} style={{ margin: 0 }}>
								Bug Tracker
							</Title>
							<Badge count={data.length} showZero />
						</Space>
						<Text type="secondary">Track, assign, and manage bug status.</Text>
					</Col>
					<Col>
						<Space>
							<Select value={scope} onChange={setScope} style={{ width: 140 }}>
								<Select.Option value="all">All</Select.Option>
								<Select.Option value="mine">My bugs</Select.Option>
							</Select>
							<Select value={status} onChange={setStatus} style={{ width: 160 }}>
								<Select.Option value="all">All status</Select.Option>
								{STATUS_OPTIONS.map((s) => (
									<Select.Option key={s.value} value={s.value}>
										{s.label}
									</Select.Option>
								))}
							</Select>
							<Input.Search
								placeholder="Search by title or ID"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								style={{ width: 220 }}
							/>
							<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
								New bug
							</Button>
						</Space>
					</Col>
				</Row>
			</Card>

			<Card>
				{data.length === 0 ? (
					<Text type="secondary">No bugs found.</Text>
				) : (
					<>
						<Space direction="vertical" size="middle" style={{ width: '100%' }}>
							{data.map((bug) => (
								<Card
									key={bug.id}
									size="small"
									style={{ borderColor: token.colorBorderSecondary }}
								>
									<Row justify="space-between" align="middle">
										<Col>
											<Space direction="vertical" size={4}>
												<Space>
													<Text strong>{bug.title}</Text>
													<Tag color="default">{bug.id}</Tag>
												</Space>
												<Space>
													{STATUS_OPTIONS.map((s) =>
														s.value === bug.status ? (
															<Tag key={s.value} color={s.color}>
																{s.label}
															</Tag>
														) : null,
													)}
													{PRIORITY_OPTIONS.map((p) =>
														p.value === bug.priority ? (
															<Tag key={p.value} color={p.color}>
																{p.label}
															</Tag>
														) : null,
													)}
													<Text type="secondary">Assignee: {bug.assigneeName || 'Unassigned'}</Text>
												</Space>
											</Space>
										</Col>
										<Col>
											<Space>
												<Button size="small" onClick={() => openEdit(bug)}>
													Edit
												</Button>
												<Popconfirm title="Delete bug?" onConfirm={() => deleteMut.mutateAsync(bug.id)}>
													<Button size="small" danger>
														Delete
													</Button>
												</Popconfirm>
											</Space>
										</Col>
									</Row>

									<div style={{ marginTop: 12 }}>
										<Text type="secondary">Description</Text>
										<div
											style={{
												padding: 12,
												background: token.colorFillAlter,
												borderRadius: 8,
												marginTop: 6,
												border: `1px solid ${token.colorBorderSecondary}`,
											}}
											dangerouslySetInnerHTML={{ __html: bug.descriptionHtml || '<p>No description</p>' }}
										/>
									</div>

									<div style={{ marginTop: 12 }}>
										<Text type="secondary">Tracking</Text>
										<Timeline
											items={bug.history.map((h) => ({
												children: `${h.action} • ${h.by ?? 'System'} • ${new Date(h.at).toLocaleString()}`,
											}))}
										/>
									</div>
								</Card>
							))}
						</Space>
					</>
				)}
			</Card>

			<Drawer
				open={drawerOpen}
				width={720}
				onClose={() => setDrawerOpen(false)}
				title={editing ? `Edit ${editing.id}` : 'Create new bug'}
			>
				<Form
					layout="vertical"
					onFinish={handleSubmit}
					initialValues={{
						title: editing?.title ?? '',
						status: editing?.status ?? 'new',
						priority: editing?.priority ?? 'medium',
						assigneeId: editing?.assigneeId ?? currentUser.id,
					}}
				>
					<Form.Item name="title" label="Title" rules={[{ required: true }]}>
						<Input placeholder="Bug title" />
					</Form.Item>

					<Form.Item label="Description">
						<ReactQuill theme="snow" value={description} onChange={setDescription} />
					</Form.Item>

					<Row gutter={16}>
						<Col span={8}>
							<Form.Item name="status" label="Status" rules={[{ required: true }]}>
								<Select>
									{STATUS_OPTIONS.map((s) => (
										<Select.Option key={s.value} value={s.value}>
											{s.label}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
								<Select>
									{PRIORITY_OPTIONS.map((p) => (
										<Select.Option key={p.value} value={p.value}>
											{p.label}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name="assigneeId" label="Assignee">
								<Select>
									{users.map((u) => (
										<Select.Option key={u.id} value={u.id}>
											{u.name}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Space>
						<Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
						<Button type="primary" htmlType="submit" loading={createMut.isPending || updateMut.isPending}>
							Save
						</Button>
					</Space>
				</Form>
			</Drawer>

			<style>{`
				.bug-tracker .ql-toolbar.ql-snow {
					border-color: ${token.colorBorderSecondary};
					background: ${token.colorFillAlter};
				}
				.bug-tracker .ql-container.ql-snow {
					border-color: ${token.colorBorderSecondary};
					background: ${token.colorBgContainer};
					color: ${token.colorText};
				}
				.bug-tracker .ql-editor {
					min-height: 180px;
				}
			`}</style>
		</div>
	);
}
