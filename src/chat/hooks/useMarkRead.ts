import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatService } from '../services';
import { conversationsQueryKey } from './useConversations';
import { MarkReadInput } from '../types';

export const useMarkRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MarkReadInput) => getChatService().markRead(input),
    onSuccess: (_data, input) => {
      queryClient.setQueryData(conversationsQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((conversation: any) =>
          conversation.id === input.conversationId ? { ...conversation, unreadCount: 0 } : conversation
        );
      });
    },
  });
};
