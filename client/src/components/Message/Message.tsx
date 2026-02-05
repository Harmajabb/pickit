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
  const getInitials = (user?: User) => {
    if (!user) return "?";
    return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
  };

  const initials = getInitials(sender);

  return (
    <div className={`${receivedOrSent} message`}>
      <div className="message-avatar">
        {sender?.profil_picture ? (
          <img
            src={`${API_URL}${sender.profil_picture}`}
            alt={`${sender.firstname} ${sender.lastname}`}
            className="message-avatar-img"
            onError={(e) => {
              // Si l'image ne charge pas, afficher les initiales
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (
                e.currentTarget.nextElementSibling as HTMLDivElement
              ).style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="message-avatar-initials"
          style={{
            display: sender?.profil_picture ? "none" : "flex",
          }}
        >
          {initials}
        </div>
      </div>
      <div className="message-content">
        <p>{content}</p>
        <span>{createdAt}</span>
      </div>
    </div>
  );
}

export default Message;
