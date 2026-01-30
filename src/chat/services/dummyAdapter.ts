import { dummyStore, buildConversation, ensureConversationSummaries } from '../dummy/data';
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

const PAGE_SIZE = 20;

const listMessagesPage = (conversationId: string, cursor?: string): MessagePage => {
  const all = dummyStore.messagesByConversation[conversationId] ?? [];
  const start = cursor ? Math.max(0, Number(cursor)) : Math.max(0, all.length - PAGE_SIZE);
  const end = Math.min(all.length, start + PAGE_SIZE);
  const items = all.slice(start, end);
  const nextCursor = start > 0 ? String(Math.max(0, start - PAGE_SIZE)) : undefined;
  return { items, nextCursor };
};

export const createDummyAdapter = (): ChatService => ({
  async getCurrentUser(): Promise<User> {
    const user = dummyStore.users.find((item) => item.id === dummyStore.currentUserId);
    if (!user) throw new Error('Current user not found');
    return { ...user };
  },
  async listConversations(): Promise<Conversation[]> {
    ensureConversationSummaries();
    return [...dummyStore.conversations]
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .map((item) => ({ ...item, participants: [...item.participants] }));
  },
  async listMessages(conversationId: string, cursor?: string): Promise<MessagePage> {
    const page = listMessagesPage(conversationId, cursor);
    return {
      items: page.items.map((item) => ({ ...item })),
      nextCursor: page.nextCursor,
    };
  },
  async sendMessage(input: SendMessageInput): Promise<Message> {
    const newMessage: Message = {
      id: dummyStore.nextMessageId(),
      clientId: input.clientId,
      conversationId: input.conversationId,
      senderId: dummyStore.currentUserId,
      content: input.content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const list = dummyStore.messagesByConversation[input.conversationId] ?? [];
    list.push(newMessage);
    dummyStore.messagesByConversation[input.conversationId] = list;

    const conversation = dummyStore.conversations.find((item) => item.id === input.conversationId);
    if (conversation) {
      buildConversation(conversation, newMessage);
    }

    return { ...newMessage };
  },
  async markRead(input: MarkReadInput): Promise<void> {
    const conversation = dummyStore.conversations.find((item) => item.id === input.conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
  },
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const id = dummyStore.nextConversationId();
    const members = input.memberIds ?? [];
    const participants = [dummyStore.currentUserId, ...members]
      .map((memberId) => dummyStore.users.find((user) => user.id === memberId))
      .filter(Boolean)
      .map((user) => ({
        id: user!.id,
        name: user!.name,
        avatarUrl: user!.avatarUrl,
        isOnline: user!.isOnline,
        role: 'member' as const,
      }));

    const conversation: Conversation = {
      id,
      type: input.type,
      title: input.title ?? (input.type === 'channel' ? '#new-channel' : 'New conversation'),
      participants,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    dummyStore.conversations.unshift(conversation);
    dummyStore.messagesByConversation[id] = [];
    return { ...conversation, participants: [...conversation.participants] };
  },
});
