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
const createAnnounce: RequestHandler = async (req, res, next) => {
  try {
    console.log(req.body);
    await announcesRepository.sendCreateAnnounce(req.body);
    res.status(201).json({
      success: true,
      message: "Successful listing !",
    });
  } catch (err) {
    next(err);
  }
};
export default { browse, browseFiltered, createAnnounce };
