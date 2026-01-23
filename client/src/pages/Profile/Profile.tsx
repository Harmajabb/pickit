import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ProfileEdit from "../../components/ProfileEdit/ProfileEdit";
import ProfileView from "../../components/ProfileView/ProfileView";
import { AuthContext } from "../../context/AuthContext";
import type { ProfileData, UserPrivate } from "../../types/User";

function Profile({ mode }: { mode: "me" | "member" }) {
  const { id } = useParams(); // get user ID from url
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext); // for authentified "me" member

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // for edition in "me" member

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    //security
    if (mode === "member" && !id) return;

    if (mode === "me" && !authUser) {
      navigate("/login");
      return;
    }

    const endpoint =
      mode === "me"
        ? `${API_URL}/api/profile/me` // private profile
        : `${API_URL}/api/profile/${id}`; // public profile

    //fetch profile data
    (async () => {
      setLoading(true);
      const res = await fetch(endpoint, { credentials: "include" });

      //unauthorized access
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      const json = await res.json();
      setData(json);
      setLoading(false);
    })();
  }, [mode, id, authUser, navigate]);

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
          <ProfileView mode="me" user={user} onEditClick={handleEditClick} />
        )}
      </>
    );
  }

  // Public profile
  //note Leah: maybe using kind if I have time to avoid manual checks.
  return (
    <ProfileView
      mode="member"
      user={data.user}
      items={"items" in data ? data.items : []}
      favorites={"favorites" in data ? data.favorites : []}
    />
  );
}

export default Profile;
