import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatService } from '../services';
import { conversationsQueryKey } from './useConversations';
import { currentUserQueryKey } from './useCurrentUser';
import { messagesQueryKey } from './useMessages';
import { Conversation, Message, SendMessageInput } from '../types';

const buildOptimisticMessage = (
  input: SendMessageInput,
  senderId: string,
  clientId: string
): Message => ({
  id: clientId,
  clientId,
  conversationId: input.conversationId,
  senderId,
  content: input.content,
  createdAt: new Date().toISOString(),
  status: 'pending',
});

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput) => getChatService().sendMessage(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: messagesQueryKey(input.conversationId) });
      await queryClient.cancelQueries({ queryKey: conversationsQueryKey });

      const previousMessages = queryClient.getQueryData(messagesQueryKey(input.conversationId));
      const previousConversations = queryClient.getQueryData(conversationsQueryKey);

      const cachedUser = queryClient.getQueryData(currentUserQueryKey) as { id?: string } | undefined;
      const senderId = cachedUser?.id ?? 'u_me';
      const clientId = `client_${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const optimisticMessage = buildOptimisticMessage(input, senderId, clientId);

      queryClient.setQueryData(messagesQueryKey(input.conversationId), (oldData: any) => {
        if (!oldData) {
          return { pages: [{ items: [optimisticMessage], nextCursor: undefined }], pageParams: [] };
        }
        const pages = [...oldData.pages];
        const lastPage = pages[pages.length - 1];
        pages[pages.length - 1] = {
          ...lastPage,
          items: [...lastPage.items, optimisticMessage],
        };
        return { ...oldData, pages };
      });

      queryClient.setQueryData(conversationsQueryKey, (oldData: Conversation[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((conversation) =>
          conversation.id === input.conversationId
            ? {
                ...conversation,
                lastMessage: {
                  id: optimisticMessage.id,
                  senderId: optimisticMessage.senderId,
                  content: optimisticMessage.content,
                  createdAt: optimisticMessage.createdAt,
                },
                updatedAt: optimisticMessage.createdAt,
              }
            : conversation
        );
      });

      return { previousMessages, previousConversations, optimisticId: clientId };
    },
    onSuccess: (data, input, context) => {
      queryClient.setQueryData(messagesQueryKey(input.conversationId), (oldData: any) => {
        if (!oldData) return oldData;
        const pages = oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((item: Message) =>
            item.id === context?.optimisticId ? { ...data, status: 'sent' } : item
          ),
        }));
        return { ...oldData, pages };
      });

      queryClient.setQueryData(conversationsQueryKey, (oldData: Conversation[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((conversation) =>
          conversation.id === input.conversationId
            ? {
                ...conversation,
                lastMessage: {
                  id: data.id,
                  senderId: data.senderId,
                  content: data.content,
                  createdAt: data.createdAt,
                },
                updatedAt: data.createdAt,
              }
            : conversation
        );
      });
    },
    onError: (_error, input, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(messagesQueryKey(input.conversationId), context.previousMessages);
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationsQueryKey, context.previousConversations);
      }
    },
  });
};
