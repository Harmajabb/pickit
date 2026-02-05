/**
 * Contact Lender Button - Initialize chat conversation
 *
 * Exemple d'utilisation:
 *
 * import { useChat } from '../context/ChatContext';
 * import { useNavigate } from 'react-router';
 *
 * function ProductSheet() {
 *   const { createConversation } = useChat();
 *   const navigate = useNavigate();
 *   const { user } = useContext(AuthContext);
 *
 *   const handleContactLender = async (ownerId: number, announceId: number) => {
 *     try {
 *       const conversation = await createConversation(
 *         ownerId,
 *         user.id,
 *         announceId
 *       );
 *       navigate('/chat');
 *     } catch (error) {
 *       console.error('Failed to create conversation:', error);
 *     }
 *   };
 * }
 */

import { useContext } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

export function useContactLender() {
  const { createConversation } = useContext(ChatContext) || {};
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleContact = async (ownerId: number, announceId: number) => {
    if (!user) {
      // Rediriger vers login si pas connecté
      navigate("/login");
      return;
    }

    if (!createConversation) {
      console.error("Chat context not available");
      return;
    }

    try {
      const conversation = await createConversation(
        ownerId,
        user.id,
        announceId,
      );
      console.log("Conversation créée:", conversation);
      navigate("/chat");
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      throw error;
    }
  };

  return { handleContact };
}
