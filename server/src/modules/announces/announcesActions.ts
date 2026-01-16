import type { RequestHandler } from "express";
import type { CreateAnnounceInput } from "./announcesRepository";

import announcesRepository from "./announcesRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const filters = {
      zipcode:
        typeof req.query.zipcode === "string" ? req.query.zipcode : undefined,
      category_id:
        typeof req.query.category_id === "number"
          ? req.query.category_id
          : undefined,
    };
    console.log(filters);

    const announcesFromDB = await announcesRepository.readAll(filters);
    const formattedAnnounces = announcesFromDB.map((announce) => ({
      ...announce, // spread opetator
      all_images: announce.all_images ? announce.all_images.split(",") : [],
    }));
    res.json(formattedAnnounces);
  } catch (err) {
    next(err);
  }
};

const browseFiltered: RequestHandler = async (_req, res, next) => {
  try {
    // Sends the whole object res.query to the repository
    const readFiltered = await announcesRepository.readFiltered();
    res.json(readFiltered);
  } catch (err) {
    next(err);
  }
};

const createAnnounce: RequestHandler = async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];

    const {
      title,
      description,
      amount_deposit,
      start_borrow_date,
      end_borrow_date,
      location,
      categorie_id,
      owner_id,
      state_of_product,
    } = req.body;

    if (
      !title ||
      !description ||
      !amount_deposit ||
      !start_borrow_date ||
      !end_borrow_date ||
      !location ||
      !categorie_id ||
      !owner_id ||
      !state_of_product
    ) {
      res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
      return;
    }

    const payload: CreateAnnounceInput = {
      title: String(title),
      description: String(description),
      amount_deposit: Number(amount_deposit),
      start_borrow_date: String(start_borrow_date),
      end_borrow_date: String(end_borrow_date),
      location: String(location),
      categorie_id: Number(categorie_id),
      owner_id: Number(owner_id),
      state_of_product: String(state_of_product),
    };

    const announceId = await announcesRepository.sendCreateAnnounce(
      payload,
      files,
    );

    res.status(201).json({
      success: true,
      message: "Successful listing!",
      announceId,
      title: payload.title,
    });
  } catch (err) {
    next(err);
  }
};

// Read a specific announcement
const readOne: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announce = await announcesRepository.getOne(Number(id));

    if (!announce) {
      res.status(404).json({ error: "Annonce non trouvée" });
      return;
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

// Update an announcement
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
export default {
  browse,
  browseFiltered,
  createAnnounce,
  readOne,
  updateAnnounce,
};
