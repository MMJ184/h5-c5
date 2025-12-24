import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	FilterOutlined,
	PlusOutlined,
	SearchOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import {
	Badge,
	Button,
	Card,
	Checkbox,
	Col,
	DatePicker,
	Divider,
	Drawer,
	Dropdown,
	Input,
	Menu,
	Popconfirm,
	Row,
	Select,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
	message,
	Skeleton,
} from 'antd';
import dayjs from 'dayjs';
import React, { JSX, useEffect, useMemo, useState } from 'react';

import {
	usePatientsQuery,
	useCreatePatient,
	useUpdatePatient,
	useDeletePatient,
	useBulkDeletePatients,
} from './patient.queries';
import PatientForm, { type PatientFormValues } from './PatientForm';

import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const UPLOADED_ASSET = '/vite.svg';
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface Patient {
	id: string;
	name: string;
	gender: string;
	age: number;
	phone: string;
	lastVisit?: string;
	status: 'active' | 'inactive' | 'discharged';
	doctor?: string;
	notes?: string;
	avatarUrl?: string;
}

export default function PatientsPage(): JSX.Element {
	// filters & table state
	const [search, setSearch] = useState<string>('');
	const [debouncedSearch, setDebouncedSearch] = useState<string>('');
	const [gender, setGender] = useState<string>('all');
	const [dateRange, setDateRange] = useState<any>(null);

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
	});

	const [sorter, setSorter] = useState<{
		field?: string;
		order?: 'ascend' | 'descend';
	} | null>(null);

	// UI
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [drawerPatient, setDrawerPatient] = useState<Patient | null>(null);

	// Form modal state
	const [formVisible, setFormVisible] = useState(false);
	const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
	const [formInitial, setFormInitial] = useState<Partial<PatientFormValues> | undefined>(undefined);
	const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

	// column visibility persisted
	const LOCAL_COLS_KEY = 'patients_visible_columns_v1';
	const [hiddenCols, setHiddenCols] = useState<string[]>(() => {
		try {
			return (JSON.parse(localStorage.getItem(LOCAL_COLS_KEY) || '[]') as string[]) || [];
		} catch {
			return [];
		}
	});

	// debounce search -> query
	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedSearch(search);
			// whenever search changes, go back to page 1
			setPagination((p) => ({ ...p, current: 1 }));
		}, 300);
		return () => clearTimeout(t);
	}, [search]);

	// when gender/date changes -> go back to page 1
	useEffect(() => {
		setPagination((p) => ({ ...p, current: 1 }));
	}, [gender, dateRange]);

	// build query params
	const patientsParams = useMemo(() => {
		const params: any = {
			page: pagination.current,
			pageSize: pagination.pageSize,
		};

		if (debouncedSearch?.trim()) params.search = debouncedSearch.trim();
		if (gender && gender !== 'all') params.gender = gender;

		if (dateRange && dateRange.length === 2) {
			params.startDate = (dateRange[0] as dayjs.Dayjs).format('YYYY-MM-DD');
			params.endDate = (dateRange[1] as dayjs.Dayjs).format('YYYY-MM-DD');
		}

		if (sorter?.field) {
			params.sortBy = sorter.field;
			params.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
		}

		return params;
	}, [pagination.current, pagination.pageSize, debouncedSearch, gender, dateRange, sorter]);

	// queries + mutations
	const patientsQuery = usePatientsQuery(patientsParams);

	const createMut = useCreatePatient();
	const updateMut = useUpdatePatient();
	const deleteMut = useDeletePatient();
	const bulkDeleteMut = useBulkDeletePatients();

	const isInitialLoading = (patientsQuery as any).isPending ?? (patientsQuery as any).isLoading ?? false;
	const loading = Boolean(isInitialLoading || patientsQuery.isFetching);

	const data: Patient[] = (patientsQuery.data?.data ?? []) as Patient[];
	const total: number = patientsQuery.data?.total ?? 0;

	const confirmLoading = createMut.isPending || updateMut.isPending;

	// show fetch error once
	useEffect(() => {
		if (patientsQuery.isError) {
			message.error('Failed to load patients');
		}
		 
	}, [patientsQuery.isError]);

	// helper renderers that show skeletons while loading
	const renderSkeletonText = (width = '60%') =>
		loading ? <Skeleton active paragraph={false} title={{ width }} /> : null;

	const renderSkeletonSmall = (width = 60) =>
		loading ? <Skeleton.Input style={{ width }} active size="small" /> : null;

	const renderSkeletonAvatar = () => (loading ? <Skeleton.Avatar active size="large" /> : null);

	// table columns
	const allColumns = useMemo<ColumnsType<Patient>>(() => {
		return [
			{
				title: 'Sr',
				dataIndex: 'sr',
				width: 70,
				fixed: 'left',
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				render: (_: any, __: any, index: number) =>
					loading ? renderSkeletonSmall(40) : (pagination.current - 1) * pagination.pageSize + index + 1,
			},
			{
				title: 'Avatar',
				dataIndex: 'avatarUrl',
				width: 80,
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				render: (url: string | undefined, record) =>
					loading ? (
						<div
							style={{
								width: 40,
								height: 40,
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{renderSkeletonAvatar()}
						</div>
					) : (
						<img
							src={url || UPLOADED_ASSET}
							alt={record.name}
							style={{
								width: 40,
								height: 40,
								borderRadius: 6,
								objectFit: 'cover',
							}}
						/>
					),
			},
			{
				title: 'Patient ID',
				dataIndex: 'id',
				sorter: true,
				width: 140,
				ellipsis: true,
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({
					style: {
						whiteSpace: 'nowrap',
						textOverflow: 'ellipsis',
						overflow: 'hidden',
					},
				}),
				responsive: ['xs', 'sm', 'md', 'lg'],
				render: (val: string) => (loading ? renderSkeletonText('80%') : <span>{val}</span>),
			},
			{
				title: 'Name',
				dataIndex: 'name',
				sorter: true,
				width: 220,
				ellipsis: { showTitle: true },
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({
					style: {
						whiteSpace: 'nowrap',
						textOverflow: 'ellipsis',
						overflow: 'hidden',
					},
				}),
				responsive: ['xs', 'sm', 'md', 'lg'],
				render: (val: string) => (loading ? renderSkeletonText('70%') : <span>{val}</span>),
			},
			{
				title: 'Gender',
				dataIndex: 'gender',
				width: 100,
				filters: [
					{ text: 'Male', value: 'Male' },
					{ text: 'Female', value: 'Female' },
				],
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				responsive: ['sm', 'md', 'lg'],
				render: (val: string) => (loading ? renderSkeletonSmall(50) : <span>{val}</span>),
			},
			{
				title: 'Age',
				dataIndex: 'age',
				sorter: true,
				width: 90,
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				responsive: ['sm', 'md', 'lg'],
				render: (val: number) => (loading ? renderSkeletonSmall(40) : <span>{val}</span>),
			},
			{
				title: 'Phone',
				dataIndex: 'phone',
				width: 140,
				ellipsis: true,
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({
					style: {
						whiteSpace: 'nowrap',
						textOverflow: 'ellipsis',
						overflow: 'hidden',
					},
				}),
				responsive: ['md', 'lg'],
				render: (val: string) => (loading ? renderSkeletonText('60%') : <span>{val}</span>),
			},
			{
				title: 'Doctor',
				dataIndex: 'doctor',
				width: 160,
				ellipsis: true,
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({
					style: {
						whiteSpace: 'nowrap',
						textOverflow: 'ellipsis',
						overflow: 'hidden',
					},
				}),
				responsive: ['lg'],
				render: (val: string | undefined) => (loading ? renderSkeletonText('60%') : <span>{val}</span>),
			},
			{
				title: 'Last Visit',
				dataIndex: 'lastVisit',
				sorter: true,
				width: 140,
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				responsive: ['md', 'lg'],
				render: (val: string | undefined) => (loading ? renderSkeletonText('50%') : <span>{val}</span>),
			},
			{
				title: 'Status',
				dataIndex: 'status',
				width: 120,
				filters: [
					{ text: 'Active', value: 'active' },
					{ text: 'Inactive', value: 'inactive' },
					{ text: 'Discharged', value: 'discharged' },
				],
				render: (s: Patient['status']) =>
					loading ? (
						renderSkeletonSmall(70)
					) : (
						<Tag color={s === 'active' ? 'green' : s === 'inactive' ? 'orange' : 'blue'}>{s}</Tag>
					),
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				responsive: ['sm', 'md', 'lg'],
			},
			{
				title: 'Actions',
				dataIndex: 'actions',
				fixed: 'right',
				width: 150,
				onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
				render: (_: any, record: Patient) =>
					loading ? (
						<Space>
							<Skeleton.Input style={{ width: 32 }} active size="small" />
							<Skeleton.Input style={{ width: 32 }} active size="small" />
							<Skeleton.Input style={{ width: 32 }} active size="small" />
						</Space>
					) : (
						<Space>
							<Tooltip title="View">
								<Button
									icon={<EyeOutlined />}
									size="small"
									onClick={() => {
										setDrawerPatient(record);
										setDrawerOpen(true);
									}}
								/>
							</Tooltip>
							<Tooltip title="Edit">
								<Button
									icon={<EditOutlined />}
									size="small"
									onClick={() => {
										setFormMode('edit');
										setFormInitial({
											...record,
											lastVisit: record.lastVisit ? dayjs(record.lastVisit) : undefined,
										});
										setEditingPatientId(record.id);
										setFormVisible(true);
									}}
								/>
							</Tooltip>
							<Popconfirm
								title="Delete patient?"
								onConfirm={async () => {
									await handleDelete(record.id);
								}}
								okText="Yes"
								cancelText="No"
							>
								<Button icon={<DeleteOutlined />} danger size="small" />
							</Popconfirm>
						</Space>
					),
			},
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pagination.current, pagination.pageSize, loading]);

	const columns = useMemo(
		() => allColumns.filter((c) => !hiddenCols.includes(String(c.dataIndex))),
		[allColumns, hiddenCols],
	);

	// Column visibility handlers
	function toggleColumnVisibility(colKey: string, show: boolean) {
		const next = show ? hiddenCols.filter((c) => c !== colKey) : [...hiddenCols, colKey];
		setHiddenCols(next);
		localStorage.setItem(LOCAL_COLS_KEY, JSON.stringify(next));
	}

	function onTableChange(pg: any, _filters: any, sort: any) {
		const s = Array.isArray(sort) ? sort[0] : sort;
		const field = s?.field;
		const order = s?.order;

		setSorter(field ? { field, order } : null);
		setPagination({ current: pg.current, pageSize: pg.pageSize });
	}

	const rowSelection = {
		selectedRowKeys,
		onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
	};

	// applied filters chips
	const appliedFilters = useMemo(() => {
		const items: { key: string; label: string }[] = [];
		if (debouncedSearch) items.push({ key: 'search', label: `Search: "${debouncedSearch}"` });
		if (gender && gender !== 'all') items.push({ key: 'gender', label: `Gender: ${gender}` });
		if (dateRange && dateRange.length === 2)
			items.push({
				key: 'date',
				label: `Date: ${dateRange[0].format('YYYY-MM-DD')} → ${dateRange[1].format('YYYY-MM-DD')}`,
			});
		return items;
	}, [debouncedSearch, gender, dateRange]);

	const columnsMenu = (
		<Menu>
			{allColumns.map((col) => {
				const key = String(col.dataIndex);
				const disabled = key === 'sr' || key === 'actions' || key === 'avatarUrl';
				return (
					<Menu.Item key={key}>
						<Checkbox
							checked={!hiddenCols.includes(key)}
							disabled={disabled}
							onChange={(e) => toggleColumnVisibility(key, e.target.checked)}
						>
							{col.title as React.ReactNode}
						</Checkbox>
					</Menu.Item>
				);
			})}
		</Menu>
	);

	async function handleCreate(values: PatientFormValues) {
		try {
			const payload = {
				...values,
				lastVisit: values.lastVisit ? values.lastVisit.format('YYYY-MM-DD') : undefined,
			};
			await createMut.mutateAsync(payload);
			message.success('Patient created');
			setFormVisible(false);
			setEditingPatientId(null);
			setPagination((p) => ({ ...p, current: 1 }));
		} catch (e) {
			message.error('Failed to create patient');
		}
	}

	async function handleUpdate(id: string, values: PatientFormValues) {
		try {
			const payload = {
				...values,
				lastVisit: values.lastVisit ? values.lastVisit.format('YYYY-MM-DD') : undefined,
			};
			await updateMut.mutateAsync({ id, payload });
			message.success('Patient updated');
			setFormVisible(false);
			setEditingPatientId(null);
		} catch (e) {
			message.error('Failed to update patient');
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteMut.mutateAsync(id);
			message.success('Patient deleted');

			if (drawerPatient?.id === id) {
				setDrawerOpen(false);
				setDrawerPatient(null);
			}
		} catch (e) {
			message.error('Failed to delete patient');
		}
	}

	async function handleBulkDelete() {
		if (selectedRowKeys.length === 0) return message.warning('No rows selected');
		try {
			await bulkDeleteMut.mutateAsync(selectedRowKeys as string[]);
			message.success('Deleted selected patients');
			setSelectedRowKeys([]);
		} catch (e) {
			message.error('Failed to delete selected patients');
		}
	}

	async function onFormSubmit(values: PatientFormValues) {
		if (formMode === 'add') return handleCreate(values);
		if (formMode === 'edit' && editingPatientId) return handleUpdate(editingPatientId, values);
		message.error('Missing patient id for update');
	}

	// skeleton rows for table when loading
	const skeletonData = useMemo(() => {
		if (!loading) return [];
		const rows: any[] = [];
		const count = pagination.pageSize || 10;
		for (let i = 0; i < count; i++) rows.push({ id: `skeleton-${i}`, key: `skeleton-${i}` });
		return rows;
	}, [loading, pagination.pageSize]);

	const rangeStart = total === 0 ? 0 : Math.min((pagination.current - 1) * pagination.pageSize + 1, total);
	const rangeEnd = Math.min(pagination.current * pagination.pageSize, total);

	return (
		<div style={{ padding: 12 }}>
			{/* Top controls */}
			<Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
				<Col>
					<Title level={4} style={{ margin: 0 }}>
						Patients
					</Title>
					<Text type="secondary">Manage patient records, view clinical & contact details</Text>
				</Col>
				<Col>
					<Space>
						<Button
							icon={<FilterOutlined />}
							onClick={() => {
								setSearch('');
								setDebouncedSearch('');
								setGender('all');
								setDateRange(null);
								setSorter(null);
								setSelectedRowKeys([]);
								setPagination((p) => ({ ...p, current: 1 }));
								message.info('Filters cleared');
							}}
						>
							Clear Filters
						</Button>
						<Dropdown overlay={columnsMenu} trigger={['click']}>
							<Button icon={<SettingOutlined />}>Columns</Button>
						</Dropdown>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => {
								setFormMode('add');
								setFormInitial(undefined);
								setEditingPatientId(null);
								setFormVisible(true);
							}}
						>
							Add Patient
						</Button>
					</Space>
				</Col>
			</Row>

			{/* Applied filters chips */}
			{appliedFilters.length > 0 && (
				<Card style={{ marginBottom: 12 }}>
					<Space wrap>
						{appliedFilters.map((f) => (
							<Badge
								key={f.key}
								style={{
									background: '#f0f0f0',
									padding: '6px 10px',
									borderRadius: 16,
								}}
							>
								<Space align="center">
									<Text>{f.label}</Text>
									<a
										onClick={() => {
											if (f.key === 'search') setSearch('');
											if (f.key === 'gender') setGender('all');
											if (f.key === 'date') setDateRange(null);
										}}
									>
										Clear
									</a>
								</Space>
							</Badge>
						))}
					</Space>
				</Card>
			)}

			{/* Filters Card */}
			<Card style={{ marginBottom: 12 }}>
				<Row gutter={12}>
					<Col xs={24} sm={12} md={8}>
						<Input
							placeholder="Search by name, ID or phone"
							prefix={<SearchOutlined />}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							allowClear
						/>
					</Col>
					<Col xs={12} sm={6} md={4}>
						<Select value={gender} onChange={(v) => setGender(String(v))} style={{ width: '100%' }}>
							<Option value="all">All Gender</Option>
							<Option value="Male">Male</Option>
							<Option value="Female">Female</Option>
						</Select>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<RangePicker value={dateRange as any} onChange={(r) => setDateRange(r as any)} style={{ width: '100%' }} />
					</Col>
					<Col xs={24} sm={24} md={6} style={{ textAlign: 'right' }}>
						<Text type="secondary">
							Showing {rangeStart}–{rangeEnd} of {total} patients
						</Text>
					</Col>
				</Row>
			</Card>

			{/* Bulk actions */}
			{selectedRowKeys.length > 0 && (
				<Card style={{ marginBottom: 12 }}>
					<Space>
						<strong>{selectedRowKeys.length} selected</strong>
						<Popconfirm
							title="Delete selected patients?"
							onConfirm={() => handleBulkDelete()}
							okText="Yes"
							cancelText="No"
						>
							<Button danger icon={<DeleteOutlined />}>
								Delete Selected
							</Button>
						</Popconfirm>
					</Space>
				</Card>
			)}

			{/* Table */}
			<Card style={{ padding: 0, overflowX: 'auto' }}>
				<Table
					rowKey="id"
					columns={columns}
					dataSource={loading ? skeletonData : data}
					loading={false} // using custom skeleton rows, keep spinner off
					scroll={{ x: 1200 }}
					pagination={{
						current: pagination.current,
						pageSize: pagination.pageSize,
						total,
						showSizeChanger: true,
						pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS.map(String),
						showTotal: (t, range) => `Showing ${range[0]}–${range[1]} of ${t} patients`,
					}}
					onChange={onTableChange}
					rowSelection={rowSelection}
					onRow={(record) => ({
						onClick: () => {
							if (typeof record.id === 'string' && record.id.startsWith('skeleton-')) return;
							setDrawerPatient(record);
							setDrawerOpen(true);
						},
					})}
					sticky
				/>
			</Card>

			{/* Drawer */}
			<Drawer
				size={520}
				title={drawerPatient ? `${drawerPatient.name} (${drawerPatient.id})` : 'Patient'}
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
			>
				{drawerPatient && (
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						<img src={drawerPatient.avatarUrl || UPLOADED_ASSET} alt="avatar" style={{ width: 120, borderRadius: 8 }} />
						<div>
							<strong>ID:</strong> {drawerPatient.id}
						</div>
						<div>
							<strong>Name:</strong> {drawerPatient.name}
						</div>
						<div>
							<strong>Gender:</strong> {drawerPatient.gender}
						</div>
						<div>
							<strong>Age:</strong> {drawerPatient.age}
						</div>
						<div>
							<strong>Phone:</strong> {drawerPatient.phone}
						</div>
						<div>
							<strong>Doctor:</strong> {drawerPatient.doctor}
						</div>
						<div>
							<strong>Last Visit:</strong> {drawerPatient.lastVisit}
						</div>
						<div>
							<strong>Status:</strong>{' '}
							<Tag
								color={
									drawerPatient.status === 'active' ? 'green' : drawerPatient.status === 'inactive' ? 'orange' : 'blue'
								}
							>
								{drawerPatient.status}
							</Tag>
						</div>
						<Divider />
						<Title level={5}>Notes</Title>
						<Text>{drawerPatient.notes ?? 'No notes'}</Text>
					</Space>
				)}
			</Drawer>

			{/* PatientForm usage */}
			{formVisible && (
				<PatientForm
					visible={formVisible}
					mode={formMode}
					initialValues={formInitial}
					confirmLoading={confirmLoading}
					onCancel={() => {
						setFormVisible(false);
						setEditingPatientId(null);
						setFormInitial(undefined);
					}}
					onSubmit={onFormSubmit}
					avatarPlaceholderUrl={UPLOADED_ASSET}
				/>
			)}

			{/* Styles */}
			<style>{`
        .ant-table-tbody > tr:hover > td {
          background: rgba(24, 144, 255, 0.04);
          transition: background 0.12s;
        }
      `}</style>
		</div>
	);
}
