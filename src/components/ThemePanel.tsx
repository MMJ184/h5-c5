import React, { useState } from 'react';
import {
  Drawer,
  Space,
  Row,
  Col,
  Button,
  Radio,
  Input,
  Divider,
  Tooltip,
  Typography,
  theme as antdTheme,
} from 'antd';
import {
  BgColorsOutlined,
  SkinOutlined,
  HighlightOutlined,
  FireOutlined,
  ExperimentOutlined, BulbOutlined,
} from '@ant-design/icons';
import { useTheme } from '../theme/ThemeProvider';

const { Title, Text } = Typography;

type Props = {
  open: boolean;
  onClose: () => void;
};

const PRESETS: { key: string; label: string; color: string; icon: React.ReactNode }[] = [
  { key: 'blue', label: 'Blue', color: '#1677ff', icon: <HighlightOutlined /> },
  { key: 'green', label: 'Green', color: '#1DA57A', icon: <SkinOutlined /> },
  { key: 'cyan', label: 'Cyan', color: '#13c2c2', icon: <BgColorsOutlined /> },
  { key: 'purple', label: 'Purple', color: '#722ed1', icon: <ExperimentOutlined /> },
  { key: 'volcano', label: 'Volcano', color: '#fa541c', icon: <FireOutlined /> },
];

export default function ThemePanel({ open, onClose }: Props) {
  const { token } = antdTheme.useToken();
  const { dark, toggleDark, primary, setPrimary } = useTheme();

  const [customHex, setCustomHex] = useState<string>(primary);

  function applyPreset(color: string) {
    setPrimary(color);
    setCustomHex(color);
  }

  function applyCustom() {
    // basic hex validation (accepts #rgb, #rrggbb)
    const hex = (customHex || '').trim();
    if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex)) {
      // simple inline feedback — you can replace with form validation if desired
      // use antd message? prefer no side effects here — keep UX simple
      setCustomHex(primary); // revert to current primary
      return;
    }
    setPrimary(hex);
  }

  return (
    <Drawer
      title={
        <Space align="center">
          <BgColorsOutlined />
          <span>Theme settings</span>
        </Space>
      }
      placement="right"
      open={open}
      onClose={onClose}

      // Use `size` instead of `width`. You can pass a number (pixels) or a preset.
      size={360}

      // All per-area styling goes into `styles`
      styles={{
        header: { padding: 16 },          // replaces headerStyle
        body: { padding: 16 },            // replaces bodyStyle
        footer: { padding: 16 },          // optional
        mask: undefined,                  // optional mask styling
      }}

      // Use rootStyle for the outer wrapper if you need to style the very outer element
      // rootStyle={{ /* outer wrapper styles here */ }}
    >
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Mode
              </Title>
              <Text type="secondary">Switch between light and dark mode</Text>
            </Col>
            <Col>
              <Radio.Group
                value={dark ? 'dark' : 'light'}
                onChange={(e) => {
                  if (e.target.value === 'dark' && !dark) toggleDark();
                  if (e.target.value === 'light' && dark) toggleDark();
                }}
              >
                <Radio.Button value="light">
                  <BulbOutlined /> Light
                </Radio.Button>
                <Radio.Button value="dark">
                  <BgColorsOutlined /> Dark
                </Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
        </div>

        <Divider />

        <div>
          <Title level={5} style={{ marginBottom: 8 }}>
            Primary color
          </Title>
          <Text type="secondary">Choose a preset or enter a custom hex</Text>

          <div style={{ marginTop: 12 }}>
            <Row gutter={[12, 12]}>
              {PRESETS.map((p) => (
                <Col key={p.key}>
                  <Tooltip title={p.label}>
                    <Button
                      onClick={() => applyPreset(p.color)}
                      type={p.color === primary ? 'primary' : 'default'}
                      shape="round"
                      icon={p.icon}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderColor: p.color === primary ? undefined : '#f0f0f0',
                      }}
                    >
                      <div
                        aria-hidden
                        style={{
                          width: 12,
                          height: 12,
                          background: p.color,
                          borderRadius: 4,
                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
                        }}
                      />
                      <span style={{ fontSize: 12 }}>{p.label}</span>
                    </Button>
                  </Tooltip>
                </Col>
              ))}
            </Row>
          </div>

          <div style={{ marginTop: 12 }}>
            <Row gutter={8} align="middle">
              <Col flex="auto">
                <Input
                  placeholder="#1677ff"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  onPressEnter={applyCustom}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Enter hex and press Enter
                </Text>
              </Col>
              <Col>
                <Button onClick={applyCustom}>Apply</Button>
              </Col>
            </Row>
          </div>

          <div style={{ marginTop: 12 }}>
            <Text type="secondary">Current</Text>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: primary,
                  borderRadius: 6,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              />
              <Text>{primary}</Text>
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <Title level={5} style={{ marginBottom: 8 }}>
            Accessibility & UI
          </Title>
          <Text type="secondary">Small toggles for common preferences</Text>

          <div style={{ marginTop: 12 }}>
            <Space orientation="vertical" size="small">
              {/* Example toggle placeholders — wire up to theme provider if available */}
              <Row justify="space-between" align="middle">
                <Col>
                  <Text>Compact spacing</Text>
                </Col>
                <Col>
                  <Button
                    size="small"
                    onClick={() => {
                      // if you provide API in useTheme to toggle compact, call it here
                      // For now this is a visual placeholder — implement in ThemeProvider as needed
                    }}
                  >
                    Toggle
                  </Button>
                </Col>
              </Row>

              <Row justify="space-between" align="middle">
                <Col>
                  <Text>Rounded corners</Text>
                </Col>
                <Col>
                  <Button
                    size="small"
                    onClick={() => {
                      // placeholder for future toggle
                    }}
                  >
                    Toggle
                  </Button>
                </Col>
              </Row>
            </Space>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </Space>
    </Drawer>
  );
}
