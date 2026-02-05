import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ChatSocketService from "../services/ChatSocketService";
import type { ChatContextType, Conversation, Message } from "../types/Chat";
import { AuthContext } from "./AuthContext";

const Base_URL = import.meta.env.VITE_API_URL;

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined,
);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTypingMap] = useState<Map<number, boolean>>(new Map());
  const [socketConnected, setSocketConnected] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${Base_URL}/api/chat/conversations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load conversations");

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const initializeSocket = async () => {
      try {
        // Socket.IO will use cookies automatically for authentication
        await ChatSocketService.connect();
        setSocketConnected(true);
        await loadConversations();
      } catch (error) {
        console.error("Failed to connect socket:", error);
      }
    };

    initializeSocket();

    return () => {
      ChatSocketService.disconnect();
      setSocketConnected(false);
    };
  }, [user, loadConversations]);

  // Setup Socket.IO event listeners
  useEffect(() => {
    if (!socketConnected) return;

    // Listen for new messages
    const unsubscribeNewMessage = ChatSocketService.onNewMessage(
      (message: Message) => {
        if (currentConversation?.id === message.conversation_id) {
          setMessages((prev) => [...prev, message]);
        }
      },
    );

    // Listen for typing indicators
    const unsubscribeTyping = ChatSocketService.onUserTyping(
      (data: { userId: number; conversationId: number; typing: boolean }) => {
        if (currentConversation?.id === data.conversationId) {
          setIsTypingMap((prev) => {
            const newMap = new Map(prev);
            if (data.typing) {
              newMap.set(data.userId, true);
            } else {
              newMap.delete(data.userId);
            }
            return newMap;
          });
        }
      },
    );

    // Listen for conversation updates
    const unsubscribeConvUpdate = ChatSocketService.onConversationUpdated(
      (updated: Conversation) => {
        setConversations((prev) =>
          prev.map((conv) => (conv.id === updated.id ? updated : conv)),
        );
        if (currentConversation?.id === updated.id) {
          setCurrentConversation(updated);
        }
      },
    );

    // Listen for new conversations
    const unsubscribeNewConv = ChatSocketService.onNewConversation(
      (newConv: Conversation) => {
        setConversations((prev) => [newConv, ...prev]);
      },
    );

    return () => {
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeConvUpdate();
      unsubscribeNewConv();
    };
  }, [socketConnected, currentConversation?.id]);

  const loadMessages = useCallback(async (conversationId: number, page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${Base_URL}/api/chat/conversations/${conversationId}/messages?page=${page}&limit=50`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to load messages");

      const data = await response.json();
      if (page === 1) {
        setMessages(data);
      } else {
        setMessages((prev) => [...data, ...prev]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectConversation = useCallback(
    (conversation: Conversation) => {
      setCurrentConversation(conversation);
      setMessages([]);
      ChatSocketService.joinConversation(conversation.id);
      void loadMessages(conversation.id);
    },
    [loadMessages],
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (!currentConversation || !content.trim()) return;

      ChatSocketService.sendMessage(currentConversation.id, content.trim());
      ChatSocketService.setTyping(currentConversation.id, false);
    },
    [currentConversation],
  );

  const setIsTyping = useCallback(
    (_userId: number, typing: boolean) => {
      if (!currentConversation) return;
      ChatSocketService.setTyping(currentConversation.id, typing);
    },
    [currentConversation],
  );

  const markAsRead = useCallback(async (conversationId: number) => {
    try {
      await fetch(
        `${Base_URL}/api/chat/conversations/${conversationId}/mark-read`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        },
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, []);

  const createConversation = useCallback(
    async (
      ownerId: number,
      requesterId: number,
      announceId: number,
    ): Promise<Conversation> => {
      try {
        const response = await fetch(`${Base_URL}/api/chat/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            user_id_owner: ownerId,
            user_id_requester: requesterId,
            announce_id: announceId,
          }),
        });

        if (!response.ok) throw new Error("Failed to create conversation");

        const conversation = await response.json();
        setConversations((prev) => [conversation, ...prev]);
        return conversation;
      } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
      }
    },
    [],
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isLoading,
        isTyping,
        currentUser: user
          ? {
              id: user.id,
              firstname: user.firstname || user.name?.split(" ")[0] || "User",
              lastname: user.name?.split(" ")[1] || "",
              email: user.email,
            }
          : null,
        selectConversation,
        sendMessage,
        loadConversations,
        loadMessages,
        setIsTyping,
        markAsRead,
        createConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
