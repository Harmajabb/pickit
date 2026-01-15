import type { RequestHandler } from "express";
import adminRepository from "./adminRepository";

const getDashboardStats: RequestHandler = async (_req, res, next) => {
  try {
    const stats = await adminRepository.getStats();
    res.json(stats || { userCount: 0, reportCount: 0, announcementCount: 0 });
  } catch (err) {
    next(err);
  }
};

export default { getDashboardStats };
