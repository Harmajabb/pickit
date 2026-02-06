import { useState } from "react";
import "./message.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3310";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  profil_picture?: string;
}

interface MessageProps {
  content: string;
  receivedOrSent: string;
  createdAt: string;
  sender?: User;
}

function Message({ content, receivedOrSent, createdAt, sender }: MessageProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (user?: User) => {
    if (!user) return "?";
    
    // Afficher les deux premières lettres
    const firstInitial = user.firstname?.[0]?.toUpperCase() || "";
    const lastInitial = user.lastname?.[0]?.toUpperCase() || "";
    
    if (firstInitial && lastInitial) {
      return `${firstInitial}${lastInitial}`;
    }
    
    return firstInitial || lastInitial || "?";
  };

  const hasImage = sender?.profil_picture && !imageError;
  const initials = getInitials(sender);

  return (
    <div className={`${receivedOrSent} message`}>
      <div className="message-avatar">
        {hasImage ? (
          <img
            src={`${API_URL}${sender.profil_picture}`}
            alt={`${sender.firstname} ${sender.lastname}`}
            className="message-avatar-img"
            onError={() => setImageError(true)}
          />
        ) : null}
        {!hasImage && (
          <div className="message-avatar-initials">
            {initials}
          </div>
        )}
      </div>
      <div className="message-content">
        <p>{content}</p>
        <span>{createdAt}</span>
      </div>
    </div>
  );
}

export default Message;
