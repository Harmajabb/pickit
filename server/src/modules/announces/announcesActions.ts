import type { RequestHandler } from "express";
import type { Announces } from "./announcesRepository";
import announcesRepository from "./announcesRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const filters = {
      location: req.query.location,
      category_id: req.query.category_id,
    };
    const announcesFromDB = await announcesRepository.readAll(filters);
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
    // Sends the whole object rez.query to the repository
    const readFiltered = await announcesRepository.readFiltered();
    res.json(readFiltered);
  } catch (err) {
    next(err);
  }
};

const createAnnounce: RequestHandler = async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const {
      title,
      description,
      amount_deposit,
      start_borrow_date,
      end_borrow_date,
      location,
      state,
      categorie_id,
      owner_id,
    } = req.body;
    if (
      !title ||
      !description ||
      !amount_deposit ||
      !start_borrow_date ||
      !end_borrow_date ||
      !location ||
      !state ||
      !categorie_id ||
      !owner_id
    ) {
      res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }
    const payload: Announces = {
      title: String(title),
      description: String(description),
      amount_deposit: Number(amount_deposit),
      start_borrow_date: String(start_borrow_date),
      end_borrow_date: String(end_borrow_date),
      location: String(location),
      categorie_id: Number(categorie_id),
      owner_id: Number(owner_id),
      state: String(state),
    };
    let result: any;
    try {
      result = await announcesRepository.sendCreateAnnounce(
        payload,
        files ?? [],
      );
    } catch (err) {
      // remove uploaded files if any, because DB failed
      if (files && files.length > 0) {
        try {
          const fs = await import("node:fs/promises");
          const path = await import("node:path");
          for (const f of files) {
            const full = path.join(
              process.cwd(),
              "public/assets/images",
              f.filename,
            );
            try {
              await fs.unlink(full);
            } catch (_err) {}
          }
        } catch (_err) {}
      }
      throw err;
    }

    res.status(201).json({
      success: true,
      message: "Successful listing!",
      announceId: result.announceId,
      imagesUploaded: result.imagesCount,
      imagePaths: result.imagePaths,
      title: result.title,
    });
  } catch (err) {
    next(err);
  }
};

// Read a specific announcement
const readOne: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announce = await announcesRepository.readOne(Number(id));

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
