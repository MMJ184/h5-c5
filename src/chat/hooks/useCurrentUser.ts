import { useQuery } from '@tanstack/react-query';
import { getChatService } from '../services';

export const currentUserQueryKey = ['chat', 'me'];

export const useCurrentUser = () => {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => getChatService().getCurrentUser(),
  });
};
