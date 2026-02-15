import { Button, Collapse, Modal, Progress, Space, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { errorHandlingConfig } from '../config/errorHandling';

export default function AppCrashScreen(props: { error?: unknown }) {
	const totalSeconds = Math.ceil(errorHandlingConfig.redirectDelayMs / 1000);
	const [remaining, setRemaining] = useState(totalSeconds);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const errorId = useMemo(
		() => `ERR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
		[],
	);

	const lastError = useMemo(() => {
		try {
			const raw = sessionStorage.getItem('lastError');
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}, []);

	const errorMessage = useMemo(() => {
		if (props.error instanceof Error) return props.error.message;
		if (typeof props.error === 'string') return props.error;
		return lastError?.message || errorHandlingConfig.message;
	}, [props.error, lastError]);

	const errorStack = useMemo(() => {
		if (props.error instanceof Error) return props.error.stack;
		return lastError?.stack || '';
	}, [props.error, lastError]);

	const buildReportPayload = () => {
		const payload: Record<string, unknown> = {
			id: errorId,
			message: errorMessage,
			stack: errorStack,
			timestamp: new Date().toISOString(),
		};
		if (errorHandlingConfig.includeUrl) payload.url = window.location.href;
		if (errorHandlingConfig.includeUserAgent) payload.userAgent = navigator.userAgent;
		return payload;
	};

	const sendReport = async () => {
		if (!errorHandlingConfig.reportUrl) {
			message.warning('Report URL is not configured');
			return;
		}

		const payload = buildReportPayload();
		try {
			const body = JSON.stringify(payload);
			if (navigator.sendBeacon) {
				const ok = navigator.sendBeacon(errorHandlingConfig.reportUrl, new Blob([body], { type: 'application/json' }));
				if (!ok) throw new Error('sendBeacon failed');
			} else {
				await fetch(errorHandlingConfig.reportUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body,
				});
			}
			message.success('Bug report sent');
		} catch {
			message.error('Failed to send bug report');
		}
	};

	useEffect(() => {
		if (errorHandlingConfig.enabled && errorHandlingConfig.redirectDelayMs > 0) {
			setRemaining(totalSeconds);
			const tick = window.setInterval(() => {
				setRemaining((prev) => (prev > 1 ? prev - 1 : 1));
			}, 1000);
			const timer = window.setTimeout(() => {
				window.location.assign(errorHandlingConfig.redirectPath);
			}, errorHandlingConfig.redirectDelayMs);
			return () => {
				window.clearTimeout(timer);
				window.clearInterval(tick);
			};
		}
		return undefined;
	}, [totalSeconds]);

	if (!errorHandlingConfig.showPopup) return null;

	return (
		<Modal open centered closable={false} footer={null} width={520}>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<div>
					<Typography.Title level={4} style={{ marginBottom: 6 }}>
						{errorHandlingConfig.title}
					</Typography.Title>
					<Typography.Text type="secondary">{errorMessage}</Typography.Text>
					<div style={{ marginTop: 6 }}>
						<Typography.Text type="secondary">Error ID: {errorId}</Typography.Text>
					</div>
				</div>

				<div>
					<Progress percent={Math.round(((totalSeconds - remaining) / totalSeconds) * 100)} />
					<Typography.Text type="secondary">
						Redirecting in {remaining} seconds…
					</Typography.Text>
				</div>

				<Collapse
					activeKey={detailsOpen ? ['1'] : []}
					onChange={() => setDetailsOpen((v) => !v)}
					items={[
						{
							key: '1',
							label: 'Error details',
							children: (
								<pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
{errorStack || 'No stack available.'}
								</pre>
							),
						},
					]}
				/>

				<Space>
					<Button type="primary" onClick={() => window.location.assign(errorHandlingConfig.redirectPath)}>
						Go now
					</Button>
					<Button
						onClick={async () => {
							const payload = `Error ID: ${errorId}\nMessage: ${errorMessage}\n\n${errorStack || ''}`;
							try {
								await navigator.clipboard.writeText(payload);
								message.success('Error details copied');
							} catch {
								message.error('Copy failed');
							}
						}}
					>
						Copy details
					</Button>
					<Button type="default" onClick={sendReport}>
						Report issue
					</Button>
				</Space>
			</Space>
		</Modal>
	);
}
