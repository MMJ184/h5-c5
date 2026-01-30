import { MessageOutlined } from '@ant-design/icons';
import { Button, Drawer, theme } from 'antd';
import React, { useState } from 'react';
import { useChatFlags } from '../hooks/useChatFlags';
import { ChatModule } from './ChatModule';

export const ChatFloatingLauncher = () => {
  const flags = useChatFlags();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);

  if (!flags.chat.enabled) {
    return null;
  }

  return (
    <>
      <Button
        type="primary"
        icon={<MessageOutlined />}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 1000,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        Chat
      </Button>
      <Drawer
        title="Team Chat"
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        width={720}
        destroyOnClose={false}
        styles={{ body: { padding: 0, height: '100%' } }}
      >
        <div style={{ height: '100%' }}>
          <ChatModule />
        </div>
      </Drawer>
    </>
  );
};
