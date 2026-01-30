import { useQuery } from '@tanstack/react-query';
import { getChatService } from '../services';

export const conversationsQueryKey = ['chat', 'conversations'];

export const useConversations = () => {
  return useQuery({
    queryKey: conversationsQueryKey,
    queryFn: () => getChatService().listConversations(),
  });
};
