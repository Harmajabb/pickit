import path from "node:path";
import argon2 from "argon2";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { resetPasswordSchema } from "../../../Validator/Resetpasswordcheck";
import adminLogRepository from "../authentication/adminLogRepository";
import favoriteRepository from "../favorites/favoriteRepository";
import authRepository from "./authRepository";

declare global {
  namespace Express {
    interface Request {
      auth?: jwt.JwtPayload & { role: number } & { firstname: string };
    }
  }
}

const login: RequestHandler = async (req, res, next) => {
  try {
    const user = await authRepository.readByEmail(req.body.email);
    if (
      user == null ||
      !(await argon2.verify(user.password, req.body.password))
    ) {
      res.status(422).json({ message: "Wrong credentials" });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, firstname: user.firstname },
      process.env.APP_SECRET as string,
      {
        expiresIn: "1h",
      },
    );

    const refreshToken = jwt.sign(
      { sub: user.id, role: user.role, firstname: user.firstname },
      process.env.REFRESH_SECRET as string,
      { expiresIn: "7d" },
    );

    await authRepository.updateRefreshToken(user.id, refreshToken);

    res
      .cookie("access_token", token, { httpOnly: true, secure: false })
      .cookie("refresh_token", refreshToken, { httpOnly: true, secure: false })
      .status(200)
      .json({
        message: "Login success !",
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};

const refresh: RequestHandler = async (req, res, _next) => {
  const { token: clientToken } = req.body;

  if (!clientToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(
      clientToken,
      process.env.REFRESH_SECRET as string,
    ) as jwt.JwtPayload;

    const user = await authRepository.readById(Number(decoded.sub));

    if (!user || user.refreshToken !== clientToken) {
      return res.status(403).json({ message: "Token invalid or already used" });
    }

    const newToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.APP_SECRET as string,
      { expiresIn: "1h" },
    );

    res.json({ token: newToken });
  } catch (_err) {
    res.status(403).json({ message: "Session expired" });
  }
};

const register: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, city, zipcode, adress, email, password } =
    req.body;
  try {
    if (
      !firstName ||
      !lastName ||
      !city ||
      !zipcode ||
      !adress ||
      !email ||
      !password
    ) {
      res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }
    const check = await authRepository.readByEmail(req.body.email);
    if (check) {
      res
        .status(422)
        .json({ message: "You already have an account, try loggin in." });
      return;
    }
    const hashedPassword = await argon2.hash(req.body.password);
    await authRepository.createUser(req.body, hashedPassword);
    next();
  } catch (err) {
    next(err);
  }
};
const logout: RequestHandler = (_req, res) => {
  const userAuth = _req.auth as jwt.JwtPayload;
  const userId = Number(userAuth.sub);

  authRepository.updateRefreshToken(userId, null).catch((err) => {
    console.error("Error clearing refresh token on logout:", err);
  });

  res
    .clearCookie("refresh_token")
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Logout success !" });
};

const checkAuth: RequestHandler = (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      res.sendStatus(401);
      return;
    }

    const decoded = jwt.verify(token, process.env.APP_SECRET as string);

    if (typeof decoded === "object" && decoded !== null && "role" in decoded) {
      req.auth = decoded as jwt.JwtPayload & { role: number } & {
        firstname: string;
      };
      req.user = {
        id: Number(decoded.sub),
        email: decoded.email || "",
        role: decoded.role,
      };
    }

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.sendStatus(401);
  }
};

const adminLogMiddleware: RequestHandler = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const audit = res.locals.auditLog;
    if (audit && res.statusCode >= 200 && res.statusCode < 300) {
      const userId = Number(req.auth?.sub);
      const logData = {
        superuser_id: !Number.isNaN(userId) ? userId : 0,
        action_type: audit.action_type || "unknown",
        target_table: audit.target_table || "unknown",
        target_id: Number(audit.target_id) || 0,
        details: audit.details || null,
      };

      adminLogRepository.create(logData).catch((err) => {
        console.error("❌ Erreur lors de l'enregistrement du log:", err);
      });
    }

    return originalJson.call(this, data);
  };

  next();
};
const verifyAdmin: RequestHandler = (req, res, next) => {
  try {
    if (req.auth?.role !== 1) {
      res.sendStatus(403);
      return;
    }
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(403);
  }
};
const initResetPassword: RequestHandler = async (req, res, next) => {
  // Use the Upstream version: Real email sending logic
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const { email } = req.body;
    const user = await authRepository.readByEmail(email);

    if (user) {
      const logoPath = path.join(
        process.cwd(),
        "../client/public/Logo_top.png",
      );

      const resetLink = `${process.env.CLIENT_URL}/reset-password/${jwt.sign(
        { sub: user.id },
        process.env.APP_SECRET as string,
        { expiresIn: "1h" },
      )}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset",
        text: `Password reset link: ${resetLink}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="cid:unique-logo-id" alt="Logo" style="width: 100px; height: auto;" />
            </div>

            <h2 style="color: #333;">Forgot your password?</h2>
            <p>You requested a password reset. Click the button below to set a new one:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #ccff33; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 12px; color: #888;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "unique-logo-id",
          },
        ],
      });
    }

    res.status(200).json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    // 1. Validate with Joi (assuming you pass req.body to a validation helper)
    // This replaces your manual Regex check and 'if (!newPassword)' checks
    const { error, value } = resetPasswordSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        errors: error.details.map((err) => err.message),
      });
    }

    const { token, newPassword } = value;

    // 2. Single JWT verification (Redundancy removed)
    const decoded = jwt.verify(
      token,
      process.env.APP_SECRET as string,
    ) as jwt.JwtPayload;

    // 3. Fetch user once
    const user = await authRepository.readById(Number(decoded.sub));

    if (!user) {
      return res.status(400).json({ message: "Invalid token." });
    }

    // 5. Hash and Update
    const hashedPassword = await argon2.hash(newPassword);
    await authRepository.updatePassword(Number(decoded.sub), hashedPassword);

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    next(err);
  }
};

const check: RequestHandler = (req, res) => {
  (async () => {
    try {
      const decoded = req.auth as jwt.JwtPayload;
      const userId = Number(decoded?.sub);

      let favoritesIds: number[] = [];
      if (Number.isInteger(userId) && userId > 0) {
        const usersFavorites =
          await favoriteRepository.getFavoritesIDByUserID(userId);
        favoritesIds = usersFavorites.map((item) => item.announces_id);
      }

      res.status(200).json({
        user: {
          id: Number(decoded?.sub),
          role: decoded?.role,
          firstname: decoded?.firstname,
          favoritesIds,
        },
        message: "user logged in",
      });
    } catch (_err) {
      // Fallback: return minimal auth object if something goes wrong
      res.status(200).json({ user: req.auth, message: "user logged in" });
    }
  })();
};

export default {
  login,
  logout,
  checkAuth,
  check,
  initResetPassword,
  resetPassword,
  verifyAdmin,
  register,
  adminLogMiddleware,
  refresh,
};
