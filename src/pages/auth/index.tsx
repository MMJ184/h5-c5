import {
	ClockCircleOutlined,
	GoogleOutlined,
	LockOutlined,
	SafetyOutlined,
	UserOutlined,
	WindowsOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Form, Input, Button, Checkbox, Row, Col, Divider, Typography, Space, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../auth/useAuth';
import AuthShell from './AuthShell';

const { Text } = Typography;

interface LoginFormValues {
	email: string;
	password: string;
	remember?: boolean;
}

export default function LoginPage() {
	const auth = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [loading, setLoading] = useState(false);

	// Safe redirect handling (TanStack Router)
	const from =
		(location.state as { from?: { pathname?: string } } | null)?.from?.pathname &&
		!['/login', '/forgot-password', '/reset-password'].includes(
			(location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '',
		)
			? (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
			: '/dashboard';

	useEffect(() => {
		if (auth.isAuthenticated) {
			navigate({ to: '/dashboard', replace: true });
		}
	}, [auth.isAuthenticated, navigate]);

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
				const rawMsg = err instanceof Error ? err.message : 'Login failed';
				const msg = /not able to connect to server|network|failed to fetch|load failed/i.test(rawMsg)
					? 'Not able to connect to server'
					: rawMsg;
				message.error(msg);
			} finally {
				setLoading(false);
			}
		},
		[auth, navigate, from],
	);

	// SOCIAL: simulate OAuth success
	const onSocial = (provider: 'google' | 'microsoft') => {
		setLoading(true);

		setTimeout(() => {
			auth.setAuth?.({
				roles: ['admin'],
				permissions: ['*'],
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

	return (
		<AuthShell
			title="Welcome back"
			subtitle="Access schedules, records, and team communication in one secure workspace."
			footer={
				<Row justify="space-between" align="middle">
					<Text type="secondary">Need access setup?</Text>
					<Text type="secondary">
						<Link to="/forgot-password">Reset your password</Link>
					</Text>
				</Row>
			}
			heroTitle="A modern command center for care teams"
			heroSubtitle="Coordinate people, appointments, and secure operations with confidence."
		>
			<div className="auth-form">
				<div className="auth-form-intro auth-form-intro--top">
					<Space size={14} wrap>
						<div className="auth-promise">
							<SafetyOutlined />
							<Text>MFA-ready</Text>
						</div>
						<div className="auth-promise">
							<ClockCircleOutlined />
							<Text>Session timeout controls</Text>
						</div>
					</Space>
				</div>

				<Form<LoginFormValues> name="login" layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
					<Form.Item
						name="email"
						label="Email"
						rules={[
							{ required: true, message: 'Please enter your email' },
							{ type: 'email', message: 'Enter a valid email' },
						]}
					>
						<Input prefix={<UserOutlined />} placeholder="you@clinic.com" autoComplete="username" />
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
								<Checkbox>Keep me signed in</Checkbox>
							</Form.Item>
						</Col>
						<Col>
							<Link to="/forgot-password" className="auth-link-strong">
								Forgot password?
							</Link>
						</Col>
					</Row>

					<Form.Item style={{ marginTop: 16 }}>
						<Button type="primary" htmlType="submit" block loading={loading} size="large" className="auth-main-cta">
							Sign In
						</Button>
					</Form.Item>
				</Form>

				<Divider plain>
					<Text type="secondary">Or continue with SSO</Text>
				</Divider>

				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Button
						icon={<GoogleOutlined />}
						block
						onClick={() => onSocial('google')}
						loading={loading}
						className="auth-social auth-social-google"
					>
						Continue with Google
					</Button>
					<Button
						icon={<WindowsOutlined />}
						block
						onClick={() => onSocial('microsoft')}
						loading={loading}
						className="auth-social auth-social-microsoft"
					>
						Continue with Microsoft
					</Button>
				</Space>
			</div>

			<style>{`
				.auth-form {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}
				.auth-form-intro {
					padding: 10px 12px;
					border-radius: 12px;
					border: 1px solid rgba(14, 116, 144, 0.18);
					background: linear-gradient(125deg, rgba(14, 165, 233, 0.08), rgba(34, 197, 94, 0.07));
				}
				.auth-form-intro--top {
					padding: 12px 14px;
				}
				.auth-promise {
					display: inline-flex;
					align-items: center;
					gap: 7px;
					font-size: 12px;
					font-weight: 600;
					color: rgba(15, 23, 42, 0.86);
				}
				.auth-promise span[role="img"] {
					color: #0891b2;
				}
				.auth-shell--dark .auth-form-intro {
					background: linear-gradient(125deg, rgba(14, 165, 233, 0.14), rgba(34, 197, 94, 0.12));
					border-color: rgba(148, 163, 184, 0.25);
				}
				.auth-shell--dark .auth-promise {
					color: rgba(226, 232, 240, 0.9);
				}
				.auth-shell--dark .auth-promise span[role="img"] {
					color: #67e8f9;
				}
				.auth-social {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					height: 44px;
				}
				.auth-social-google {
					border-color: rgba(249, 115, 22, 0.32);
					background: rgba(255, 255, 255, 0.88);
				}
				.auth-social-microsoft {
					border-color: rgba(37, 99, 235, 0.28);
					background: rgba(255, 255, 255, 0.88);
				}
				.auth-shell--dark .auth-social-google,
				.auth-shell--dark .auth-social-microsoft {
					background: rgba(15, 23, 42, 0.72);
					border-color: rgba(148, 163, 184, 0.32);
					color: rgba(226, 232, 240, 0.95);
				}
				.auth-shell--dark .auth-social-google:hover,
				.auth-shell--dark .auth-social-microsoft:hover {
					background: rgba(30, 41, 59, 0.88);
				}
				.auth-main-cta {
					height: 46px;
					font-weight: 700;
					letter-spacing: 0.2px;
				}
				.auth-link-strong {
					font-weight: 600;
					color: #0e7490;
				}
				.auth-shell .auth-form .ant-form-item-label > label,
				.auth-shell .auth-form .ant-typography,
				.auth-shell .auth-form .ant-checkbox + span,
				.auth-shell .auth-form .ant-btn-default,
				.auth-shell .auth-form .ant-btn-text {
					color: rgba(15, 23, 42, 0.92);
				}
				.auth-shell .auth-form .ant-typography-secondary {
					color: rgba(51, 65, 85, 0.86) !important;
				}
				.auth-shell--dark .auth-link-strong {
					color: #67e8f9;
				}
				.auth-shell--dark .auth-form .ant-form-item-label > label,
				.auth-shell--dark .auth-form .ant-typography,
				.auth-shell--dark .auth-form .ant-checkbox + span,
				.auth-shell--dark .auth-form .ant-btn-default,
				.auth-shell--dark .auth-form .ant-btn-text {
					color: rgba(226, 232, 240, 0.95);
				}
				.auth-shell--dark .auth-form .ant-typography-secondary {
					color: rgba(148, 163, 184, 0.92) !important;
				}
			`}</style>
		</AuthShell>
	);
}
