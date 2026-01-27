import type { RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken";
import favoriteRepository from "./favoriteRepository";

const addFavoriteHandler: RequestHandler = async (req, res, next) => {
  try {
    const dbres = await favoriteRepository.addFavorites(
      req.body.user_id,
      req.body.announce_id,
    );
    if (dbres.affectedRows > 0) {
      res.status(200).json({ message: "Item added succesfully to favorites" });
    } else {
      res.status(422).json({
        message: "An error as occured while adding this item to your favorites",
      });
    }
  } catch (err) {
    next(err);
  }
};
const delFavoriteHandler: RequestHandler = async (req, res, next) => {
  try {
    const dbres = await favoriteRepository.delFavorites(
      req.body.user_id,
      req.body.announce_id,
    );
    if (dbres.affectedRows > 0) {
      res
        .status(200)
        .json({ message: "Item successfully removed from favorites" });
    } else {
      res.status(422).json({
        message:
          "An error occurred while removing this item from your favorites",
      });
    }
  } catch (err) {
    next(err);
  }
};

// as connected user I want to get my favorites
const getMyFavorites: RequestHandler = async (req, res, next) => {
  try {
    const decoded = req.auth as JwtPayload; //middleware checkAuth
    const userId = Number(decoded.sub);

    if (!userId) {
      res.status(401).json({ message: "No authentified user" });
      return;
    }

    const favorites = await favoriteRepository.readFavoritesByUserId(userId);
    res.status(200).json(favorites);
  } catch (err) {
    next(err);
  }
};

// catch the favorites from a specific user
const getFavoritesByUserId: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ message: "invalid ID user" });
      return;
    }

    const favorites = await favoriteRepository.readFavoritesByUserId(userId);
    res.status(200).json(favorites);
  } catch (err) {
    next(err);
  }
};

export default {
  addFavoriteHandler,
  delFavoriteHandler,
  getMyFavorites,
  getFavoritesByUserId,
};
