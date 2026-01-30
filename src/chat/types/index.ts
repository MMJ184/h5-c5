export type ConversationType = 'dm' | 'channel' | 'bot' | 'agent';

export type MessageStatus = 'sent' | 'pending' | 'failed';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  title?: string;
  isOnline?: boolean;
}

export interface UserSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  role?: 'member' | 'owner';
}

export interface Message {
  id: string;
  clientId?: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  status: MessageStatus;
}

export interface MessageSummary {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  participants: UserSummary[];
  unreadCount: number;
  lastMessage?: MessageSummary;
  updatedAt: string;
}

export interface MessagePage {
  items: Message[];
  nextCursor?: string;
}

export interface CreateConversationInput {
  type: ConversationType;
  memberIds?: string[];
  channelId?: string;
  title?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  clientId?: string;
}

export interface MarkReadInput {
  conversationId: string;
  messageId?: string;
}

export interface ChatService {
  getCurrentUser: () => Promise<User>;
  listConversations: () => Promise<Conversation[]>;
  listMessages: (conversationId: string, cursor?: string) => Promise<MessagePage>;
  sendMessage: (input: SendMessageInput) => Promise<Message>;
  markRead: (input: MarkReadInput) => Promise<void>;
  createConversation: (input: CreateConversationInput) => Promise<Conversation>;
}

export interface ChatFeatureFlags {
  chat: {
    enabled: boolean;
    bot: { enabled: boolean };
    agent: { enabled: boolean };
  };
}

export interface ChatServiceConfig {
  apiEnabled: boolean;
  baseUrl: string;
  flags: ChatFeatureFlags;
}
