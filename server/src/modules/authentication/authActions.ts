import argon2 from "argon2";
import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import authRepository from "./authRepository";

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
    console.log(user);
    if (
      user == null ||
      !(await argon2.verify(user.password, req.body.password))
    ) {
      res.status(422).json({ message: "Wrong credentials" });
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
  // console.log("req cookie", req.cookies);
  // console.log("req header.cookie", req.header.cookie);
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
const check: RequestHandler = (req, res) => {
  res.status(200).json({
    user: req.auth,
    message: "user logged in",
  });
};

export default { login, logout, checkAuth, check };
