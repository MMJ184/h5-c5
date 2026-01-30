import { message } from 'antd';
import { createApiAdapter, ApiError } from './apiAdapter';
import { getChatConfig } from './config';
import { createDummyAdapter } from './dummyAdapter';
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

const isNetworkError = (error: unknown) => {
  return error instanceof TypeError;
};

const isAuthError = (error: unknown) => {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
};

const shouldFallback = (error: unknown) => {
  if (isNetworkError(error)) return true;
  if (error instanceof ApiError) {
    if (error.status === 404) return true;
    if (typeof error.status === 'number' && error.status >= 500) return true;
  }
  return false;
};

const notifyError = (error: unknown) => {
  if (isAuthError(error)) {
    message.error('Chat API authentication error. Please sign in again.');
    return;
  }
  if (error instanceof ApiError) {
    message.error(`Chat API error (${error.status}).`);
    return;
  }
  message.error('Chat service unavailable.');
};

export const createChatService = (): ChatService => {
  const config = getChatConfig();
  const api = createApiAdapter(config.baseUrl);
  const dummy = createDummyAdapter();

  const wrap = async <T>(apiCall: () => Promise<T>, dummyCall: () => Promise<T>): Promise<T> => {
    if (!config.apiEnabled) {
      return dummyCall();
    }
    try {
      return await apiCall();
    } catch (error) {
      if (shouldFallback(error)) {
        return dummyCall();
      }
      notifyError(error);
      throw error;
    }
  };

  return {
    getCurrentUser: () => wrap<User>(() => api.getCurrentUser(), () => dummy.getCurrentUser()),
    listConversations: () =>
      wrap<Conversation[]>(() => api.listConversations(), () => dummy.listConversations()),
    listMessages: (conversationId: string, cursor?: string) =>
      wrap<MessagePage>(
        () => api.listMessages(conversationId, cursor),
        () => dummy.listMessages(conversationId, cursor)
      ),
    sendMessage: (input: SendMessageInput) =>
      wrap<Message>(() => api.sendMessage(input), () => dummy.sendMessage(input)),
    markRead: (input: MarkReadInput) =>
      wrap<void>(() => api.markRead(input), () => dummy.markRead(input)),
    createConversation: (input: CreateConversationInput) =>
      wrap<Conversation>(() => api.createConversation(input), () => dummy.createConversation(input)),
  };
};
