import {
  ChatService,
  Conversation,
  CreateConversationInput,
  MarkReadInput,
  Message,
  MessagePage,
  SendMessageInput,
  User,
} from '../types';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new ApiError(`API error: ${response.status}`, response.status);
  }
  return (await response.json()) as T;
};

const mapUser = (raw: any): User => ({
  id: String(raw.id),
  name: String(raw.name),
  avatarUrl: raw.avatarUrl ?? raw.avatar_url,
  title: raw.title,
  isOnline: raw.isOnline ?? raw.is_online,
});

const mapMessage = (raw: any): Message => ({
  id: String(raw.id),
  clientId: raw.clientId ?? raw.client_id,
  conversationId: String(raw.conversationId ?? raw.conversation_id),
  senderId: String(raw.senderId ?? raw.sender_id),
  content: String(raw.content ?? ''),
  createdAt: String(raw.createdAt ?? raw.created_at),
  status: raw.status ?? 'sent',
});

const mapConversation = (raw: any): Conversation => ({
  id: String(raw.id),
  type: raw.type,
  title: raw.title,
  participants: (raw.participants ?? []).map((participant: any) => ({
    id: String(participant.id ?? participant.userId ?? participant.user_id),
    name: String(participant.name ?? ''),
    avatarUrl: participant.avatarUrl ?? participant.avatar_url,
    isOnline: participant.isOnline ?? participant.is_online,
    role: participant.role,
  })),
  unreadCount: Number(raw.unreadCount ?? raw.unread_count ?? 0),
  lastMessage: raw.lastMessage
    ? {
        id: String(raw.lastMessage.id ?? raw.last_message?.id ?? ''),
        senderId: String(raw.lastMessage.senderId ?? raw.last_message?.sender_id ?? ''),
        content: String(raw.lastMessage.content ?? raw.last_message?.content ?? ''),
        createdAt: String(raw.lastMessage.createdAt ?? raw.last_message?.created_at ?? ''),
      }
    : undefined,
  updatedAt: String(raw.updatedAt ?? raw.updated_at),
});

export const createApiAdapter = (baseUrl: string): ChatService => {
  const request = async <T>(path: string, options?: RequestInit) => {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
      ...options,
    });
    return handleResponse<T>(response);
  };

  return {
    async getCurrentUser(): Promise<User> {
      const data = await request<any>('/me');
      return mapUser(data);
    },
    async listConversations(): Promise<Conversation[]> {
      const data = await request<any[]>('/conversations');
      return data.map(mapConversation);
    },
    async listMessages(conversationId: string, cursor?: string): Promise<MessagePage> {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const data = await request<any>(`/conversations/${conversationId}/messages${query}`);
      return {
        items: (data.items ?? data.messages ?? []).map(mapMessage),
        nextCursor: data.nextCursor ?? data.next_cursor,
      };
    },
    async sendMessage(input: SendMessageInput): Promise<Message> {
      const data = await request<any>(`/conversations/${input.conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: input.content, clientId: input.clientId }),
      });
      return mapMessage(data);
    },
    async markRead(input: MarkReadInput): Promise<void> {
      await request(`/conversations/${input.conversationId}/read`, {
        method: 'POST',
        body: JSON.stringify({ messageId: input.messageId }),
      });
    },
    async createConversation(input: CreateConversationInput): Promise<Conversation> {
      const data = await request<any>('/conversations', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return mapConversation(data);
    },
  };
};
