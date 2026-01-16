import type { RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken"; // allow to get the token from req.auth
import announcesRepository from "../announces/announcesRepository";
import userRepository from "./userRepository";

// get my profile (only for authenticated user - private data only)
const readMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const decoded = req.auth as JwtPayload; //middleware checkAuth
    const userId = Number(decoded.sub);

    //unauthorized user if no good ID
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // only private user data
    const user = await userRepository.readPrivateById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // only user is back
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// get user profile (we got user, item, favorites)
const readProfileById: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id); // take ID from URL

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    // fetch public data
    const user = await userRepository.readById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // take back items and favorites for user profile seen by others
    const items = await announcesRepository.readByOwnerId(id);
    const favorites = await announcesRepository.readFavoritesByUserId(id);

    res.json({ user, items, favorites });
  } catch (err) {
    next(err);
  }
};

export default {
  readProfileById,
  readMyProfile,
};
