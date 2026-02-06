/**
 * Mobile Chat Component
 * Displays chat interface optimized for mobile devices
 * Shows conversation list and messages in a drawer/modal format
 */

import { useContext, useState } from "react";
import { X } from "lucide-react";
import { ChatContext } from "../../context/ChatContext";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { Conversation } from "../../types/Chat";
import "./MobileChat.css";

interface MobileChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileChat: React.FC<MobileChatProps> = ({ isOpen, onClose }) => {
  const chatContext = useContext(ChatContext);
  const [showConversations, setShowConversations] = useState(true);

  if (!chatContext) {
    return null;
  }

  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isTyping,
    selectConversation,
    loadMessages,
    sendMessage,
    deleteConversation,
    currentUser,
  } = chatContext;

  // Get the other user in the conversation
  const getOtherUser = () => {
    if (!currentConversation || !currentUser) return undefined;
    return currentUser.id === currentConversation.user_id_owner
      ? currentConversation.requester
      : currentConversation.owner;
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    selectConversation(conversation);
    await loadMessages(conversation.id);
    setShowConversations(false);
  };

  const handleBack = () => {
    setShowConversations(true);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mobile-chat-overlay">
      <div className="mobile-chat-container">
        {showConversations ? (
          <>
            <div className="mobile-chat-header">
              <h2>Messages</h2>
              <button
                type="button"
                onClick={onClose}
                className="mobile-chat-close"
                aria-label="Close chat"
              >
                <X size={24} />
              </button>
            </div>
            <ConversationList
              conversations={conversations}
              currentConversation={currentConversation}
              currentUser={currentUser}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={deleteConversation}
              isLoading={isLoading}
            />
          </>
        ) : (
          <>
            <div className="mobile-chat-header">
              <button
                type="button"
                onClick={handleBack}
                className="mobile-chat-back"
                aria-label="Back to conversations"
              >
                ← Back
              </button>
              <h2>
                {getOtherUser()?.firstname} {getOtherUser()?.lastname}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="mobile-chat-close"
                aria-label="Close chat"
              >
                <X size={24} />
              </button>
            </div>
            <MessageList
              messages={messages}
              currentUser={currentUser}
              otherUser={getOtherUser()}
              typingUsers={isTyping}
              isLoading={isLoading}
            />
            <MessageInput onSubmit={sendMessage} />
          </>
        )}
      </div>
    </div>
  );
};

export default MobileChat;
