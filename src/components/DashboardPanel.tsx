// src/components/DashboardPanel.tsx
import type { JSX } from 'react';

import { Button, Card, Space, Typography, theme as antdTheme } from 'antd';

const { useToken } = antdTheme;
const { Title } = Typography;

export default function DashboardPanel(): JSX.Element {
  const { token } = useToken();

  return (
    <Card
      bordered={false}
      style={{
        background: token.colorBgContainer, // follows dark/light automatically
        borderRadius: token.borderRadius,
        padding: 24,
        minHeight: 360,
      }}
    >
      <Title level={4} style={{ color: token.colorText }}>
        Welcome
      </Title>

      <p style={{ color: token.colorTextSecondary }}>
        This panel uses Ant Design tokens (useToken) so background, text and controls follow theme
        (dark/light) and primary color.
      </p>

      <Space style={{ marginTop: 16 }}>
        <Button type="primary">Primary Action</Button>
        <Button>Secondary</Button>
      </Space>
    </Card>
  );
}
