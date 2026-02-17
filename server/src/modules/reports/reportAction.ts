import type { RequestHandler } from "express";
import reportRepository from "./reportRepository";

const report: RequestHandler = async (req, res, next) => {
  try {
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
      reporter_id: Number(reporter_id),
      description: req.body.description || null,
      reason: req.body.reason,
      status: "pending",
      reported_user_id: req.body.reported_user_id || null,
      reported_conversations_id: req.body.reported_conversations_id || null,
      reported_announce_id: req.body.reported_announce_id || null,
      reported_review_id: req.body.reported_review_id || null,
    };

    await reportRepository.create(newReport);
    res.status(201).json({ message: "Your report has been received" });
  } catch (err) {
    next(err);
  }
};

const browse: RequestHandler = async (_req, res, next) => {
  try {
    const reports = await reportRepository.readAll();
    res.status(200).json(reports);
  } catch (err) {
    next(err);
  }
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reportData = await reportRepository.readById(id);

    if (!reportData) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    res.status(200).json(reportData);
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const adminId = Number(req.auth?.sub);
    const { status, resolution_note } = req.body;

    if (!status) {
      res.status(400).json({ message: "Status is required" });
      return;
    }

    const existing = await reportRepository.readById(id);
    if (!existing) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    await reportRepository.update(id, status, adminId, resolution_note || null);
    res.status(200).json({ message: "Report updated successfully" });
  } catch (err) {
    next(err);
  }
};

const destroy: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const existing = await reportRepository.readById(id);
    if (!existing) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    await reportRepository.deleteById(id);
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export default { report, browse, read, edit, destroy };
