import type { RequestHandler } from "express";
import type { CreateAnnounceInput } from "./announcesRepository";

import announcesRepository from "./announcesRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const filters = {
      zipcode:
        typeof req.query.zipcode === "string" ? req.query.zipcode : undefined,
      category_id:
        typeof req.query.category_id === "string"
          ? req.query.category_id
          : undefined,
    };

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

const destroy: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.query.id);

    const resultDelete = await announcesRepository.delete(id);
    if (resultDelete.affectedRows === 0) {
      res.status(404).json({ message: "Annonce non trouvée" });
      return;
    }

    res.json({ message: "La suppression s'est bien passée" });
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
      zipcode,
      location,
      category_id,
      owner_id,
      state_of_product,
    } = req.body;

    if (
      !title ||
      !description ||
      !amount_deposit ||
      !start_borrow_date ||
      !end_borrow_date ||
      !zipcode ||
      !location ||
      !category_id ||
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
      zipcode: String(zipcode),
      location: String(location),
      category_id: Number(category_id),
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
// Remplacer la fonction updateAnnounce dans announcesActions.ts

const updateAnnounce: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announceId = Number(id);

    // Mettre à jour les données de l'annonce
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      amount_deposit: Number(req.body.amount_deposit),
      zipcode: req.body.zipcode,
      location: req.body.location,
      start_borrow_date: req.body.start_borrow_date,
      end_borrow_date: req.body.end_borrow_date,
      category_id: Number(req.body.category_id),
      state_of_product: req.body.state_of_product,
    };

    await announcesRepository.sendUpdateAnnounce(announceId, updateData);

    // Gérer la suppression des anciennes images
    const imagesToDelete = req.body.deleted_images;
    if (imagesToDelete) {
      const images = Array.isArray(imagesToDelete)
        ? imagesToDelete
        : [imagesToDelete];
      for (const imageUrl of images) {
        await announcesRepository.deleteImage(imageUrl, announceId);
      }
    }

    // Ajouter les nouvelles images
    const newFiles = req.files as Express.Multer.File[] | undefined;
    if (newFiles && newFiles.length > 0) {
      await announcesRepository.addImages(announceId, newFiles);
    }

    // Récupérer l'annonce mise à jour avec toutes ses images
    const updatedAnnounce = await announcesRepository.getOne(announceId);

    const formattedAnnounce = {
      ...updatedAnnounce,
      all_images: updatedAnnounce?.all_images
        ? updatedAnnounce.all_images.split(",")
        : [],
    };

    res.json({
      success: true,
      message: "Announcement updated !",
      announce: formattedAnnounce,
    });
  } catch (err) {
    next(err);
  }
};

const readMyAnnounces: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.auth?.sub;

    if (!userId) {
      res.status(401).json({ error: "Unauthenticated !" });
      return;
    }

    const announces = await announcesRepository.readMyAnnounces(Number(userId));

    res.json(announces);
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
  destroy,
  readMyAnnounces,
};
