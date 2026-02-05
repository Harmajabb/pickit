/**
 * Chat Types
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
  created_at?: string;
}
