import { UploadOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	Space,
	Select,
	Upload,
	message,
	Grid,
	Row,
	Col,
	Divider,
	Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import type { UploadProps } from 'antd';

const { Option } = Select;
const { useBreakpoint } = Grid;

export interface PatientFormValues {
	name: string;
	gender: 'Male' | 'Female';
	age: number;
	phone: string;
	doctor?: string;
	lastVisit?: dayjs.Dayjs | null;
	status?: 'active' | 'inactive' | 'discharged';
	avatar?: any;
}

export interface PatientFormProps {
	variant?: 'modal' | 'page';
	visible: boolean;
	mode?: 'add' | 'edit';
	initialValues?: Partial<PatientFormValues>;
	onCancel: () => void;
	onSubmit: (values: PatientFormValues) => Promise<void> | void;
	confirmLoading?: boolean;
	title?: string;
	avatarPlaceholderUrl?: string;
}

/* ---------------- Wrapper ---------------- */

export default function PatientForm(props: PatientFormProps) {
	const { variant = 'modal', visible } = props;

	if (variant === 'page') {
		return <PatientFormInner {...props} onAfterClose={() => {}} />;
	}

	const [mounted, setMounted] = useState(visible);

	useEffect(() => {
		if (visible) setMounted(true);
	}, [visible]);

	if (!mounted) return null;

	return <PatientFormInner {...props} onAfterClose={() => setMounted(false)} />;
}

/* ---------------- Inner ---------------- */

function PatientFormInner(props: PatientFormProps & { onAfterClose: () => void }) {
	const {
		variant = 'modal',
		visible,
		mode = 'add',
		initialValues,
		onCancel,
		onSubmit,
		confirmLoading = false,
		title,
		avatarPlaceholderUrl = '/mock/avatar-placeholder.png',
		onAfterClose,
	} = props;

	const [form] = Form.useForm<PatientFormValues>();
	const screens = useBreakpoint();
	const isPage = variant === 'page';
	const isActive = isPage ? true : visible;
	const headerTitle = title ?? (mode === 'add' ? 'Add Patient' : 'Edit Patient');

	useEffect(() => {
		if (!isActive) return;

		form.setFieldsValue({
			status: 'active',
			...initialValues,
			lastVisit: initialValues?.lastVisit ? dayjs(initialValues.lastVisit) : undefined,
		});
	}, [isActive, initialValues, form]);

	const uploadProps: UploadProps = useMemo(
		() => ({
			beforeUpload: () => false,
			maxCount: 1,
			onRemove() {
				message.info('Avatar removed');
			},
		}),
		[],
	);

	const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

	async function handleSubmit() {
		try {
			const values = await form.validateFields();
			await onSubmit(values);
		} catch {
			/* validation handled by form */
		}
	}

	const modalWidth = screens.xl ? 900 : screens.lg ? 820 : screens.md ? 720 : '100%';

	const formContent = (
		<Form form={form} layout="vertical" preserve={false} onFinish={handleSubmit}>
			{/* BASIC INFO */}
			<Divider>Basic Information</Divider>

			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Enter patient name' }]}>
						<Input />
					</Form.Item>
				</Col>

				<Col xs={24} md={12}>
					<Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Enter phone number' }]}>
						<Input />
					</Form.Item>
				</Col>

				<Col xs={24} md={12}>
					<Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
						<Select>
							<Option value="Male">Male</Option>
							<Option value="Female">Female</Option>
						</Select>
					</Form.Item>
				</Col>

				<Col xs={24} md={12}>
					<Form.Item name="age" label="Age" rules={[{ required: true }]}>
						<InputNumber min={0} style={{ width: '100%' }} />
					</Form.Item>
				</Col>
			</Row>

			{/* CLINICAL */}
			<Divider>Clinical</Divider>

			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item name="doctor" label="Doctor">
						<Input />
					</Form.Item>
				</Col>

				<Col xs={24} md={12}>
					<Form.Item name="lastVisit" label="Last visit">
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
				</Col>

				<Col xs={24} md={12}>
					<Form.Item name="status" label="Status">
						<Select>
							<Option value="active">Active</Option>
							<Option value="inactive">Inactive</Option>
							<Option value="discharged">Discharged</Option>
						</Select>
					</Form.Item>
				</Col>
			</Row>

			{/* AVATAR */}
			<Divider>Avatar</Divider>

			<Row gutter={16} align="middle">
				<Col xs={24} md={12}>
					<Form.Item name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
						<Upload {...uploadProps} listType="picture">
							<Button icon={<UploadOutlined />}>Choose image</Button>
						</Upload>
					</Form.Item>
				</Col>

				<Col xs={24} md={12}>
					<img
						src={avatarPlaceholderUrl}
						alt="avatar"
						style={{
							width: 96,
							borderRadius: 8,
							border: '1px solid #eee',
						}}
					/>
				</Col>
			</Row>

			{isPage && (
				<>
					<Divider />
					<Space>
						<Button onClick={onCancel}>Cancel</Button>
						<Button type="primary" htmlType="submit" loading={confirmLoading}>
							{mode === 'add' ? 'Create' : 'Save'}
						</Button>
					</Space>
				</>
			)}
		</Form>
	);

	if (isPage) {
		return (
			<div style={{ padding: 0 }}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					<Typography.Title level={4} style={{ margin: 0 }}>
						{headerTitle}
					</Typography.Title>
					<Card>{formContent}</Card>
				</Space>
			</div>
		);
	}

	return (
		<Modal
			open={visible}
			title={headerTitle}
			onCancel={onCancel}
			onOk={handleSubmit}
			okText={mode === 'add' ? 'Create' : 'Save'}
			confirmLoading={confirmLoading}
			width={modalWidth}
			centered
			destroyOnClose
			afterClose={() => {
				form.resetFields();
				onAfterClose();
			}}
		>
			{formContent}
		</Modal>
	);
}
