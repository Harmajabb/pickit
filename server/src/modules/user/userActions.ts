import type { RequestHandler } from "express";
import announcesRepository from "../announces/announcesRepository";
import userRepository from "./userRepository";

const readProfileById: RequestHandler = async (req, res, next) => {
  try {
    console.log("readProfileById called with:", req.params.id);

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    const user = await userRepository.readById(id);
    console.log("user =", user);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const items = await announcesRepository.readByOwnerId(id);
    console.log("items length =", items.length);

    res.json({ user, items });
  } catch (err) {
    console.error("readProfileById error:", err);
    next(err);
  }
};

export default {
  readProfileById,
};
