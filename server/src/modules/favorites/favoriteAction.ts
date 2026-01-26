import type { RequestHandler } from "express";
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
  console.log("req.body : ", req.body);
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
export default { addFavoriteHandler, delFavoriteHandler };
