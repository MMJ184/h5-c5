import { MessageOutlined, RobotOutlined, SearchOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Input, List, Tag, Typography, theme } from 'antd';
import { Conversation } from '../types';
import { formatDateTime } from '../utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  searchValue: string;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
}

export const ConversationList = ({
  conversations,
  selectedId,
  searchValue,
  onSearch,
  onSelect,
}: ConversationListProps) => {
  const { token } = theme.useToken();

  const typeIcon = (type: Conversation['type']) => {
    switch (type) {
      case 'channel':
        return <TeamOutlined />;
      case 'bot':
        return <RobotOutlined />;
      case 'agent':
        return <UserOutlined />;
      default:
        return <MessageOutlined />;
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 12px 8px' }}>
        <Input
          value={searchValue}
          placeholder="Search conversations"
          prefix={<SearchOutlined />}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <List
          dataSource={conversations}
          renderItem={(item) => {
            const selected = item.id === selectedId;
            return (
              <List.Item
                onClick={() => onSelect(item.id)}
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  background: selected ? token.colorPrimaryBg : undefined,
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={typeIcon(item.type)} />}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Typography.Text strong>{item.title}</Typography.Text>
                      <Tag icon={typeIcon(item.type)}>{item.type}</Tag>
                    </div>
                  }
                  description={
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <Typography.Text ellipsis style={{ maxWidth: 160 }}>
                        {item.lastMessage?.content ?? 'No messages yet'}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(item.updatedAt)}
                      </Typography.Text>
                    </div>
                  }
                />
                {item.unreadCount > 0 && <Tag color="red">{item.unreadCount}</Tag>}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};
