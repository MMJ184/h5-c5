import { ChatFeatureFlags } from '../types';
import { getChatFlags } from '../services';

export const useChatFlags = (): ChatFeatureFlags => {
  return getChatFlags();
};
