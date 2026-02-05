/**
 * Message Input Component
 */

import { type FC, useCallback, useEffect, useRef, useState } from "react";
import "./messageInput.css";

interface MessageInputProps {
  onSubmit: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
}

const MessageInput: FC<MessageInputProps> = ({
  onSubmit,
  onTyping,
  disabled = false,
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);

      // Reset textarea height and then set it based on scrollHeight
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }

      // Notify parent of typing state
      if (onTyping) {
        onTyping(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator after 1 second of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 1000);
      }
    },
    [onTyping],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (content.trim() && !disabled) {
        onSubmit(content);
        setContent("");

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }

        // Stop typing indicator
        if (onTyping) {
          onTyping(false);
        }

        // Clear timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    [content, onSubmit, onTyping, disabled],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Send message on Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    },
    [handleSubmit],
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const isDisabled = !content.trim() || disabled;
  const charCount = content.length;
  const maxChars = 1000;
  const showWarning = charCount > maxChars * 0.8;

  return (
    <div className="message-input-container">
      <form className="message-input-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="message-input-field"
          placeholder="Écrivez votre message..."
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          className="message-input-btn"
          type="submit"
          disabled={isDisabled}
          title={
            isDisabled ? "Message cannot be empty" : "Send message (Ctrl+Enter)"
          }
        >
          ➤
        </button>
      </form>
      {charCount > 0 && (
        <div
          className={`message-input-counter ${
            charCount >= maxChars ? "error" : showWarning ? "warning" : ""
          }`}
        >
          {charCount} / {maxChars}
        </div>
      )}
    </div>
  );
};

export default MessageInput;
