import authRepository from "./authRepository";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import type { RequestHandler, Request } from "express";

declare global {
  namespace Express {
    interface Request {
      auth?: string | jwt.JwtPayload;
    }
  }
}

const login: RequestHandler = async (req, res, next) => {
  try {
    const user = await authRepository.readByEmail(req.body.email);

    if (
      user == null ||
      !(await argon2.verify(user.hashed_password, req.body.password))
    ) {
      res.status(422).json({ message: "Identifiants incorrects" });
      return;
    }

    const token = jwt.sign({ sub: user.id }, process.env.APP_SECRET as string, {
      expiresIn: "1h",
    });

    res
      .cookie("access_token", token, { httpOnly: true, secure: false })
      .status(200)
      .json({
        message: "Login success !",
        user: { id: user.id, email: user.email },
      });
  } catch (err) {
    next(err);
  }
};

const logout: RequestHandler = (req, res) => {
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

    req.auth = decoded;

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
};

export default { login, logout, checkAuth };
