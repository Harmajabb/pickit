import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import ChatWindow from "./ChatWindow";
import "./ChatWidget.css";
import { MessageCircle, X } from "lucide-react";

function ChatWidget() {
  const chatContext = useContext(ChatContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const { conversations, currentConversation } = chatContext || {
    conversations: [],
    currentConversation: null,
  };

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentConversation) {
      setIsOpen(true);
    }
  }, [currentConversation]);

  if (!chatContext || isMobile) {
    return null;
  }

  const unreadCount = conversations.reduce(
    (total, conv) => total + (conv.unread_count || 0),
    0,
  );

  return (
    <div className="chat-widget">
      {/* Chat Window - shown when open */}
      {isOpen && (
        <div className="chat-widget-window">
          <ChatWindow />
        </div>
      )}

      {/* Floating button to open/close */}
      <button
        type="button"
        className="chat-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="chat-widget-badge">{unreadCount}</span>
            )}
          </>
        )}
      </button>
    </div>
  );
}

export default ChatWidget;
