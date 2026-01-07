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

// Lire une annonce spécifique
const readOne: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announce = await announcesRepository.readOne(Number(id));

    if (!announce) {
      return res.status(404).json({ error: "Annonce non trouvée" });
    }

    const formattedAnnounce = {
      ...announce,
      all_images: announce.all_images ? announce.all_images.split(",") : [],
    };

    res.json(formattedAnnounce);
  } catch (err) {
    next(err);
  }
};

// Mettre à jour une annonce
const updateAnnounce: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await announcesRepository.sendUpdateAnnounce(Number(id), req.body);

    res.json({
      success: true,
      message: "Annonce mise à jour !",
    });
  } catch (err) {
    next(err);
  }
};
export default { browse, browseFiltered, createAnnounce, readOne, updateAnnounce };
