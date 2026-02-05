/**
 * Chat Repository - Database operations
 */

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import databaseClient from "../../../database/client";
import type { Conversation, Message } from "./chatTypes";

const chatRepository = {
  // ============ Conversations ============

  async getOrCreateConversation(
    userId1: number,
    userId2: number,
    announceId: number,
  ): Promise<Conversation | null> {
    const [announce] = await databaseClient.query(
      "SELECT owner_id FROM announces WHERE id = ?",
      [announceId],
    );

    if (!announce || !Array.isArray(announce) || announce.length === 0) {
      // Return null instead of throwing error - announcement may have been deleted
      console.warn(
        `Announce with id ${announceId} not found, skipping conversation creation`,
      );
      return null;
    }

    const owner = (announce[0] as RowDataPacket).owner_id;
    const requester = owner === userId1 ? userId2 : userId1;

    // Vérifier d'abord si la conversation existe
    const [existing] = await databaseClient.query(
      `SELECT * FROM conversations 
       WHERE user_id_owner = ? AND user_id_requester = ? AND announce_id = ?`,
      [owner, requester, announceId],
    );

    if (existing && Array.isArray(existing) && existing.length > 0) {
      return this.formatConversation(existing[0] as RowDataPacket);
    }

    // Si n'existe pas, créer la conversation
    try {
      await databaseClient.query(
        "INSERT INTO conversations (user_id_owner, user_id_requester, announce_id) VALUES (?, ?, ?)",
        [owner, requester, announceId],
      );
    } catch (error) {
      // Si erreur de clé unique (conversation créée en concurrence), récupérer celle-ci
      const [concurrent] = await databaseClient.query(
        `SELECT * FROM conversations 
         WHERE user_id_owner = ? AND user_id_requester = ? AND announce_id = ?`,
        [owner, requester, announceId],
      );

      if (concurrent && Array.isArray(concurrent) && concurrent.length > 0) {
        return this.formatConversation(concurrent[0] as RowDataPacket);
      }

      console.warn("Error inserting conversation:", error);
    }

    // Récupérer la conversation créée ou existante
    const [result] = await databaseClient.query(
      `SELECT * FROM conversations 
       WHERE user_id_owner = ? AND user_id_requester = ? AND announce_id = ?`,
      [owner, requester, announceId],
    );

    if (result && Array.isArray(result) && result.length > 0) {
      return this.formatConversation(result[0] as RowDataPacket);
    }

    // Si not found, return null (shouldn't happen, but handle gracefully)
    console.warn(
      `Conversation not found after insert attempt for users ${owner}, ${requester}, announce ${announceId}`,
    );
    return null;
  },

  async getConversationById(conversationId: number): Promise<Conversation> {
    const query = `
      SELECT 
        c.*,
        u1.id as owner_id,
        u1.firstname as owner_firstname,
        u1.lastname as owner_lastname,
        u1.email as owner_email,
        u1.profil_picture as owner_picture,
        u2.id as requester_id,
        u2.firstname as requester_firstname,
        u2.lastname as requester_lastname,
        u2.email as requester_email,
        u2.profil_picture as requester_picture,
        a.title as announce_title,
        ai.url as announce_image,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = 0) as unread_count
      FROM conversations c
      LEFT JOIN users u1 ON c.user_id_owner = u1.id
      LEFT JOIN users u2 ON c.user_id_requester = u2.id
      LEFT JOIN announces a ON c.announce_id = a.id
      LEFT JOIN announces_images ai ON a.id = ai.announce_id
      WHERE c.id = ?
    `;

    const [rows] = await databaseClient.query<RowDataPacket[]>(query, [
      conversationId,
    ]);

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("Conversation not found");
    }

    return this.formatConversation(rows[0] as RowDataPacket);
  },

  async getUserConversations(
    userId: number,
    limit = 50,
    offset = 0,
  ): Promise<Conversation[]> {
    const query = `
      SELECT 
        c.*,
        u1.id as owner_id,
        u1.firstname as owner_firstname,
        u1.lastname as owner_lastname,
        u1.email as owner_email,
        u1.profil_picture as owner_picture,
        u2.id as requester_id,
        u2.firstname as requester_firstname,
        u2.lastname as requester_lastname,
        u2.email as requester_email,
        u2.profil_picture as requester_picture,
        a.title as announce_title,
        (SELECT url FROM announces_images WHERE announce_id = a.id LIMIT 1) as announce_image,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = 0) as unread_count
      FROM conversations c
      LEFT JOIN users u1 ON c.user_id_owner = u1.id
      LEFT JOIN users u2 ON c.user_id_requester = u2.id
      LEFT JOIN announces a ON c.announce_id = a.id
      WHERE c.user_id_owner = ? OR c.user_id_requester = ?
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await databaseClient.query<RowDataPacket[]>(query, [
      userId,
      userId,
      limit,
      offset,
    ]);

    if (!Array.isArray(rows)) {
      return [];
    }

    return (rows as RowDataPacket[]).map((row: RowDataPacket) =>
      this.formatConversation(row),
    );
  },

  // ============ Messages ============

  async saveMessage(
    conversationId: number,
    senderId: number,
    content: string,
  ): Promise<Message> {
    if (!content || content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    if (content.trim().length > 1000) {
      throw new Error("Message cannot exceed 1000 characters");
    }

    const [conv] = await databaseClient.query(
      "SELECT * FROM conversations WHERE id = ? AND (user_id_owner = ? OR user_id_requester = ?)",
      [conversationId, senderId, senderId],
    );

    if (!Array.isArray(conv) || conv.length === 0) {
      throw new Error("Unauthorized: not part of this conversation");
    }

    const [result] = await databaseClient.query(
      "INSERT INTO messages (content, sender_id, conversation_id) VALUES (?, ?, ?)",
      [content.trim(), senderId, conversationId],
    );

    const id = (result as ResultSetHeader).insertId;
    return this.getMessageById(id);
  },

  async getMessageById(messageId: number): Promise<Message> {
    const [rows] = await databaseClient.query<RowDataPacket[]>(
      `SELECT m.*, u.id, u.firstname, u.lastname, u.email, u.profil_picture
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [messageId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("Message not found");
    }

    return this.formatMessage(rows[0] as RowDataPacket);
  },

  async getConversationMessages(
    conversationId: number,
    limit = 50,
    offset = 0,
  ): Promise<Message[]> {
    const [rows] = await databaseClient.query<RowDataPacket[]>(
      `SELECT m.*, u.id, u.firstname, u.lastname, u.email, u.profil_picture
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset],
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return (rows as RowDataPacket[])
      .map((row: RowDataPacket) => this.formatMessage(row))
      .reverse();
  },

  async markConversationAsRead(conversationId: number): Promise<void> {
    await databaseClient.query(
      "UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND is_read = 0",
      [conversationId],
    );
  },

  // ============ Formatters ============

  formatConversation(row: RowDataPacket): Conversation {
    return {
      id: row.id,
      user_id_owner: row.user_id_owner,
      user_id_requester: row.user_id_requester,
      announce_id: row.announce_id,
      owner: row.owner_id
        ? {
            id: row.owner_id,
            firstname: row.owner_firstname,
            lastname: row.owner_lastname,
            email: row.owner_email,
            profil_picture: row.owner_picture,
          }
        : undefined,
      requester: row.requester_id
        ? {
            id: row.requester_id,
            firstname: row.requester_firstname,
            lastname: row.requester_lastname,
            email: row.requester_email,
            profil_picture: row.requester_picture,
          }
        : undefined,
      announce_title: row.announce_title,
      announce_image: row.announce_image,
      unread_count: row.unread_count || 0,
    };
  },

  formatMessage(row: RowDataPacket): Message {
    return {
      id: row.id,
      content: row.content,
      sender_id: row.sender_id,
      sender:
        row.id && row.firstname
          ? {
              id: row.id,
              firstname: row.firstname,
              lastname: row.lastname,
              email: row.email,
              profil_picture: row.profil_picture,
            }
          : undefined,
      conversation_id: row.conversation_id,
      created_at: row.created_at,
      is_read: row.is_read === 1,
    };
  },

  async deleteConversation(conversationId: number): Promise<void> {
    await databaseClient.query("DELETE FROM conversations WHERE id = ?", [
      conversationId,
    ]);
  },
};

export default chatRepository;
