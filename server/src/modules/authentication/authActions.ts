import path from "node:path";
import argon2 from "argon2";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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

    res
      .cookie("access_token", token, { httpOnly: true, secure: false })
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

const logout: RequestHandler = (_req, res) => {
  res
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
    }

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
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

      const resetLink = `http://${process.env.CLIENT_URL}/reset-password/${jwt.sign(
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
    const { token, newPassword } = req.body;

    // Cleaned up duplicate code block here
    const decoded = jwt.verify(
      token,
      process.env.APP_SECRET as string,
    ) as jwt.JwtPayload;

    const hashedPassword = await argon2.hash(newPassword);

    await authRepository.updatePassword(
      Number(decoded.sub) as number,
      hashedPassword,
    );

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    next(err);
  }
};

const check: RequestHandler = (req, res) => {
  res.status(200).json({
    user: req.auth,
    message: "user logged in",
  });
};

export default {
  login,
  logout,
  checkAuth,
  check,
  initResetPassword,
  resetPassword,
  verifyAdmin,
};
