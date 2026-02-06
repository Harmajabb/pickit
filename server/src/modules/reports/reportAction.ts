import type { RequestHandler } from "express";
import reportRepository, { type report as Report } from "./reportRepository";

interface ReportResponse extends Report {
  reporter_firstname?: string;
  reporter_lastname?: string;
  reported_firstname?: string;
  reported_lastname?: string;
}

interface FormattedReport {
  id?: number;
  reporter_id: number;
  reported_user_id: number | null;
  reported_announce_id: number | null;
  reported_conversations_id: number | null;
  reported_review_id: number | null;
  reason: string;
  description: string | null;
  status: string;
  creation_date?: string;
  handled_by?: number | null;
  resolution_note?: string | null;
  reporter_name: string;
  reported_name: string;
}

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
      reason: req.body.reason,
      description: req.body.description || null,
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
    const reports = (await reportRepository.browse()) as ReportResponse[];
    const formattedReports = reports.map(
      (r: ReportResponse): FormattedReport => ({
        id: r.id,
        reporter_id: r.reporter_id,
        reported_user_id: r.reported_user_id,
        reported_announce_id: r.reported_announce_id,
        reported_conversations_id: r.reported_conversations_id,
        reported_review_id: r.reported_review_id,
        reason: r.reason,
        description: r.description,
        status: r.status,
        creation_date: r.creation_date,
        handled_by: r.handled_by,
        resolution_note: r.resolution_note,
        reporter_name: r.reporter_firstname
          ? `${r.reporter_firstname} ${r.reporter_lastname}`
          : "Inconnu",
        reported_name: r.reported_firstname
          ? `${r.reported_firstname} ${r.reported_lastname}`
          : "Inconnu",
      }),
    );
    res.json({ reports: formattedReports });
  } catch (err) {
    next(err);
  }
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await reportRepository.readById(Number(id));

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const typedReport = report as ReportResponse;
    const formattedReport: FormattedReport = {
      id: typedReport.id,
      reporter_id: typedReport.reporter_id,
      reported_user_id: typedReport.reported_user_id,
      reported_announce_id: typedReport.reported_announce_id,
      reported_conversations_id: typedReport.reported_conversations_id,
      reported_review_id: typedReport.reported_review_id,
      reason: typedReport.reason,
      description: typedReport.description,
      status: typedReport.status,
      creation_date: typedReport.creation_date,
      handled_by: typedReport.handled_by,
      resolution_note: typedReport.resolution_note,
      reporter_name: typedReport.reporter_firstname
        ? `${typedReport.reporter_firstname} ${typedReport.reporter_lastname}`
        : "Inconnu",
      reported_name: typedReport.reported_firstname
        ? `${typedReport.reported_firstname} ${typedReport.reported_lastname}`
        : "Inconnu",
    };

    res.json(formattedReport);
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution_note } = req.body;
    const admin_id = req.auth?.sub;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["pending", "in_progress", "resolved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await reportRepository.update(
      Number(id),
      status,
      admin_id ? Number(admin_id) : undefined,
      resolution_note || undefined,
    );
    res.json({ message: "Report status updated successfully" });
  } catch (err) {
    next(err);
  }
};

const destroy: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reportRepository.delete(Number(id));
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export default { report, browse, read, edit, destroy };
