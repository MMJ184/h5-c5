import { MessageOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Spin, Tabs, Typography, theme } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useChatFlags } from '../hooks/useChatFlags';
import { useConversations } from '../hooks/useConversations';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useMessages } from '../hooks/useMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { useMarkRead } from '../hooks/useMarkRead';
import { ChatHeader } from './ChatHeader';
import { ConversationDrawer } from './ConversationDrawer';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { Conversation } from '../types';

const { Sider, Content } = Layout;

type ChatMode = 'human' | 'bot' | 'agent';

const modeTabs = (flags: ReturnType<typeof useChatFlags>): { key: ChatMode; label: string }[] => {
  const tabs: { key: ChatMode; label: string }[] = [
    { key: 'human', label: 'Human', icon: <MessageOutlined /> },
  ];
  if (flags.chat.bot.enabled) tabs.push({ key: 'bot', label: 'Bot', icon: <RobotOutlined /> });
  if (flags.chat.agent.enabled) tabs.push({ key: 'agent', label: 'Agent', icon: <UserOutlined /> });
  return tabs;
};

const filterByMode = (conversation: Conversation, mode: ChatMode) => {
  if (mode === 'bot') return conversation.type === 'bot';
  if (mode === 'agent') return conversation.type === 'agent';
  return conversation.type === 'dm' || conversation.type === 'channel';
};

export const ChatModule = () => {
  const flags = useChatFlags();
  const { token } = theme.useToken();
  const [mode, setMode] = useState<ChatMode>('human');
  const [search, setSearch] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: conversations, isLoading: loadingConversations } = useConversations();

  useEffect(() => {
    if (mode === 'bot' && !flags.chat.bot.enabled) setMode('human');
    if (mode === 'agent' && !flags.chat.agent.enabled) setMode('human');
  }, [flags.chat.agent.enabled, flags.chat.bot.enabled, mode]);

  const filteredConversations = useMemo(() => {
    const list = (conversations ?? []).filter((conversation) => filterByMode(conversation, mode));
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter((conversation) => conversation.title.toLowerCase().includes(term));
  }, [conversations, mode, search]);

  useEffect(() => {
    if (!selectedConversationId && filteredConversations.length > 0) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId]);

  const activeConversation = filteredConversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const messagesQuery = useMessages(activeConversation?.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();

  useEffect(() => {
    if (activeConversation?.id && activeConversation.unreadCount > 0) {
      markRead.mutate({ conversationId: activeConversation.id });
    }
  }, [activeConversation?.id, activeConversation?.unreadCount, markRead]);

  const messages = useMemo(() => {
    const pages = messagesQuery.data?.pages ?? [];
    return pages.flatMap((page) => page.items);
  }, [messagesQuery.data?.pages]);

  if (!flags.chat.enabled) {
    return <Typography.Text>Chat module disabled.</Typography.Text>;
  }

  return (
    <Layout style={{ height: '100%', minHeight: 600, border: `1px solid ${token.colorBorder}` }}>
      <Sider
        width={320}
        style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorder}` }}
      >
        <div style={{ padding: 12 }}>
          <Tabs
            items={modeTabs(flags)}
            activeKey={mode}
            onChange={(key) => setMode(key as ChatMode)}
          />
        </div>
        {loadingConversations ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
            <Spin />
          </div>
        ) : (
          <ConversationList
            conversations={filteredConversations}
            selectedId={selectedConversationId}
            searchValue={search}
            onSearch={setSearch}
            onSelect={setSelectedConversationId}
          />
        )}
      </Sider>
      <Content
        style={{ display: 'flex', flexDirection: 'column', background: token.colorBgContainer }}
      >
        {activeConversation ? (
          <>
            <ChatHeader
              conversation={activeConversation}
              currentUserId={currentUser?.id}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
            <MessageList
              messages={messages}
              participants={activeConversation.participants}
              currentUserId={currentUser?.id}
              hasNextPage={messagesQuery.hasNextPage}
              isFetchingNextPage={messagesQuery.isFetchingNextPage}
              onLoadMore={() => messagesQuery.fetchNextPage()}
              loading={messagesQuery.isLoading}
            />
            <Composer
              mode={activeConversation.type}
              onSend={(content) =>
                sendMessage.mutate({ conversationId: activeConversation.id, content })
              }
              sending={sendMessage.isPending}
            />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: token.colorTextSecondary,
            }}
          >
            Select a conversation
          </div>
        )}
      </Content>
      <ConversationDrawer
        open={drawerOpen}
        conversation={activeConversation}
        onClose={() => setDrawerOpen(false)}
      />
    </Layout>
  );
};
