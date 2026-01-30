import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatService } from '../services';
import { conversationsQueryKey } from './useConversations';
import { Conversation, CreateConversationInput } from '../types';

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationInput) => getChatService().createConversation(input),
    onSuccess: (data) => {
      queryClient.setQueryData(conversationsQueryKey, (oldData: Conversation[] | undefined) => {
        if (!oldData) return [data];
        return [data, ...oldData];
      });
    },
  });
};
