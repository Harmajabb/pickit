import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
  const navigate = useNavigate();
  //To avoid too many request and since on reload its gonna be a real value from bdd anyways, i'm "faking" total_likes on favorite toggle.
  const [fakeTotal_likes, setFakeTotalLikes] = useState<number>(total_likes);
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
          setFakeTotalLikes((prev) => prev - 1);
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
          setFakeTotalLikes((prev) => prev + 1);
        }
      }
    } else {
      navigate("/login");
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
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsLiked((prev) => !prev);
        handleFavoriteBtn();
      }}
      className={isLiked ? "liked like-button" : "like-button notliked"}
    >
      <Heart size={16} strokeWidth={2} />
      <span>{fakeTotal_likes}</span>
    </button>
  );
}

export default FavoriteBtn;
