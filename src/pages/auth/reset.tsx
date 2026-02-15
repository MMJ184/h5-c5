import { KeyOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button, Form, Input, Space, Typography, message } from 'antd';
import { useState } from 'react';

import AuthShell from './AuthShell';

interface ResetValues {
	code: string;
	password: string;
	confirm: string;
}

export default function ResetPasswordPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const onFinish = async () => {
		setLoading(true);
		setTimeout(() => {
			message.success('Password updated successfully');
			setLoading(false);
			navigate({ to: '/login' });
		}, 700);
	};

	return (
		<AuthShell
			title="Reset password"
			subtitle="Enter your reset code and choose a new password."
			footer={
				<Space direction="vertical" size={4} style={{ width: '100%' }}>
					<Typography.Text type="secondary">
						Need a reset link? <Link to="/forgot-password">Request one</Link>
					</Typography.Text>
					<Typography.Text type="secondary">
						Back to <Link to="/login">login</Link>
					</Typography.Text>
				</Space>
			}
		>
			<Form<ResetValues> layout="vertical" onFinish={onFinish}>
				<Form.Item name="code" label="Reset code" rules={[{ required: true, message: 'Enter your reset code' }]}>
					<Input prefix={<KeyOutlined />} placeholder="Enter the code from your email" />
				</Form.Item>

				<Form.Item
					name="password"
					label="New password"
					rules={[{ required: true, message: 'Enter a new password' }, { min: 8, message: 'At least 8 characters' }]}
				>
					<Input.Password prefix={<LockOutlined />} placeholder="Create a new password" />
				</Form.Item>

				<Form.Item
					name="confirm"
					label="Confirm password"
					dependencies={['password']}
					rules={[
						{ required: true, message: 'Confirm your password' },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('password') === value) return Promise.resolve();
								return Promise.reject(new Error('Passwords do not match'));
							},
						}),
					]}
				>
					<Input.Password prefix={<LockOutlined />} placeholder="Re-enter your password" />
				</Form.Item>

				<Button type="primary" htmlType="submit" block loading={loading}>
					Update password
				</Button>
			</Form>
		</AuthShell>
	);
}
