import { X } from "lucide-react";
import { useCallback, useContext, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import ChatWindow from "./ChatWindow";
import "./chatModal.css";

function ChatModal() {
  const chatContext = useContext(ChatContext);

  const handleClose = useCallback(() => {
    if (chatContext) {
      chatContext.setIsChatOpen(false);
    }
  }, [chatContext]);

  // Fermer le chat en appuyant sur Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  if (!chatContext || !chatContext.isChatOpen) {
    return null;
  }

  return (
    <dialog
      className="chat-modal-overlay"
      open={chatContext.isChatOpen}
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      }}
    >
      <div
        className="chat-modal-container"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="none"
      >
        <div className="chat-modal-header">
          <h2>Messages</h2>
          <button
            type="button"
            className="chat-modal-close"
            onClick={handleClose}
            aria-label="Close chat"
          >
            <X size={24} />
          </button>
        </div>
        <div className="chat-modal-content">
          <ChatWindow />
        </div>
      </div>
    </dialog>
  );
}

export default ChatModal;
