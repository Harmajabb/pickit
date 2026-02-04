import type { RequestHandler } from "express";
import searchRepository from "./searchRepository";

const search: RequestHandler = async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const tab = req.query.tab === "users" ? "users" : "announces";

    // if query is too short, return empty array
    if (q.length < 2) {
      res.json([]);
      return;
    }

    // perform search based on tab
    const results =
      tab === "users"
        ? await searchRepository.searchUsers(q)
        : await searchRepository.searchAnnounces(q);

    res.json(results);
  } catch (err) {
    next(err);
  }
};

const searchFullAnnounces: RequestHandler = async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const filters = {
      q,
      zipcode: req.query.zipcode as string,
      category_id: req.query.category_id as string,
    };

    if (q === "") {
      res.json([]);
      return;
    }

    const announcesFromDB = await searchRepository.searchFullAnnounces(filters);
    const formattedAnnounces = announcesFromDB.map((announce) => ({
      ...announce,
      all_images: announce.all_images ? announce.all_images.split(",") : [],
    }));
    res.json(formattedAnnounces);
  } catch (err) {
    next(err);
  }
};

export default { search, searchFullAnnounces };
