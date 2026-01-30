import { Conversation, Message, MessageSummary, User } from '../types';

const now = Date.now();
let messageCounter = 1;
let conversationCounter = 7;

const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

const makeMessage = (
  conversationId: string,
  senderId: string,
  content: string,
  minutes: number
): Message => ({
  id: `m_${messageCounter++}`,
  conversationId,
  senderId,
  content,
  createdAt: minutesAgo(minutes),
  status: 'sent',
});

const users: User[] = [
  { id: 'u_me', name: 'You', avatarUrl: '', isOnline: true },
  { id: 'u_1', name: 'Olivia Chen', avatarUrl: '', isOnline: true },
  { id: 'u_2', name: 'Samir Patel', avatarUrl: '', isOnline: false },
  { id: 'u_3', name: 'Nora Adeyemi', avatarUrl: '', isOnline: true },
  { id: 'u_4', name: 'Diego Silva', avatarUrl: '', isOnline: true },
  { id: 'u_5', name: 'Lena Müller', avatarUrl: '', isOnline: false },
  { id: 'u_bot', name: 'Ops Bot', avatarUrl: '', isOnline: true },
  { id: 'u_agent', name: 'IT Agent', avatarUrl: '', isOnline: true },
];

const conversationsBase: Conversation[] = [
  {
    id: 'c_1',
    type: 'dm',
    title: 'Olivia Chen',
    participants: [
      { id: 'u_me', name: 'You', isOnline: true, role: 'member' },
      { id: 'u_1', name: 'Olivia Chen', isOnline: true, role: 'member' },
    ],
    unreadCount: 2,
    updatedAt: minutesAgo(15),
  },
  {
    id: 'c_2',
    type: 'dm',
    title: 'Samir Patel',
    participants: [
      { id: 'u_me', name: 'You', isOnline: true, role: 'member' },
      { id: 'u_2', name: 'Samir Patel', isOnline: false, role: 'member' },
    ],
    unreadCount: 0,
    updatedAt: minutesAgo(90),
  },
  {
    id: 'c_3',
    type: 'channel',
    title: '#design-sync',
    participants: [
      { id: 'u_me', name: 'You', isOnline: true, role: 'member' },
      { id: 'u_3', name: 'Nora Adeyemi', isOnline: true, role: 'owner' },
      { id: 'u_4', name: 'Diego Silva', isOnline: true, role: 'member' },
      { id: 'u_5', name: 'Lena Müller', isOnline: false, role: 'member' },
    ],
    unreadCount: 5,
    updatedAt: minutesAgo(8),
  },
  {
    id: 'c_4',
    type: 'channel',
    title: '#ops-alerts',
    participants: [
      { id: 'u_me', name: 'You', isOnline: true, role: 'member' },
      { id: 'u_4', name: 'Diego Silva', isOnline: true, role: 'owner' },
      { id: 'u_5', name: 'Lena Müller', isOnline: false, role: 'member' },
    ],
    unreadCount: 1,
    updatedAt: minutesAgo(25),
  },
  {
    id: 'c_5',
    type: 'bot',
    title: 'Ops Bot',
    participants: [
      { id: 'u_me', name: 'You', isOnline: true, role: 'member' },
      { id: 'u_bot', name: 'Ops Bot', isOnline: true, role: 'member' },
    ],
    unreadCount: 0,
    updatedAt: minutesAgo(40),
  },
  {
    id: 'c_6',
    type: 'agent',
    title: 'IT Agent',
    participants: [
      { id: 'u_me', name: 'You', isOnline: true, role: 'member' },
      { id: 'u_agent', name: 'IT Agent', isOnline: true, role: 'member' },
    ],
    unreadCount: 0,
    updatedAt: minutesAgo(60),
  },
];

const messagesByConversation: Record<string, Message[]> = {
  c_1: [
    makeMessage('c_1', 'u_1', 'Morning! Do you have time to review the mockups?', 220),
    makeMessage('c_1', 'u_me', 'Yep, send them over.', 210),
    makeMessage('c_1', 'u_1', 'Uploading now, give me 2 mins.', 205),
    makeMessage('c_1', 'u_1', 'Sent the link in the drive folder.', 190),
    makeMessage('c_1', 'u_me', 'Got it. I will leave feedback today.', 180),
    makeMessage('c_1', 'u_1', 'Thanks! Also check the new nav states.', 20),
    makeMessage('c_1', 'u_1', 'Ping me if anything is unclear.', 15),
  ],
  c_2: [
    makeMessage('c_2', 'u_me', 'Did the build finish on your side?', 300),
    makeMessage('c_2', 'u_2', 'Yep, green on staging.', 295),
    makeMessage('c_2', 'u_me', 'Nice, I will start QA.', 290),
    makeMessage('c_2', 'u_2', 'Let me know if you hit anything.', 280),
    makeMessage('c_2', 'u_me', 'Will do.', 270),
    makeMessage('c_2', 'u_2', 'Heads up: there is a new env var.', 120),
    makeMessage('c_2', 'u_me', 'Thanks, I will update configs.', 110),
  ],
  c_3: [
    makeMessage('c_3', 'u_3', 'Design sync in 10 minutes.', 75),
    makeMessage('c_3', 'u_4', 'I will share the flow.', 70),
    makeMessage('c_3', 'u_5', 'Joining from mobile.', 65),
    makeMessage('c_3', 'u_me', 'I will bring latest user feedback.', 60),
    makeMessage('c_3', 'u_3', 'Agenda: header, nav, filters.', 12),
    makeMessage('c_3', 'u_me', 'I can demo the new search.', 10),
    makeMessage('c_3', 'u_4', 'Please include mobile states.', 9),
    makeMessage('c_3', 'u_5', 'Noted!', 8),
  ],
  c_4: [
    makeMessage('c_4', 'u_4', 'Latency spike detected at 08:12 UTC.', 150),
    makeMessage('c_4', 'u_5', 'Investigating logs.', 145),
    makeMessage('c_4', 'u_me', 'I can help triage.', 140),
    makeMessage('c_4', 'u_4', 'Scaling up workers.', 30),
    makeMessage('c_4', 'u_5', 'Looks stable now.', 25),
    makeMessage('c_4', 'u_4', 'Closing incident once metrics hold.', 25),
    makeMessage('c_4', 'u_me', 'Thanks all.', 24),
  ],
  c_5: [
    makeMessage('c_5', 'u_bot', 'Hi! I can answer ops questions.', 200),
    makeMessage('c_5', 'u_me', 'Show me today’s incident summary.', 195),
    makeMessage('c_5', 'u_bot', '2 incidents resolved, 0 ongoing.', 190),
    makeMessage('c_5', 'u_me', 'Any pending follow-ups?', 185),
    makeMessage('c_5', 'u_bot', 'One: update runbook section 4.', 180),
    makeMessage('c_5', 'u_me', 'Create a ticket for that.', 60),
    makeMessage('c_5', 'u_bot', 'Ticket OPS-238 created.', 58),
  ],
  c_6: [
    makeMessage('c_6', 'u_agent', 'Hello, how can I help?', 240),
    makeMessage('c_6', 'u_me', 'VPN drops every 30 minutes.', 235),
    makeMessage('c_6', 'u_agent', 'Resetting your profile.', 230),
    makeMessage('c_6', 'u_me', 'Thanks, I will re-login.', 225),
    makeMessage('c_6', 'u_agent', 'Also update your client to 4.2.', 220),
    makeMessage('c_6', 'u_me', 'Doing it now.', 215),
    makeMessage('c_6', 'u_agent', 'Let me know if it persists.', 210),
  ],
};

const makeSummary = (message: Message): MessageSummary => ({
  id: message.id,
  senderId: message.senderId,
  content: message.content,
  createdAt: message.createdAt,
});

const refreshConversationSummaries = (conversationId: string) => {
  const conversation = conversationsBase.find((item) => item.id === conversationId);
  if (!conversation) return;
  const messages = messagesByConversation[conversationId] ?? [];
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    conversation.lastMessage = makeSummary(lastMessage);
    conversation.updatedAt = lastMessage.createdAt;
  }
};

Object.keys(messagesByConversation).forEach(refreshConversationSummaries);

export const dummyStore = {
  currentUserId: 'u_me',
  users,
  conversations: conversationsBase,
  messagesByConversation,
  nextConversationId: () => `c_${conversationCounter++}`,
  nextMessageId: () => `m_${messageCounter++}`,
};

export const buildConversation = (conversation: Conversation, lastMessage?: Message) => {
  if (lastMessage) {
    conversation.lastMessage = makeSummary(lastMessage);
    conversation.updatedAt = lastMessage.createdAt;
  }
};

export const ensureConversationSummaries = () => {
  conversationsBase.forEach((item) => refreshConversationSummaries(item.id));
};
