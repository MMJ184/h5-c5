import { Link } from '@tanstack/react-router';
import { Button, Space, Typography, theme } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

export default function NotFoundPage() {
	const { token } = theme.useToken();

	return (
		<div className="not-found">
			<div className="not-found-aurora" />

			<div className="not-found-card">
				<div className="not-found-code">404</div>
				<Title level={3} style={{ marginBottom: 8 }}>
					Page not found
				</Title>
				<Text type="secondary">
					The page you’re looking for doesn’t exist or has been moved.
				</Text>

				<Space style={{ marginTop: 20 }}>
					<Button type="primary">
						<Link to="/dashboard">Go to dashboard</Link>
					</Button>
					<Button>
						<Link to="/patients">Patients</Link>
					</Button>
				</Space>
			</div>

			<div className="not-found-graphic">
				<div className="not-found-orbit" />
				<div className="not-found-dot not-found-dot--a" />
				<div className="not-found-dot not-found-dot--b" />
				<div className="not-found-dot not-found-dot--c" />
			</div>

			<style>{`
				.not-found {
					min-height: calc(100vh - 120px);
					display: grid;
					place-items: center;
					padding: 32px 16px;
					background: ${token.colorBgContainer};
					position: relative;
					overflow: hidden;
				}
				.not-found-aurora {
					position: absolute;
					inset: -20% 0 auto;
					height: 60%;
					background:
						radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.25), transparent 55%),
						radial-gradient(circle at 70% 10%, rgba(236, 72, 153, 0.2), transparent 55%),
						radial-gradient(circle at 40% 70%, rgba(16, 185, 129, 0.15), transparent 55%);
					z-index: 0;
				}
				.not-found-card {
					position: relative;
					z-index: 1;
					padding: 36px;
					border-radius: 20px;
					background: ${token.colorBgElevated};
					border: 1px solid ${token.colorBorderSecondary};
					box-shadow: ${token.boxShadowSecondary};
					text-align: center;
					max-width: 520px;
				}
				.not-found-code {
					font-size: 96px;
					font-weight: 700;
					letter-spacing: -6px;
					color: ${token.colorPrimary};
					line-height: 1;
					margin-bottom: 12px;
				}
				.not-found-graphic {
					position: absolute;
					right: 8%;
					bottom: 12%;
					width: 180px;
					height: 180px;
					border-radius: 50%;
					border: 1px dashed ${token.colorBorderSecondary};
					opacity: 0.6;
				}
				.not-found-orbit {
					position: absolute;
					inset: 24px;
					border-radius: 50%;
					border: 1px dashed ${token.colorBorderSecondary};
				}
				.not-found-dot {
					position: absolute;
					width: 14px;
					height: 14px;
					border-radius: 50%;
					background: ${token.colorPrimary};
					animation: floaty 6s ease-in-out infinite;
				}
				.not-found-dot--a { top: 6px; left: 30px; }
				.not-found-dot--b { bottom: 24px; right: 14px; animation-delay: 1.2s; }
				.not-found-dot--c { top: 40%; right: 60%; width: 10px; height: 10px; animation-delay: 2s; }

				@keyframes floaty {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-8px); }
				}

				@media (max-width: 768px) {
					.not-found-graphic { display: none; }
					.not-found-code { font-size: 72px; }
				}
			`}</style>
		</div>
	);
}
