import { Badge, Button, Drawer, List, Space, Tag, Typography, theme } from 'antd';

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  read: boolean;
  type?: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

const typeColor: Record<NonNullable<AppNotification['type']>, string> = {
  info: 'blue',
  warning: 'gold',
  success: 'green',
  error: 'red',
};

export default function NotificationPanel({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
}: NotificationPanelProps) {
  const { token } = theme.useToken();

  return (
    <Drawer
      title="Notifications"
      placement="right"
      width={380}
      onClose={onClose}
      open={open}
      extra={
        <Button size="small" onClick={onMarkAllRead} disabled={notifications.every((n) => n.read)}>
          Mark all read
        </Button>
      }
    >
      <List
        dataSource={notifications}
        locale={{ emptyText: 'No notifications yet.' }}
        renderItem={(item) => (
          <List.Item
            style={{
              background: item.read ? 'transparent' : token.colorFillQuaternary,
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              cursor: 'pointer',
            }}
            onClick={() => onMarkRead(item.id)}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Typography.Text strong={!item.read}>{item.title}</Typography.Text>
                  {!item.read && <Tag color="processing">New</Tag>}
                  {item.type && <Tag color={typeColor[item.type]}>{item.type.toUpperCase()}</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={2}>
                  {item.description && <Typography.Text>{item.description}</Typography.Text>}
                  <Typography.Text type="secondary">
                    {new Date(item.createdAt).toLocaleString()}
                  </Typography.Text>
                </Space>
              }
            />
            {!item.read && <Badge status="processing" />}
          </List.Item>
        )}
      />
    </Drawer>
  );
}
