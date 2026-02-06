/**
 * Message List Component
 */

import { type FC, useCallback, useEffect, useRef } from "react";
import type { Message as MessageType, User } from "../../types/Chat";
import MessageComponent from "../Message/Message";
import AvatarImage from "./AvatarImage";
import TypingIndicator from "./TypingIndicator";
import "./messageList.css";
import "./avatar.css";

interface MessageListProps {
  messages: MessageType[];
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
  }, [messages, scrollToBottom]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="message-list-container">
      {/* Header */}
      <div className="message-list-header">
        <div className="message-list-header-info">
          <AvatarImage user={otherUser} size="medium" />
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
          <div className="message-list-loading">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="message-list-empty">
            <p>No messages yet</p>
            <p>Start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            return (
              <MessageComponent
                key={message.id}
                content={message.content}
                receivedOrSent={
                  message.sender_id === currentUser?.id ? "sent" : "received"
                }
                createdAt={formatTime(message.created_at)}
                sender={message.sender}
              />
            );
          })
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
