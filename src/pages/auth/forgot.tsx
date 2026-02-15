import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button, Form, Input, Space, Typography, message } from 'antd';
import { useState } from 'react';

import AuthShell from './AuthShell';

interface ForgotValues {
	email: string;
}

export default function ForgotPasswordPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const onFinish = async (values: ForgotValues) => {
		setLoading(true);
		setTimeout(() => {
			message.success(`Reset link sent to ${values.email}`);
			setLoading(false);
			navigate({ to: '/reset-password' });
		}, 700);
	};

	return (
		<AuthShell
			title="Forgot your password?"
			subtitle="We’ll email you a secure link to reset it."
			footer={
				<Space direction="vertical" size={4} style={{ width: '100%' }}>
					<Typography.Text type="secondary">
						Remembered it? <Link to="/login">Back to login</Link>
					</Typography.Text>
					<Typography.Text type="secondary">
						Have a reset code already? <Link to="/reset-password">Reset password</Link>
					</Typography.Text>
				</Space>
			}
		>
			<Form<ForgotValues> layout="vertical" onFinish={onFinish}>
				<Form.Item
					name="email"
					label="Email"
					rules={[
						{ required: true, message: 'Please enter your email' },
						{ type: 'email', message: 'Enter a valid email' },
					]}
				>
					<Input prefix={<MailOutlined />} placeholder="you@clinic.com" autoComplete="email" />
				</Form.Item>

				<Button type="primary" htmlType="submit" block loading={loading}>
					Send reset link
				</Button>
			</Form>
		</AuthShell>
	);
}
