import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, theme } from 'antd';
import React, { useState } from 'react';
import { ConversationType } from '../types';

interface ComposerProps {
  mode: ConversationType;
  onSend: (content: string) => void;
  sending?: boolean;
}

export const Composer = ({ mode, onSend, sending }: ComposerProps) => {
  const { token } = theme.useToken();
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  const addQuickText = (text: string) => {
    setValue((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: `1px solid ${token.colorBorder}`,
        background: token.colorBgContainer,
      }}
    >
      <Input.TextArea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={3}
        placeholder="Write a message"
        onPressEnter={(event) => {
          if (event.shiftKey) return;
          event.preventDefault();
          submit();
        }}
      />
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {mode === 'bot' && (
            <Button
              size="small"
              icon={<RobotOutlined />}
              onClick={() => addQuickText('Ask Bot:')}
            >
              Ask Bot
            </Button>
          )}
          {mode === 'agent' && (
            <Button
              size="small"
              icon={<UserOutlined />}
              onClick={() => addQuickText('Ask Agent:')}
            >
              Ask Agent
            </Button>
          )}
        </div>
        <Button type="primary" icon={<SendOutlined />} onClick={submit} loading={sending}>
          Send
        </Button>
      </div>
    </div>
  );
};
