/**
 * Conversation List Component
 */

import { type FC, useMemo } from "react";
import type { Conversation, User } from "../../types/Chat";
import "./conversationList.css";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentUser: User | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading?: boolean;
}

const ConversationList: FC<ConversationListProps> = ({
  conversations,
  currentConversation,
  currentUser,
  onSelectConversation,
  isLoading = false,
}) => {
  // Get the other user in each conversation
  const getOtherUser = (conv: Conversation) => {
    if (!currentUser) return null;
    return currentUser.id === conv.user_id_owner ? conv.requester : conv.owner;
  };

  const getInitials = (user: User | undefined) => {
    if (!user) return "?";
    return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
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
      return "Hier";
    }
    if (diffDays < 7) {
      return `${diffDays}j`;
    }
    return `${Math.floor(diffDays / 7)}s`;
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

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2 className="conversation-list-title">Messages</h2>
      </div>

      <div className="conversation-list-content">
        {isLoading ? (
          <div className="conversation-list-loading">
            Chargement des conversations...
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="conversation-list-empty">
            <p>Aucune conversation</p>
            <p style={{ fontSize: "12px" }}>
              Les conversations apparaîtront ici
            </p>
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const otherUser = getOtherUser(conv);
            const isActive = currentConversation?.id === conv.id;

            return (
              <button
                key={conv.id}
                className={`conversation-item ${isActive ? "active" : ""}`}
                onClick={() => onSelectConversation(conv)}
                type="button"
              >
                <img
                  src={otherUser?.profil_picture || ""}
                  alt={otherUser?.firstname}
                  className="conversation-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const initials = otherUser ? getInitials(otherUser) : "?";
                    (e.currentTarget as HTMLDivElement).textContent = initials;
                  }}
                />

                {!otherUser?.profil_picture && (
                  <div className="conversation-avatar">
                    {otherUser ? getInitials(otherUser) : "?"}
                  </div>
                )}

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
                      ? "Message récent"
                      : "Aucun message"}
                  </p>
                </div>

                {conv.unread_count && conv.unread_count > 0 && (
                  <div className="conversation-unread-badge">
                    {Math.min(conv.unread_count, 99)}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
