import { ChatServiceConfig } from '../types';

const parseBool = (value: string | undefined, fallback = false) => {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

export const getChatConfig = (): ChatServiceConfig => {
  const apiEnabled = parseBool(import.meta.env.VITE_CHAT_API_ENABLED, false);
  const baseUrl = (import.meta.env.VITE_CHAT_API_BASE_URL as string) ?? '';

  return {
    apiEnabled,
    baseUrl,
    flags: {
      chat: {
        enabled: parseBool(import.meta.env.VITE_CHAT_ENABLED, true),
        bot: { enabled: parseBool(import.meta.env.VITE_CHAT_BOT_ENABLED, true) },
        agent: { enabled: parseBool(import.meta.env.VITE_CHAT_AGENT_ENABLED, true) },
      },
    },
  };
};
