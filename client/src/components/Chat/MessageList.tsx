/**
 * Message List Component
 */

import { type FC, useCallback, useEffect, useRef } from "react";
import type { Message, User } from "../../types/Chat";
import TypingIndicator from "./TypingIndicator";
import "./messageList.css";

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
  otherUser: User | undefined;
  typingUsers: Map<number, boolean>;
  conversationTitle?: string;
  isLoading?: boolean;
}

const MessageList: FC<MessageListProps> = ({
  messages,
  currentUser,
  otherUser,
  typingUsers,
  conversationTitle,
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getInitials = (user: User | undefined) => {
    if (!user) return "?";
    return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
  };

  return (
    <div className="message-list-container">
      {/* Header */}
      <div className="message-list-header">
        <div className="message-list-header-info">
          <div className="message-list-header-avatar">
            {getInitials(otherUser)}
          </div>
          <div className="message-list-header-details">
            {otherUser && (
              <>
                <p className="message-list-header-name">
                  {otherUser.firstname} {otherUser.lastname}
                </p>
                {conversationTitle && (
                  <p className="message-list-header-item">
                    {conversationTitle}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="message-list-content">
        {isLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            Chargement...
          </div>
        ) : messages.length === 0 ? (
          <div className="message-list-empty">
            <p>Aucun message pour le moment</p>
            <p style={{ fontSize: "12px", opacity: 0.6 }}>
              Commencez la conversation
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message-group ${message.sender_id === currentUser?.id ? "own" : "other"}`}
            >
              <div className="message-bubble">
                <p className="message-bubble-content">{message.content}</p>
                <p className="message-bubble-time">
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.has(otherUser?.id || 0) && (
          <TypingIndicator userName={otherUser?.firstname || "User"} />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
