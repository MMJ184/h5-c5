import { ArrowUpOutlined } from '@ant-design/icons';
import { Avatar, Button, Spin, Typography, theme } from 'antd';
import { Message, UserSummary } from '../types';
import { formatDateTime } from '../utils';
import React, { useEffect, useMemo, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  participants: UserSummary[];
  currentUserId?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}

export const MessageList = ({
  messages,
  participants,
  currentUserId,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  loading,
}: MessageListProps) => {
  const { token } = theme.useToken();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const participantMap = useMemo(() => {
    return new Map(participants.map((item) => [item.id, item]));
  }, [participants]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages.length]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        background: token.colorBgLayout,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {hasNextPage && (
        <Button
          icon={<ArrowUpOutlined />}
          onClick={onLoadMore}
          loading={isFetchingNextPage}
          style={{ alignSelf: 'center' }}
        >
          Load older messages
        </Button>
      )}
      {messages.map((message) => {
        const isMe = message.senderId === currentUserId;
        const sender = participantMap.get(message.senderId);
        return (
          <div
            key={message.id}
            style={{
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              flexDirection: isMe ? 'row-reverse' : 'row',
            }}
          >
            <Avatar size={28}>
              {sender?.name?.charAt(0).toUpperCase() ?? '?'}
            </Avatar>
            <div
              style={{
                background: isMe ? token.colorPrimaryBg : token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 12,
                padding: '8px 12px',
                boxShadow: token.boxShadowSecondary,
              }}
            >
              {!isMe && (
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  {sender?.name ?? 'Unknown'}
                </Typography.Text>
              )}
              <Typography.Text>{message.content}</Typography.Text>
              <div style={{ marginTop: 6, textAlign: 'right' }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDateTime(message.createdAt)}
                  {message.status === 'pending' ? ' · Sending' : ''}
                </Typography.Text>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
