import { createChatService } from './service';
import { getChatConfig } from './config';

let serviceSingleton = createChatService();

export const getChatService = () => serviceSingleton;

export const refreshChatService = () => {
  serviceSingleton = createChatService();
  return serviceSingleton;
};

export const getChatFlags = () => getChatConfig().flags;
