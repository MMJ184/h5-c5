import { LockOutlined, UserOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Card, Form, Input, Button, Checkbox, Row, Col, Divider, Typography, Space, message, theme } from 'antd';
import React, { useCallback, useState } from 'react';

import { useAuth } from '../../auth/useAuth';

const { Title, Text } = Typography;

interface LoginFormValues {
	email: string;
	password: string;
	remember?: boolean;
}

export default function LoginPage() {
	const { token } = theme.useToken();
	const auth = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [loading, setLoading] = useState(false);

	// Safe redirect handling (TanStack Router)
	const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

	const onFinish = useCallback(
		async (values: LoginFormValues) => {
			setLoading(true);
			try {
				await auth.login?.({
					username: values.email,
					password: values.password,
				});

				message.success('Signed in');

				navigate({
					to: from,
					replace: true,
				});
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : 'Login failed';
				message.error(msg);
			} finally {
				setLoading(false);
			}
		},
		[auth, navigate, from],
	);

	// SOCIAL: simulate OAuth success
	const onSocial = (provider: 'google' | 'github') => {
		setLoading(true);

		setTimeout(() => {
			auth.setAuth?.({
				roles: ['user'],
				permissions: ['appointments.view', 'patients.view'],
				isAuthenticated: true,
				user: {
					id: `social_${provider}`,
					name: `${provider}_user`,
					email: `${provider}@example.com`,
				},
			});

			setLoading(false);
			message.success(`Signed in with ${provider}`);

			navigate({
				to: from,
				replace: true,
			});
		}, 700);
	};

	const styles = {
		page: {
			minHeight: '100vh',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background: token.colorBgContainer,
			padding: 16,
		} as React.CSSProperties,
		card: {
			width: 480,
			maxWidth: '100%',
			borderRadius: 12,
			boxShadow: token.boxShadowSecondary,
			background: token.colorBgElevated,
		} as React.CSSProperties,
		socialBtn: {
			width: '100%',
			justifyContent: 'flex-start',
		} as React.CSSProperties,
	};

	return (
		<div style={styles.page}>
			<Card
				style={styles.card}
				styles={{ body: { padding: 28 } }} // AntD v6 correct API
			>
				<Row justify="center" style={{ marginBottom: 8 }}>
					<Col>
						<Title level={3} style={{ margin: 0 }}>
							Sign in to H5-Care
						</Title>
						<Text type="secondary">Welcome back — please sign in to continue</Text>
					</Col>
				</Row>

				<Form<LoginFormValues> name="login" layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
					<Form.Item
						name="email"
						label="Email"
						rules={[
							{ required: true, message: 'Please enter your email' },
							{ type: 'email', message: 'Enter a valid email' },
						]}
					>
						<Input prefix={<UserOutlined />} placeholder="you@company.com" autoComplete="username" />
					</Form.Item>

					<Form.Item
						name="password"
						label="Password"
						rules={[{ required: true, message: 'Please enter your password' }]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Password" autoComplete="current-password" />
					</Form.Item>

					<Row justify="space-between" align="middle">
						<Col>
							<Form.Item name="remember" valuePropName="checked" noStyle>
								<Checkbox>Remember me</Checkbox>
							</Form.Item>
						</Col>
						<Col>
							<a href="/forgot-password">Forgot password?</a>
						</Col>
					</Row>

					<Form.Item style={{ marginTop: 16 }}>
						<Button type="primary" htmlType="submit" block loading={loading}>
							Sign In
						</Button>
					</Form.Item>
				</Form>

				<Divider plain>
					<Text type="secondary">Or continue with</Text>
				</Divider>

				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Button
						icon={<GoogleOutlined />}
						style={styles.socialBtn}
						onClick={() => onSocial('google')}
						loading={loading}
					>
						Continue with Google
					</Button>

					<Button
						icon={<GithubOutlined />}
						style={styles.socialBtn}
						onClick={() => onSocial('github')}
						loading={loading}
					>
						Continue with GitHub
					</Button>
				</Space>

				<Row justify="center" style={{ marginTop: 20 }}>
					<Text type="secondary">
						Don&apos;t have an account? <a href="/signup">Create account</a>
					</Text>
				</Row>
			</Card>
		</div>
	);
}
