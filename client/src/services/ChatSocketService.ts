/**
 * Chat Socket Service - Manage WebSocket communication
 */

import { io, type Socket } from "socket.io-client";
import type { Conversation, Message } from "../types/Chat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ChatSocketService {
  private socket: Socket | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Socket.IO will automatically include cookies in the handshake
        this.socket = io(API_URL, {
          withCredentials: true, // Include cookies in the connection
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 10,
          transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
          console.log("✅ Socket connected:", this.socket?.id);
          resolve();
        });

        this.socket.on("connect_error", (error: Error) => {
          console.error("❌ Socket connection error:", error);
          reject(error);
        });

        this.socket.on("disconnect", () => {
          console.log("⚠️  Socket disconnected");
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Conversation events
  joinConversation(conversationId: number): void {
    if (this.socket) {
      this.socket.emit("conversation:join", conversationId);
    }
  }

  leaveConversation(conversationId: number): void {
    if (this.socket) {
      this.socket.emit("conversation:leave", conversationId);
    }
  }

  // Message events
  sendMessage(conversationId: number, content: string): void {
    if (this.socket) {
      this.socket.emit("message:send", {
        conversationId,
        content,
      });
    }
  }

  onNewMessage(callback: (message: Message) => void): () => void {
    if (!this.socket) return () => {};

    this.socket.on("message:new", callback);
    return () => this.socket?.off("message:new", callback);
  }

  onMessageSent(callback: (message: Message) => void): () => void {
    if (!this.socket) return () => {};

    this.socket.on("message:sent", callback);
    return () => this.socket?.off("message:sent", callback);
  }

  // Typing indicators
  setTyping(conversationId: number, typing: boolean): void {
    if (this.socket) {
      this.socket.emit("user:typing", {
        conversationId,
        typing,
      });
    }
  }

  onUserTyping(
    callback: (data: {
      userId: number;
      conversationId: number;
      typing: boolean;
    }) => void,
  ): () => void {
    if (!this.socket) return () => {};

    this.socket.on("message:typing", callback);
    return () => this.socket?.off("message:typing", callback);
  }

  // Conversation updates
  onConversationUpdated(
    callback: (conversation: Conversation) => void,
  ): () => void {
    if (!this.socket) return () => {};

    this.socket.on("conversation:updated", callback);
    return () => this.socket?.off("conversation:updated", callback);
  }

  onNewConversation(
    callback: (conversation: Conversation) => void,
  ): () => void {
    if (!this.socket) return () => {};

    this.socket.on("conversation:new", callback);
    return () => this.socket?.off("conversation:new", callback);
  }

  // Error handling
  onError(callback: (error: { message: string }) => void): () => void {
    if (!this.socket) return () => {};

    this.socket.on("error", callback);
    return () => this.socket?.off("error", callback);
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export default new ChatSocketService();
