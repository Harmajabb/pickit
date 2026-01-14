// imports
import type { RequestHandler } from "express";
import announcesRepository from "./announcesRepository";
// browse announces
const browse: RequestHandler = async (req, res, next) => {
  try {
    const announcesFromDB = await announcesRepository.readAll();
    const formattedAnnounces = announcesFromDB.map((announce) => ({
      ...announce,
      all_images: announce.all_images ? announce.all_images.split(",") : [],
    }));
    res.json(formattedAnnounces);
  } catch (err) {
    next(err);
  }
};

const browseFiltered: RequestHandler = async (req, res, next) => {
  try {
    const readFiltered = await announcesRepository.readFiltered();

    res.json(readFiltered);
  } catch (err) {
    next(err);
  }
};

const destroy: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.query.id);

    const resultDelete = await announcesRepository.delete(id);
    console.log(resultDelete);
    if (resultDelete.affectedRows === 0) {
      res.status(404).json({ message: "Annonce non trouvée" });
      return;
    }

    res.json({ message: "La suppression s'est bien passée" });
  } catch (err) {
    next(err);
  }
};

export default { browse, browseFiltered, destroy };
