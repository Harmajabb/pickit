import Joi from "joi";

export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    .required()
    .messages({
      "string.empty": "Token cannot be empty.",
      "string.pattern.base": "Invalid security token format.",
      "any.required": "Security token is missing.",
    }),

  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required.",
    "any.required": "Current password is required.",
  }),

  newPassword: Joi.string()
    .min(12)
    .max(128)
    .pattern(/[A-Z]/, "uppercase letter")
    .pattern(/[a-z]/, "lowercase letter")
    .pattern(/[0-9]/, "number")
    .pattern(/[!@#$%^&*]/, "special character")
    .required()
    .messages({
      "string.empty": "New password is required.",
      "string.min": "Password must be at least {#limit} characters.",
      "string.max": "Password is too long.",
      "string.pattern.name": "Password must include at least one {#name}.",
      "any.required": "New password is required.",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match.",
      "any.required": "Please confirm your new password.",
      "string.empty": "Password confirmation is required.",
    }),
});
