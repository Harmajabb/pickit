/**
 * Avatar Image Component - Reusable avatar with image/initials fallback
 * Simplifies avatar display logic across chat components
 */

import { type FC, useState } from "react";
import type { User } from "../../types/Chat";

interface AvatarImageProps {
  user: User | undefined;
  className?: string;
  size?: "small" | "medium" | "large";
}

const AvatarImage: FC<AvatarImageProps> = ({
  user,
  className = "",
  size = "medium",
}) => {
  const [imageError, setImageError] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3310";

  const getInitials = () => {
    if (!user) return "?";
    return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
  };

  const hasImage = user?.profil_picture && !imageError;

  return (
    <div className={`avatar ${className} avatar-${size}`}>
      {hasImage ? (
        <img
          src={`${API_URL}${user.profil_picture}`}
          alt={`${user?.firstname} ${user?.lastname}`}
          className="avatar-img"
          onError={() => setImageError(true)}
        />
      ) : null}
      {!hasImage && <span className="avatar-initials">{getInitials()}</span>}
    </div>
  );
};

export default AvatarImage;
