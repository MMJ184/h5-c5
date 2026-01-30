import {
	BgColorsOutlined,
	SkinOutlined,
	HighlightOutlined,
	FireOutlined,
	ExperimentOutlined,
	BulbOutlined,
	ReloadOutlined,
	CheckOutlined,
	EditOutlined,
	MoonOutlined,
	SunOutlined,
} from '@ant-design/icons';
import {
	Drawer,
	Space,
	Row,
	Col,
	Button,
	Segmented,
	Input,
	Divider,
	Tooltip,
	Typography,
	Card,
	ColorPicker,
	theme as antdTheme,
	Tag,
	Switch,
	Slider,
} from 'antd';
import { useEffect, useState } from 'react';

import { useTheme } from '../app/providers/ThemeProvider';

const { Title, Text } = Typography;

interface Props {
	open: boolean;
	onClose: () => void;
}

const PRESETS = [
	{ key: 'blue', label: 'Blue', color: '#1677ff', icon: <HighlightOutlined /> },
	{ key: 'green', label: 'Green', color: '#1DA57A', icon: <SkinOutlined /> },
	{ key: 'cyan', label: 'Cyan', color: '#13c2c2', icon: <BgColorsOutlined /> },
	{ key: 'purple', label: 'Purple', color: '#722ed1', icon: <ExperimentOutlined /> },
	{ key: 'volcano', label: 'Volcano', color: '#fa541c', icon: <FireOutlined /> },
];

const DEFAULT_PRIMARY = '#1677ff';

export default function ThemePanel({ open, onClose }: Props) {
	const { token } = antdTheme.useToken();
	const {
		dark,
		toggleDark,
		primary,
		setPrimary,
		compact,
		toggleCompact,
		fontScale,
		setFontScale,
		highContrast,
		toggleHighContrast,
	} = useTheme();

	// Local (preview) state
	const [draftPrimary, setDraftPrimary] = useState(primary);

	useEffect(() => {
		if (open) {
			setDraftPrimary(primary);
		}
	}, [open, primary]);

	function applyTheme() {
		if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(draftPrimary)) {
			setPrimary(draftPrimary);
			onClose();
		}
	}

	function resetTheme() {
		setDraftPrimary(DEFAULT_PRIMARY);
		setPrimary(DEFAULT_PRIMARY);
	}

	return (
		<Drawer
			title={
				<Space>
					<BgColorsOutlined />
					<span>Theme Studio</span>
				</Space>
			}
			placement="right"
			open={open}
			onClose={onClose}
			size={380}
			styles={{
				body: { padding: 16 },
				footer: { padding: 16 },
			}}
			footer={
				<Row justify="space-between" align="middle">
					<Button icon={<ReloadOutlined />} danger onClick={resetTheme}>
						Reset
					</Button>

					<Space>
						<Button icon={<EditOutlined />} onClick={onClose}>
							Cancel
						</Button>
						<Button type="primary" icon={<CheckOutlined />} onClick={applyTheme}>
							Apply
						</Button>
					</Space>
				</Row>
			}
		>
			<Space orientation="vertical" size="large" style={{ width: '100%' }}>
				{/* ================= MODE ================= */}
				<Card size="small" style={{ borderRadius: 12 }}>
					<Row justify="space-between" align="middle">
						<Col>
							<Title level={5} style={{ margin: 0 }}>
								Appearance
							</Title>
							<Text type="secondary">Light or dark mode</Text>
						</Col>
						<Col>
							<Segmented
								value={dark ? 'dark' : 'light'}
								onChange={(value) => {
									if (value === 'dark' && !dark) toggleDark();
									if (value === 'light' && dark) toggleDark();
								}}
								options={[
									{ label: 'Light', value: 'light', icon: <SunOutlined /> },
									{ label: 'Dark', value: 'dark', icon: <MoonOutlined /> },
								]}
							/>
						</Col>
					</Row>
				</Card>

				{/* ================= PRIMARY COLOR ================= */}
				<Card size="small" style={{ borderRadius: 12 }}>
					<Title level={5} style={{ marginBottom: 4 }}>
						Primary Color
					</Title>
					<Text type="secondary">Choose a preset or customize your brand color</Text>

					<Divider />

					{/* Presets */}
					<Row gutter={[12, 12]}>
						{PRESETS.map((p) => {
							const active = draftPrimary === p.color;

							return (
								<Col span={12} key={p.key}>
									<Tooltip title={p.label}>
										<Card
											hoverable
											onClick={() => setDraftPrimary(p.color)}
											styles={{
												body: {
													padding: 12,
													display: 'flex',
													alignItems: 'center',
													gap: 12,
													border: active ? `2px solid ${p.color}` : `1px solid ${token.colorBorder}`,
													borderRadius: 10,
												},
											}}
										>
											<div
												style={{
													width: 32,
													height: 32,
													borderRadius: 8,
													background: p.color,
													boxShadow: `0 6px 16px ${p.color}40`,
												}}
											/>
											<div>
												<Text strong>{p.label}</Text>
												{active && (
													<div>
														<Tag color="success" style={{ marginTop: 4 }}>
															Active
														</Tag>
													</div>
												)}
											</div>
										</Card>
									</Tooltip>
								</Col>
							);
						})}
					</Row>

					<Divider />

					{/* Custom Picker */}
					<Space direction="vertical" style={{ width: '100%' }}>
						<ColorPicker
							value={draftPrimary}
							onChange={(color) => setDraftPrimary(color.toHexString())}
							showText
						/>

						<Input
							value={draftPrimary}
							onChange={(e) => setDraftPrimary(e.target.value)}
							placeholder="#1677ff"
							prefix={<BulbOutlined />}
						/>
					</Space>
				</Card>

				{/* ================= LIVE PREVIEW ================= */}
				<Card size="small" style={{ borderRadius: 12 }}>
					<Title level={5} style={{ marginBottom: 8 }}>
						Preview
					</Title>

					<Space direction="vertical" style={{ width: '100%' }}>
						<Button type="primary" block style={{ background: draftPrimary }}>
							Primary Button
						</Button>

						<Button block>Default Button</Button>

						<div
							style={{
								padding: 12,
								borderRadius: 8,
								background: token.colorBgContainer,
								border: `1px solid ${token.colorBorder}`,
							}}
						>
							<Text>This is how text and surfaces will look with the selected theme color.</Text>
						</div>
					</Space>
				</Card>

				{/* ================= ACCESSIBILITY PLACEHOLDER ================= */}
				<Card size="small" style={{ borderRadius: 12 }}>
					<Title level={5} style={{ marginBottom: 8 }}>
						Accessibility & UI
					</Title>
					<Text type="secondary">Customize density, typography, and contrast for better readability.</Text>

					<Divider />

					<Space direction="vertical" style={{ width: '100%' }} size="middle">
						<Row justify="space-between" align="middle">
							<Text>Compact spacing</Text>
							<Switch checked={compact} onChange={toggleCompact} />
						</Row>

						<div>
							<Row justify="space-between" align="middle">
								<Text>Font scale</Text>
								<Tag>{fontScale.toFixed(2)}x</Tag>
							</Row>
							<Slider
								min={0.85}
								max={1.25}
								step={0.05}
								value={fontScale}
								onChange={(value) => setFontScale(Number(value))}
							/>
						</div>

						<Row justify="space-between" align="middle">
							<Text>High contrast</Text>
							<Switch checked={highContrast} onChange={toggleHighContrast} />
						</Row>
					</Space>
				</Card>
			</Space>
		</Drawer>
	);
}
