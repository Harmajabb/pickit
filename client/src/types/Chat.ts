/**
 * Chat Types - TypeScript interfaces for messaging system
 */

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  profil_picture?: string;
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender?: User;
  conversation_id: number;
  created_at: string;
  is_read?: boolean;
}

export interface Conversation {
  id: number;
  user_id_owner: number;
  user_id_requester: number;
  announce_id: number;
  owner?: User;
  requester?: User;
  announce_title?: string;
  announce_image?: string;
  last_message?: Message;
  last_message_time?: string;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: Map<number, boolean>;
  currentUser: User | null;

  // Methods
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (content: string) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number, page?: number) => Promise<void>;
  setIsTyping: (userId: number, typing: boolean) => void;
  markAsRead: (conversationId: number) => Promise<void>;
  createConversation: (
    ownerId: number,
    requesterId: number,
    announceId: number,
  ) => Promise<Conversation>;
  deleteConversation: (conversationId: number) => Promise<void>;
}

export interface SocketEvents {
  // Incoming events
  "message:new": (message: Message) => void;
  "message:typing": (data: {
    userId: number;
    conversationId: number;
    typing: boolean;
  }) => void;
  "conversation:updated": (conversation: Conversation) => void;
  "conversation:new": (conversation: Conversation) => void;

  // Outgoing events
  "message:send": (data: { conversationId: number; content: string }) => void;
  "user:typing": (data: { conversationId: number; typing: boolean }) => void;
  "conversation:join": (conversationId: number) => void;
  "conversation:leave": (conversationId: number) => void;
}
