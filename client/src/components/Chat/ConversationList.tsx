/**
 * Conversation List Component
 */

import { type FC, useMemo } from "react";
import type { Conversation, User } from "../../types/Chat";
import AvatarImage from "./AvatarImage";
import "./conversationList.css";
import "./avatar.css";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentUser: User | null;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation?: (conversationId: number) => Promise<void>;
  isLoading?: boolean;
}

const ConversationList: FC<ConversationListProps> = ({
  conversations,
  currentConversation,
  currentUser,
  onSelectConversation,
  onDeleteConversation,
  isLoading = false,
}) => {
  // Get the other user in each conversation
  const getOtherUser = (conv: Conversation) => {
    if (!currentUser) return undefined;
    return currentUser.id === conv.user_id_owner ? conv.requester : conv.owner;
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    if (diffDays === 1) {
      return "Yesterday";
    }
    if (diffDays < 7) {
      return `${diffDays}d`;
    }
    return `${Math.floor(diffDays / 7)}w`;
  };

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const timeA = new Date(
        a.last_message_time || a.created_at || 0,
      ).getTime();
      const timeB = new Date(
        b.last_message_time || b.created_at || 0,
      ).getTime();
      return timeB - timeA;
    });
  }, [conversations]);

  const handleDeleteClick = async (
    e: React.MouseEvent,
    conversationId: number,
  ) => {
    e.stopPropagation();
    if (
      onDeleteConversation &&
      window.confirm("Are you sure you want to delete this conversation?")
    ) {
      try {
        await onDeleteConversation(conversationId);
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2 className="conversation-list-title">Messages</h2>
      </div>

      <div className="conversation-list-content">
        {isLoading ? (
          <div className="conversation-list-loading">
            Loading conversations...
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="conversation-list-empty">
            <p>No conversations</p>
            <p>Conversations will appear here</p>
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const otherUser = getOtherUser(conv);
            const isActive = currentConversation?.id === conv.id;

            return (
              <div
                key={conv.id}
                className={`conversation-item-wrapper ${isActive ? "active" : ""}`}
              >
                <button
                  className={`conversation-item ${isActive ? "active" : ""}`}
                  onClick={() => onSelectConversation(conv)}
                  type="button"
                >
                  <AvatarImage
                    user={otherUser}
                    size="large"
                    className="conversation-avatar"
                  />

                  <div className="conversation-info">
                    <div className="conversation-info-top">
                      <h3 className="conversation-info-name">
                        {otherUser?.firstname} {otherUser?.lastname}
                      </h3>
                      <p className="conversation-info-time">
                        {formatTime(conv.last_message_time)}
                      </p>
                    </div>
                    <p className="conversation-info-preview">
                      {conv.last_message_time
                        ? "Recent message"
                        : "No messages"}
                    </p>
                  </div>

                  {conv.unread_count && conv.unread_count > 0 && (
                    <div className="conversation-unread-badge">
                      {Math.min(conv.unread_count, 99)}
                    </div>
                  )}
                </button>

                {onDeleteConversation && (
                  <button
                    className="conversation-delete-btn"
                    onClick={(e) => handleDeleteClick(e, conv.id)}
                    title="Delete this conversation"
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
