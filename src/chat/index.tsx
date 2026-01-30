import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatModule } from './components/ChatModule';

export const ChatModuleWithProvider = () => {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <ChatModule />
    </QueryClientProvider>
  );
};

export { ChatModule };
export * from './types';
