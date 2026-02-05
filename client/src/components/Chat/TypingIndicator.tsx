/**
 * Typing Indicator Component
 */

import type { FC } from "react";
import "./typingIndicator.css";

interface TypingIndicatorProps {
  userName: string;
}

const TypingIndicator: FC<TypingIndicatorProps> = ({ userName }) => {
  return (
    <div className="typing-indicator">
      <p className="typing-indicator-text">{userName} is typing</p>
      <div className="typing-indicator-dots">
        <div className="typing-indicator-dot" />
        <div className="typing-indicator-dot" />
        <div className="typing-indicator-dot" />
      </div>
    </div>
  );
};

export default TypingIndicator;
