/**
 * Chat Actions - Request handlers
 */

import type { RequestHandler } from "express";
import {
  validateCreateConversation,
  validatePagination,
} from "../../../Validator/chatValidators";
import chatRepository from "./chatRepository";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: number } | undefined;
    }
  }
}

// GET /api/chat/conversations
const browse: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { error: validationError, value } = validatePagination(req.query);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const page =
      ((value as Record<string, unknown>).page as number | undefined) || 1;
    const limit =
      ((value as Record<string, unknown>).limit as number | undefined) || 50;
    const offset = (page - 1) * limit;

    const conversations = await chatRepository.getUserConversations(
      userId,
      limit,
      offset,
    );
    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/conversations
const create: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { error: validationError, value } = validateCreateConversation(
      req.body,
    );
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const payload = value as Record<string, unknown>;
    const user_id_owner = payload.user_id_owner as number;
    const user_id_requester = payload.user_id_requester as number;
    const announce_id = payload.announce_id as number;

    if (userId !== user_id_owner && userId !== user_id_requester) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const conversation = await chatRepository.getOrCreateConversation(
      user_id_owner,
      user_id_requester,
      announce_id,
    );

    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/conversations/:id
const read: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const conversationId = Number.parseInt(String(req.params.id), 10);
    const conversation =
      await chatRepository.getConversationById(conversationId);

    if (
      conversation.user_id_owner !== userId &&
      conversation.user_id_requester !== userId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/conversations/:id/messages
const getMessages: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const conversationId = Number.parseInt(String(req.params.id), 10);

    const conversation =
      await chatRepository.getConversationById(conversationId);
    if (
      conversation.user_id_owner !== userId &&
      conversation.user_id_requester !== userId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { error: validationError, value } = validatePagination(req.query);
    if (validationError) {
      res.status(400).json({ error: validationError.details[0].message });
      return;
    }

    const page =
      ((value as Record<string, unknown>).page as number | undefined) || 1;
    const limit =
      ((value as Record<string, unknown>).limit as number | undefined) || 50;
    const offset = (page - 1) * limit;

    const messages = await chatRepository.getConversationMessages(
      conversationId,
      limit,
      offset,
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/conversations/:id/mark-read
const markRead: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const conversationId = Number.parseInt(String(req.params.id), 10);

    const conversation =
      await chatRepository.getConversationById(conversationId);
    if (
      conversation.user_id_owner !== userId &&
      conversation.user_id_requester !== userId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await chatRepository.markConversationAsRead(conversationId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const chatActions = {
  browse,
  create,
  read,
  getMessages,
  markRead,
};

export default chatActions;
