import { UploadOutlined } from '@ant-design/icons';
import {
	Button,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	Select,
	Upload,
	message,
	Grid,
	Row,
	Col,
	Divider,
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
	const { visible } = props;
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

	useEffect(() => {
		if (!visible) return;

		form.setFieldsValue({
			status: 'active',
			...initialValues,
			lastVisit: initialValues?.lastVisit ? dayjs(initialValues.lastVisit) : undefined,
		});
	}, [visible, initialValues, form]);

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

	async function handleOk() {
		try {
			const values = await form.validateFields();
			await onSubmit(values);
		} catch {
			/* validation handled by form */
		}
	}

	const modalWidth = screens.xl ? 900 : screens.lg ? 820 : screens.md ? 720 : '100%';

	return (
		<Modal
			open={visible}
			title={title ?? (mode === 'add' ? 'Add Patient' : 'Edit Patient')}
			onCancel={onCancel}
			onOk={handleOk}
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
			<Form form={form} layout="vertical" preserve={false}>
				{/* BASIC INFO */}
				<Divider orientation="left">Basic Information</Divider>

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
				<Divider orientation="left">Clinical</Divider>

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
				<Divider orientation="left">Avatar</Divider>

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
			</Form>
		</Modal>
	);
}
