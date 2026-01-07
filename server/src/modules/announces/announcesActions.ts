// imports
import type { RequestHandler } from "express";
import announcesRepository from "./announcesRepository";
// browse announces
const browse: RequestHandler = async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const announcesFromDB =
      q === ""
        ? await announcesRepository.readAll()
        : await announcesRepository.readSearch(q);

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

export default { browse, browseFiltered };
