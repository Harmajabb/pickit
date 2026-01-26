import { useContext, useEffect, useState } from "react";
import type { Announce } from "../../types/Announce";
import "./FavoriteBtn.css";
import { Heart } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL;

interface FavoriteBtnProps {
  total_likes: Announce["total_likes"];
  announce_id: Announce["id"];
}

function FavoriteBtn({ total_likes, announce_id }: FavoriteBtnProps) {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const { user } = useContext(AuthContext);

  const handleFavoriteBtn = async () => {
    if (user) {
      const user_id = user.id;
      if (isLiked) {
        const res = await fetch(`${BASE_URL}/api/favorite/removeFav`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, announce_id }),
        });
        if (res.ok) {
          setIsLiked(false);
        }
      }
      if (!isLiked) {
        const res = await fetch(`${BASE_URL}/api/favorite/addFav`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, announce_id }),
        });
        if (res.ok) {
          setIsLiked(true);
        }
      }
    }
  };
  useEffect(() => {
    if (user?.favoritesIds.includes(announce_id)) {
      setIsLiked(true);
    }
  }, [announce_id, user?.favoritesIds]);

  return (
    <button
      type="button"
      onClick={() => {
        setIsLiked((prev) => !prev);
        handleFavoriteBtn();
      }}
      className={isLiked ? "liked like-button" : "like-button notliked"}
    >
      <Heart size={16} strokeWidth={2} />
      <span>{total_likes}</span>
    </button>
  );
}

export default FavoriteBtn;
