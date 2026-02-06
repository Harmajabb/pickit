/**
 * Socket.IO Handlers - Real-time chat events
 */

import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";
import chatRepository from "./chatRepository";

interface AuthenticatedSocket extends Socket {
  userId?: number;
  conversationRooms?: Set<number>;
}

/**
 * Setup socket.io event handlers
 */
export const setupChatHandlers = (socket: AuthenticatedSocket) => {
  // Verify user is authenticated
  const userId = socket.userId;
  if (!userId) {
    socket.disconnect(true);
    return;
  }

  // Initialize conversation rooms set
  socket.conversationRooms = new Set();

  // ============ Connection Events ============

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected (${socket.id})`);
    socket.conversationRooms?.forEach((convId) => {
      socket.leave(`conversation:${convId}`);
    });
  });

  // ============ Conversation Events ============

  /**
   * Join a conversation room
   */
  socket.on("conversation:join", async (conversationId: number) => {
    try {
      const conversation =
        await chatRepository.getConversationById(conversationId);

      // Verify user is part of conversation
      if (
        conversation.user_id_owner !== userId &&
        conversation.user_id_requester !== userId
      ) {
        socket.emit("error", { message: "Forbidden" });
        return;
      }

      // Join the room
      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);
      socket.conversationRooms?.add(conversationId);

      console.log(`User ${userId} joined conversation ${conversationId}`);

      // Notify others
      socket.to(roomName).emit("user:joined", {
        userId,
        conversationId,
      });
    } catch (error) {
      console.error("Error joining conversation:", error);
      socket.emit("error", { message: "Failed to join conversation" });
    }
  });

  /**
   * Leave a conversation room
   */
  socket.on("conversation:leave", (conversationId: number) => {
    const roomName = `conversation:${conversationId}`;
    socket.leave(roomName);
    socket.conversationRooms?.delete(conversationId);

    console.log(`User ${userId} left conversation ${conversationId}`);

    socket.to(roomName).emit("user:left", {
      userId,
      conversationId,
    });
  });

  // ============ Message Events ============

  /**
   * Send a message
   */
  socket.on(
    "message:send",
    async (data: { conversationId: number; content: string }) => {
      try {
        const { conversationId, content } = data;

        // Verify user is in the conversation
        if (!socket.conversationRooms?.has(conversationId)) {
          socket.emit("error", { message: "Not in this conversation" });
          return;
        }

        // Save message to database
        const message = await chatRepository.saveMessage(
          conversationId,
          userId,
          content,
        );

        // Broadcast to all users in the conversation
        const roomName = `conversation:${conversationId}`;
        socket.to(roomName).emit("message:new", message);
        socket.emit("message:sent", message); // Confirm to sender

        console.log(
          `Message ${message.id} sent in conversation ${conversationId}`,
        );
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", {
          message: (error as Error).message || "Failed to send message",
        });
      }
    },
  );

  // ============ Typing Indicators ============

  /**
   * User is typing
   */
  socket.on(
    "user:typing",
    (data: { conversationId: number; typing: boolean }) => {
      try {
        const { conversationId, typing } = data;

        // Verify user is in the conversation
        if (!socket.conversationRooms?.has(conversationId)) {
          return;
        }

        const roomName = `conversation:${conversationId}`;

        socket.to(roomName).emit("message:typing", {
          userId,
          conversationId,
          typing,
        });
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    },
  );
};

/**
 * Authenticate socket connection via JWT from cookies
 */
export const authenticateSocket = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) => {
  try {
    // Try to get token from cookies first (preferred for security)
    const cookies = socket.handshake.headers.cookie;
    let token: string | null = null;

    if (cookies) {
      // Parse cookies to extract access_token
      const cookieArray = cookies.split("; ");
      const accessTokenCookie = cookieArray.find((c) =>
        c.startsWith("access_token="),
      );
      if (accessTokenCookie) {
        token = accessTokenCookie.split("=")[1];
      }
    }

    // Fallback to auth body if cookie not found
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }
    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Validate token format (JWT has 3 parts separated by dots)
    if (typeof token !== "string" || token.split(".").length !== 3) {
      console.error("Socket authentication error: Invalid token format", {
        tokenType: typeof token,
        tokenLength: String(token).length,
        tokenParts: String(token).split(".").length,
      });
      return next(new Error("Invalid token format"));
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.APP_SECRET as string,
    ) as jwt.JwtPayload & { sub: number };

    if (!decoded.sub) {
      return next(new Error("Invalid token: missing user ID"));
    }

    socket.userId = decoded.sub;
    console.log(`🔐 Socket authenticated for user ${decoded.sub}`);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Socket authentication error: Token expired");
      return next(new Error("Token expired"));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.error("Socket authentication error: Invalid JWT", {
        error: error.message,
      });
      return next(new Error("Invalid token"));
    }

    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
};
