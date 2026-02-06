import { useContext } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

export function useContactLender() {
  const chatContext = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleContact = async (ownerId: number, announceId: number) => {
    if (!user) {
      // Rediriger vers login si pas connecté
      navigate("/login");
      return;
    }

    if (!chatContext) {
      console.error("Chat context not available");
      return;
    }

    const { createConversation, conversations, selectConversation, setCurrentConversation } = chatContext;

    if (!createConversation) {
      console.error("Chat context not available");
      return;
    }

    try {
      // Chercher si la conversation existe déjà
      const existingConversation = conversations?.find(
        (conv) =>
          (conv.user_id_owner === ownerId && conv.user_id_requester === user.id) ||
          (conv.user_id_owner === user.id && conv.user_id_requester === ownerId) &&
          conv.announce_id === announceId
      );

      if (existingConversation) {
        // Si conversation existe, la sélectionner
        selectConversation(existingConversation);
        navigate("/chat");
      } else {
        // Sinon, créer une nouvelle conversation
        const conversation = await createConversation(
          ownerId,
          user.id,
          announceId,
        );
        console.log("Conversation créée:", conversation);
        setCurrentConversation(conversation);
        navigate("/chat");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      throw error;
    }
  };

  return { handleContact };
}
