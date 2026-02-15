import {
	CheckCircleFilled,
	LockOutlined,
	RadarChartOutlined,
	SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Space, Tag, Typography, theme } from 'antd';
import type { ReactNode } from 'react';

import { useTheme } from '../../app/providers/ThemeProvider';

const { Title, Text } = Typography;

interface AuthShellProps {
	title: string;
	subtitle?: string;
	children: ReactNode;
	footer?: ReactNode;
	heroTitle?: string;
	heroSubtitle?: string;
}

export default function AuthShell({
	title,
	subtitle,
	children,
	footer,
	heroTitle = 'Secure access for modern clinics',
	heroSubtitle = 'Fast, compliant, and built for teams that coordinate in real time.',
}: AuthShellProps) {
	const { token } = theme.useToken();
	const { dark } = useTheme();

	return (
		<div className={`auth-shell${dark ? ' auth-shell--dark' : ''}`}>
			<div className="auth-backdrop" aria-hidden />
			<div className="auth-orb auth-orb--a" aria-hidden />
			<div className="auth-orb auth-orb--b" aria-hidden />
			<div className="auth-gridlines" aria-hidden />

			<Row gutter={[24, 24]} align="middle" className="auth-grid">
				<Col xs={24} lg={12}>
					<div className="auth-hero">
						<div className="auth-logo">
							<img src="/images/auth-logo.svg" alt="H5-Care" />
							<Title level={4} style={{ margin: 0 }}>
								H5-Care
							</Title>
						</div>

						<div className="auth-hero-body">
							<Tag className="auth-badge" bordered={false}>
								Healthcare Workspace
							</Tag>
							<Title level={2} style={{ marginBottom: 8 }}>
								{heroTitle}
							</Title>
							<Text type="secondary">{heroSubtitle}</Text>

							<Space direction="vertical" size="middle" style={{ marginTop: 24 }}>
								<div className="auth-feature">
									<RadarChartOutlined />
									<div>
										<Text strong>Real-time operations</Text>
										<br />
										<Text type="secondary">Teams, schedules, and alerts in one view.</Text>
									</div>
								</div>
								<div className="auth-feature">
									<SafetyCertificateOutlined />
									<div>
										<Text strong>Security first</Text>
										<br />
										<Text type="secondary">Audit-friendly access controls for every role.</Text>
									</div>
								</div>
								<div className="auth-feature">
									<LockOutlined />
									<div>
										<Text strong>Encrypted sessions</Text>
										<br />
										<Text type="secondary">Protected sign-in and secure session handling.</Text>
									</div>
								</div>
							</Space>
						</div>

						<div className="auth-metric-row">
							<div className="auth-metric">
								<CheckCircleFilled />
								<div>
									<div className="auth-metric-value">99.95%</div>
									<div className="auth-metric-label">Uptime</div>
								</div>
							</div>
							<div className="auth-metric">
								<SafetyCertificateOutlined />
								<div>
									<div className="auth-metric-value">SOC2</div>
									<div className="auth-metric-label">Aligned</div>
								</div>
							</div>
						</div>

						<img className="auth-hero-illustration" src="/images/auth-hero-modern.svg" alt="Analytics and workflow panel" />
					</div>
				</Col>

				<Col xs={24} lg={12}>
					<Card
						className="auth-card"
						style={{ background: token.colorBgElevated, borderColor: token.colorBorderSecondary }}
						styles={{ body: { padding: 32 } }}
					>
						<div className="auth-card-glow" aria-hidden />
						<Space direction="vertical" size="small" style={{ width: '100%' }}>
							<Title level={3} style={{ margin: 0 }}>
								{title}
							</Title>
							{subtitle && <Text type="secondary">{subtitle}</Text>}
						</Space>

						<div style={{ marginTop: 24 }}>{children}</div>

						{footer && <div style={{ marginTop: 20 }}>{footer}</div>}
					</Card>
				</Col>
			</Row>

			<style>{`
				.auth-shell {
					min-height: 100vh;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 28px 18px;
					background: linear-gradient(140deg, #f2f7fb 0%, #dbeafe 35%, #fee2e2 100%);
					position: relative;
					overflow: hidden;
					font-family: "Segoe UI Variable", "Inter", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
				}
				.auth-shell.auth-shell--dark {
					background: linear-gradient(135deg, #0b1220 0%, #1e293b 50%, #172033 100%);
				}
				.auth-shell .auth-backdrop {
					position: absolute;
					inset: -120px;
					background:
						radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.3), transparent 55%),
						radial-gradient(circle at 82% 14%, rgba(251, 113, 133, 0.18), transparent 50%),
						radial-gradient(circle at 60% 82%, rgba(16, 185, 129, 0.18), transparent 55%);
					z-index: 0;
				}
				.auth-shell.auth-shell--dark .auth-backdrop {
					background:
						radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.2), transparent 55%),
						radial-gradient(circle at 80% 10%, rgba(244, 63, 94, 0.18), transparent 50%),
						radial-gradient(circle at 60% 80%, rgba(34, 197, 94, 0.12), transparent 55%);
				}
				.auth-shell .auth-orb {
					position: absolute;
					border-radius: 999px;
					filter: blur(4px);
					opacity: 0.35;
					z-index: 0;
				}
				.auth-shell.auth-shell--dark .auth-orb {
					opacity: 0.2;
				}
				.auth-shell .auth-orb--a {
					width: 180px;
					height: 180px;
					right: 12%;
					top: 12%;
					background: linear-gradient(130deg, #22d3ee, #0ea5e9);
				}
				.auth-shell .auth-orb--b {
					width: 220px;
					height: 220px;
					left: 8%;
					bottom: 8%;
					background: linear-gradient(130deg, #fb7185, #f97316);
				}
				.auth-shell .auth-gridlines {
					position: absolute;
					inset: 0;
					background-image:
						linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
						linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
					background-size: 28px 28px;
					mask-image: radial-gradient(circle at center, black 35%, transparent 82%);
					z-index: 0;
				}
				.auth-shell.auth-shell--dark .auth-gridlines {
					background-image:
						linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
						linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
				}
				.auth-shell .auth-grid {
					position: relative;
					z-index: 1;
					width: min(1140px, 100%);
				}
				.auth-shell .auth-hero {
					background: ${dark ? 'rgba(11, 18, 32, 0.86)' : 'rgba(255, 255, 255, 0.72)'};
					border-radius: 20px;
					padding: 30px 30px 24px;
					border: 1px solid ${dark ? 'rgba(148, 163, 184, 0.26)' : 'rgba(255, 255, 255, 0.82)'};
					box-shadow: 0 24px 50px rgba(32, 41, 66, ${dark ? '0.45' : '0.12'});
					backdrop-filter: blur(10px);
					animation: authFloatIn 0.6s ease;
				}
				.auth-shell .auth-logo {
					display: flex;
					align-items: center;
					gap: 12px;
					font-family: "Segoe UI Variable", "Inter", "Segoe UI", sans-serif;
				}
				.auth-shell .auth-logo img {
					width: 40px;
					height: 40px;
				}
				.auth-shell .auth-hero-body {
					margin-top: 16px;
				}
				.auth-shell .auth-badge {
					margin-bottom: 14px;
					padding: 2px 10px;
					border-radius: 999px;
					font-weight: 700;
					background: ${dark ? 'rgba(34, 211, 238, 0.18)' : 'rgba(14, 116, 144, 0.12)'};
					color: ${dark ? '#67e8f9' : '#0e7490'};
				}
				.auth-shell .auth-feature {
					display: flex;
					gap: 12px;
					align-items: flex-start;
					padding: 10px 12px;
					border-radius: 12px;
					background: ${dark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.84)'};
					border: 1px solid ${dark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 0.9)'};
				}
				.auth-shell .auth-feature span[role="img"] {
					font-size: 20px;
					color: ${token.colorPrimary};
					margin-top: 2px;
				}
				.auth-shell .auth-metric-row {
					margin-top: 20px;
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 10px;
				}
				.auth-shell .auth-metric {
					display: flex;
					align-items: center;
					gap: 10px;
					padding: 10px 12px;
					border-radius: 12px;
					background: ${dark ? 'rgba(15, 23, 42, 0.62)' : 'rgba(255, 255, 255, 0.88)'};
					border: 1px solid ${dark ? 'rgba(100, 116, 139, 0.36)' : 'rgba(148, 163, 184, 0.22)'};
				}
				.auth-shell .auth-metric span[role="img"] {
					font-size: 18px;
					color: ${token.colorPrimary};
				}
				.auth-shell .auth-metric-value {
					font-weight: 800;
					font-size: 16px;
					line-height: 1.1;
				}
				.auth-shell .auth-metric-label {
					font-size: 12px;
					opacity: 0.76;
				}
				.auth-shell .auth-hero-illustration {
					margin-top: 24px;
					width: 100%;
					border-radius: 16px;
					border: 1px solid ${dark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(0, 0, 0, 0.06)'};
					background: ${dark ? '#0f172a' : '#fff'};
				}
				.auth-shell .auth-card {
					border-radius: 18px;
					box-shadow: 0 18px 40px rgba(15, 23, 42, ${dark ? '0.45' : '0.12'});
					position: relative;
					overflow: hidden;
					animation: authSlideIn 0.6s ease;
					color: ${dark ? 'rgba(226, 232, 240, 0.96)' : 'rgba(15, 23, 42, 0.95)'};
				}
				.auth-shell .auth-card-glow {
					position: absolute;
					inset: -60% 30% auto -40%;
					height: 200px;
					background: radial-gradient(circle, rgba(124, 58, 237, 0.16), transparent 70%);
					pointer-events: none;
				}
				.auth-shell.auth-shell--dark .auth-card-glow {
					background: radial-gradient(circle, rgba(56, 189, 248, 0.15), transparent 70%);
				}
				@keyframes authFloatIn {
					from { transform: translateY(18px); opacity: 0; }
					to { transform: translateY(0); opacity: 1; }
				}
				@keyframes authSlideIn {
					from { transform: translateX(20px); opacity: 0; }
					to { transform: translateX(0); opacity: 1; }
				}
				@media (max-width: 991px) {
					.auth-shell .auth-hero {
						display: none;
					}
				}
			`}</style>
		</div>
	);
}
