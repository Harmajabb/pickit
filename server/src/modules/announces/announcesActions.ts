// imports
import announcesRepository from "./announcesRepository";

import type { RequestHandler } from "express";

// browse announces
const browse: RequestHandler = async (req, res, next) => {
  try {
    const announcesFromDB = await announcesRepository.readAll();

    res.json(announcesFromDB);
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
