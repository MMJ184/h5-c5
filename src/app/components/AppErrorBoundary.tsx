import { Button, Modal, Typography } from 'antd';
import React from 'react';

import { errorHandlingConfig } from '../config/errorHandling';

interface State {
	hasError: boolean;
	message?: string;
}

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
	state: State = { hasError: false, message: undefined };
	private redirectTimer?: number;

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		// eslint-disable-next-line no-console
		console.error('App crash:', error);
		this.setState({ message: error?.message || errorHandlingConfig.message });
		try {
			sessionStorage.setItem(
				'lastError',
				JSON.stringify({
					message: error?.message,
					stack: error?.stack,
					time: new Date().toISOString(),
				}),
			);
		} catch {}

		if (errorHandlingConfig.enabled && errorHandlingConfig.redirectDelayMs > 0) {
			this.redirectTimer = window.setTimeout(() => {
				window.location.assign(errorHandlingConfig.redirectPath);
			}, errorHandlingConfig.redirectDelayMs);
		}
	}

	componentDidMount() {
		window.addEventListener('error', this.handleWindowError);
		window.addEventListener('unhandledrejection', this.handlePromiseRejection);
	}

	componentWillUnmount() {
		if (this.redirectTimer) window.clearTimeout(this.redirectTimer);
		window.removeEventListener('error', this.handleWindowError);
		window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
	}

	private handleWindowError = (event: ErrorEvent) => {
		if (this.state.hasError) return;
		const message = event?.error?.message || event?.message || errorHandlingConfig.message;
		this.setState({ hasError: true, message });
		try {
			sessionStorage.setItem(
				'lastError',
				JSON.stringify({
					message,
					stack: event?.error?.stack,
					time: new Date().toISOString(),
				}),
			);
		} catch {}
		if (errorHandlingConfig.enabled && errorHandlingConfig.redirectDelayMs > 0) {
			this.redirectTimer = window.setTimeout(() => {
				window.location.assign(errorHandlingConfig.redirectPath);
			}, errorHandlingConfig.redirectDelayMs);
		}
	};

	private handlePromiseRejection = (event: PromiseRejectionEvent) => {
		if (this.state.hasError) return;
		const message =
			(event?.reason && (event.reason.message || String(event.reason))) || errorHandlingConfig.message;
		this.setState({ hasError: true, message });
		try {
			sessionStorage.setItem(
				'lastError',
				JSON.stringify({
					message,
					stack: event?.reason?.stack,
					time: new Date().toISOString(),
				}),
			);
		} catch {}
		if (errorHandlingConfig.enabled && errorHandlingConfig.redirectDelayMs > 0) {
			this.redirectTimer = window.setTimeout(() => {
				window.location.assign(errorHandlingConfig.redirectPath);
			}, errorHandlingConfig.redirectDelayMs);
		}
	};

	render() {
		if (!this.state.hasError) return this.props.children;

		const seconds = Math.ceil(errorHandlingConfig.redirectDelayMs / 1000);
		const message = this.state.message || errorHandlingConfig.message;

		if (errorHandlingConfig.showPopup) {
			return (
				<Modal open centered closable={false} footer={null}>
					<Typography.Title level={4}>{errorHandlingConfig.title}</Typography.Title>
					<Typography.Text type="secondary">{message}</Typography.Text>
					<div style={{ marginTop: 8 }}>
						<Typography.Text type="secondary">
							Redirecting in {seconds} seconds…
						</Typography.Text>
					</div>
					<div style={{ marginTop: 16 }}>
						<Button type="primary" onClick={() => window.location.assign(errorHandlingConfig.redirectPath)}>
							Go now
						</Button>
					</div>
				</Modal>
			);
		}

		return (
			<div style={{ padding: 24 }}>
				<Typography.Title level={3}>{errorHandlingConfig.title}</Typography.Title>
				<Typography.Text type="secondary">{message}</Typography.Text>
			</div>
		);
	}
}
