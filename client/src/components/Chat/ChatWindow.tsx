/**
 * Chat Window Component - Main chat interface
 */

import { type FC, useCallback, useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";
import type { Conversation } from "../../types/Chat";
import ButtonReport from "../btn-report/ButtonReport";
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
    deleteConversation,
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
      // Reload conversations to update unread count
      void loadConversations();
    }
  }, [currentConversation, markAsRead, loadConversations]);

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

  const handleDeleteConversation = useCallback(
    async (conversationId: number) => {
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        console.error("Error deleting conversation:", error);
        alert("Error deleting conversation");
      }
    },
    [deleteConversation],
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
          onDeleteConversation={handleDeleteConversation}
          isLoading={isLoading && conversations.length === 0}
        />
      </div>

      {/* Messages Area */}
      <div className="chat-main">
        {!currentConversation ? (
          <div className="chat-empty-state">
            <div className="chat-empty-state-icon">💬</div>
            <p className="chat-empty-state-text">Select a conversation</p>
            <p>to start communicating</p>
          </div>
        ) : (
          <>
            {/* Chat Header with Report Button */}
            <div className="chat-header">
              <div className="chat-header-info">
                <h3 className="chat-header-title">
                  {currentConversation.announce_title}
                </h3>
                {otherUser && (
                  <p className="chat-header-user">with {otherUser.firstname}</p>
                )}
              </div>

              {/* Report Button Integration */}
              {otherUser && (
                <ButtonReport
                  targetType="message"
                  data={currentConversation}
                  userId={currentUser?.id}
                />
              )}
            </div>

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
