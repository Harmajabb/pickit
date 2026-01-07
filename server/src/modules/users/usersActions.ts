// import
import type { RequestHandler } from "express";
import usersRepository from "./usersRepository";

// search users
const search: RequestHandler = async (req, res, next) => {
  try {
    // Get and sanitize the search query parameter
    // we assume q is a string and the trim deletes whitespace
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    // Return empty array if query is less than 2 characters
    if (q.length < 2) {
      res.json([]);
      return;
    }

    const users = await usersRepository.search(q);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export default { search };
