import type { RequestHandler } from "express";
import reportRepository from "./reportRepository";

const report: RequestHandler = async (req, res, next) => {
  try {
    // ✨ AJOUT : Récupérer l'ID de l'utilisateur connecté
    const reporter_id = req.auth?.sub;

    if (!reporter_id) {
      return res.status(401).json({
        message: "You must be authenticated to report",
      });
    }

    if (reporter_id === req.body.reported_user_id) {
      return res.status(403).json({ message: "You cannot report yourself" });
    }

    const newReport = {
      reporter_id: Number(reporter_id), // ✨ AJOUTÉ
      description: req.body.description || null,
      reason: req.body.reason,
      status: "pending", // ✨ MODIFIÉ : minuscule
      reported_user_id: req.body.reported_user_id || null,
      reported_conversations_id: req.body.reported_conversations_id || null,
      reported_announce_id: req.body.reported_announce_id || null,
    };

    await reportRepository.create(newReport);
    res.status(201).json({ message: "Your report has been received" });
  } catch (err) {
    next(err);
  }
};

export default { report };
