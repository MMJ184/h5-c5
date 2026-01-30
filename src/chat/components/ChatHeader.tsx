import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Tag, Typography, theme } from 'antd';
import { Conversation, UserSummary } from '../types';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId?: string;
  onOpenDrawer: () => void;
}

const getOnlineStatus = (participants: UserSummary[], currentUserId?: string) => {
  const other = participants.find((item) => item.id !== currentUserId);
  if (!other) return undefined;
  return other.isOnline;
};

export const ChatHeader = ({ conversation, currentUserId, onOpenDrawer }: ChatHeaderProps) => {
  const { token } = theme.useToken();
  const online = getOnlineStatus(conversation.participants, currentUserId);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${token.colorBorder}`,
        background: token.colorBgContainer,
      }}
    >
      <div>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {conversation.title}
        </Typography.Title>
        <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Tag color="blue">{conversation.type.toUpperCase()}</Tag>
          {online !== undefined && (
            <Tag color={online ? 'green' : 'default'}>{online ? 'Online' : 'Offline'}</Tag>
          )}
        </div>
      </div>
      <Button icon={<InfoCircleOutlined />} onClick={onOpenDrawer}>
        Conversation Info
      </Button>
    </div>
  );
};
