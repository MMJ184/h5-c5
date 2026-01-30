import { useInfiniteQuery } from '@tanstack/react-query';
import { getChatService } from '../services';

export const messagesQueryKey = (conversationId: string) => ['chat', 'messages', conversationId];

export const useMessages = (conversationId?: string) => {
  return useInfiniteQuery({
    queryKey: conversationId ? messagesQueryKey(conversationId) : ['chat', 'messages', 'empty'],
    queryFn: ({ pageParam }) =>
      conversationId
        ? getChatService().listMessages(conversationId, pageParam as string | undefined)
        : Promise.resolve({ items: [], nextCursor: undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(conversationId),
    initialPageParam: undefined as string | undefined,
  });
};
