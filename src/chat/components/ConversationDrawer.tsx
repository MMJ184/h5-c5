import { Avatar, Drawer, List, Tag, Typography } from 'antd';
import { Conversation } from '../types';

interface ConversationDrawerProps {
  open: boolean;
  conversation?: Conversation;
  onClose: () => void;
}

export const ConversationDrawer = ({ open, conversation, onClose }: ConversationDrawerProps) => {
  return (
    <Drawer title="Conversation Info" placement="right" width={320} onClose={onClose} open={open}>
      {conversation ? (
        <div>
          <Typography.Title level={5}>{conversation.title}</Typography.Title>
          <div style={{ marginBottom: 12 }}>
            <Tag>{conversation.type}</Tag>
            <Tag>{conversation.participants.length} participants</Tag>
          </div>
          <Typography.Text type="secondary">Participants</Typography.Text>
          <List
            dataSource={conversation.participants}
            style={{ marginTop: 8 }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{item.name.charAt(0).toUpperCase()}</Avatar>}
                  title={item.name}
                  description={item.role ? item.role.toUpperCase() : undefined}
                />
                {item.isOnline && <Tag color="green">Online</Tag>}
              </List.Item>
            )}
          />
        </div>
      ) : (
        <Typography.Text>No conversation selected.</Typography.Text>
      )}
    </Drawer>
  );
};
