/**
 * Chat Window Component - Main chat interface
 */

import { type FC, useCallback, useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";
import type { Conversation } from "../../types/Chat";
import ConversationList from "./ConversationList";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import "./chat.css";

const ChatWindow: FC = () => {
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isTyping,
    currentUser,
    selectConversation,
    sendMessage,
    loadConversations,
    setIsTyping,
    markAsRead,
  } = useChat();

  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize conversations on mount
  useEffect(() => {
    if (!hasInitialized) {
      loadConversations().then(() => {
        setHasInitialized(true);
      });
    }
  }, [hasInitialized, loadConversations]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (currentConversation) {
      void markAsRead(currentConversation.id);
    }
  }, [currentConversation, markAsRead]);

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      selectConversation(conversation);
    },
    [selectConversation],
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      if (currentConversation) {
        sendMessage(content);
      }
    },
    [currentConversation, sendMessage],
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (currentConversation) {
        setIsTyping(currentUser?.id || 0, isTyping);
      }
    },
    [currentConversation, currentUser?.id, setIsTyping],
  );

  // Get the other user in the conversation
  const getOtherUser = () => {
    if (!currentConversation || !currentUser) return undefined;
    return currentUser.id === currentConversation.user_id_owner
      ? currentConversation.requester
      : currentConversation.owner;
  };

  const otherUser = getOtherUser();

  return (
    <div className="chat-container">
      {/* Conversations List */}
      <div className="chat-sidebar">
        <ConversationList
          conversations={conversations}
          currentConversation={currentConversation}
          currentUser={currentUser}
          onSelectConversation={handleSelectConversation}
          isLoading={isLoading && conversations.length === 0}
        />
      </div>

      {/* Messages Area */}
      <div className="chat-main">
        {!currentConversation ? (
          <div className="chat-empty-state">
            <div className="chat-empty-state-icon">💬</div>
            <p className="chat-empty-state-text">
              Sélectionnez une conversation
            </p>
            <p style={{ fontSize: "12px", opacity: 0.6 }}>
              pour commencer à communiquer
            </p>
          </div>
        ) : (
          <>
            <MessageList
              messages={messages}
              currentUser={currentUser}
              otherUser={otherUser}
              typingUsers={isTyping}
              conversationTitle={currentConversation.announce_title}
              isLoading={isLoading && messages.length === 0}
            />
            <MessageInput
              onSubmit={handleSendMessage}
              onTyping={handleTyping}
              disabled={!currentConversation}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
