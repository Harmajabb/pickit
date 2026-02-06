/**
 * Chat Validators - Input validation for chat endpoints
 */

import Joi from "joi";

export const validateCreateConversation = (data: unknown) => {
  const schema = Joi.object({
    user_id_owner: Joi.number().integer().positive().required(),
    user_id_requester: Joi.number().integer().positive().required(),
    announce_id: Joi.number().integer().positive().required(),
  });

  return schema.validate(data);
};

export const validateSendMessage = (data: unknown) => {
  const schema = Joi.object({
    content: Joi.string().trim().min(1).max(1000).required(),
    conversation_id: Joi.number().integer().positive().required(),
  });

  return schema.validate(data);
};

export const validatePagination = (data: unknown) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
  });

  return schema.validate(data);
};
