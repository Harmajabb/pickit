import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ProfileEdit from "../../components/ProfileEdit/ProfileEdit";
import ProfileView from "../../components/ProfileView/ProfileView";
import { AuthContext } from "../../context/AuthContext";
import type { ProfileData, UserPrivate } from "../../types/User";

function Profile({ mode }: { mode: "me" | "member" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext);

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (mode === "member" && !id) return;

    if (mode === "me" && !authUser) {
      navigate("/login");
      return;
    }

    const endpoint =
      mode === "me"
        ? `${API_URL}/api/profile/me`
        : `${API_URL}/api/profile/${id}`;

    (async () => {
      setLoading(true);
      const res = await fetch(endpoint, { credentials: "include" });

      if (res.status === 401) {
        navigate("/login");
        return;
      }
      const json = await res.json();
      setData(json);
      setLoading(false);
    })();
  }, [mode, id, authUser, navigate]);

  // --- NOUVELLE FONCTION POUR COMMUNIQUER AVEC TON BACKEND ---
  const handleStatusUpdate = async (borrowId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/borrows/${borrowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      if (response.ok) {
        alert(`Demande mise à jour : ${newStatus}`);
        window.location.reload(); // Rafraîchit pour voir le changement
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  const handleSave = (updatedUser: UserPrivate) => {
    setData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        user: updatedUser,
      };
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return null;

  if (mode === "me") {
    const user = data.user as UserPrivate;
    return (
      <>
        {isEditing ? (
          <ProfileEdit
            user={user}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        ) : (
          <ProfileView
            mode="me"
            user={user}
            onEditClick={handleEditClick}
            onStatusUpdate={handleStatusUpdate} // Connexion faite ici !
          />
        )}
      </>
    );
  }

  return (
    <ProfileView
      mode="member"
      user={data.user}
      items={"items" in data ? data.items : []}
      favorites={"favorites" in data ? data.favorites : []}
      onStatusUpdate={handleStatusUpdate} // Connexion faite ici aussi !
    />
  );
}

export default Profile;
