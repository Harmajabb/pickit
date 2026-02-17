import { CheckCircle2, Clock, Eye, Trash2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import "./ReportManager.css";

export interface Report {
  id: number;
  reporter_id: number;
  reported_user_id: number | null;
  reported_announce_id: number | null;
  reported_conversations_id: number | null;
  reported_review_id: number | null;
  reason: string;
  description: string | null;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  handled_by: number | null;
  resolution_note: string | null;
  creation_date: string;
  reporter_name?: string;
  reported_name?: string;
}

interface ReportDetail extends Report {
  reporter_name: string;
  reported_name: string;
}

function ReportManager() {
  const base_url = import.meta.env.VITE_API_URL;
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${base_url}/api/reports`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusChange = async (reportId: number, newStatus: string) => {
    try {
      const response = await fetch(`${base_url}/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setReports(
          reports.map((r) =>
            r.id === reportId
              ? { ...r, status: newStatus as Report["status"] }
              : r,
          ),
        );
        if (selectedReport?.id === reportId) {
          setSelectedReport({
            ...selectedReport,
            status: newStatus as Report["status"],
          });
        }
      } else alert("Error updating report status");
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating report status");
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const response = await fetch(`${base_url}/api/reports/${reportId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setReports(reports.filter((r) => r.id !== reportId));
        if (selectedReport?.id === reportId) setSelectedReport(null);
      } else alert("Error deleting report");
    } catch (error) {
      console.error("Error:", error);
      alert("Error deleting report");
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!r || !r.status) return false;
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  const getStatusIcon = (status: string | null | undefined) => {
    switch (status) {
      case "pending":
        return <Clock size={18} className="status-icon pending" />;
      case "in_progress":
        return <Eye size={18} className="status-icon in-progress" />;
      case "resolved":
        return <CheckCircle2 size={18} className="status-icon resolved" />;
      case "rejected":
        return <XCircle size={18} className="status-icon rejected" />;
      default:
        return null;
    }
  };

  const getTargetType = (report: Report): string => {
    if (report.reported_announce_id) return "Announcement";
    if (report.reported_user_id) return "User";
    if (report.reported_conversations_id) return "Message";
    if (report.reported_review_id) return "Review";
    return "Unknown";
  };

  return (
    <>
      <div className="report-manager">
        <div className="report-manager-header">
          <h2>Report Management</h2>
          <p>Total Reports: {reports.length}</p>
        </div>

        <div className="report-manager-container">
          <div className="report-filters">
            <h3>Filter by Status</h3>
            <div className="filter-buttons">
              <button
                type="button"
                className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All ({reports.length})
              </button>
              <button
                type="button"
                className={`filter-btn ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending ({reports.filter((r) => r.status === "pending").length})
              </button>
              <button
                type="button"
                className={`filter-btn ${statusFilter === "in_progress" ? "active" : ""}`}
                onClick={() => setStatusFilter("in_progress")}
              >
                In Progress (
                {reports.filter((r) => r.status === "in_progress").length})
              </button>
              <button
                type="button"
                className={`filter-btn ${statusFilter === "resolved" ? "active" : ""}`}
                onClick={() => setStatusFilter("resolved")}
              >
                Resolved (
                {reports.filter((r) => r.status === "resolved").length})
              </button>
              <button
                type="button"
                className={`filter-btn ${statusFilter === "rejected" ? "active" : ""}`}
                onClick={() => setStatusFilter("rejected")}
              >
                Rejected (
                {reports.filter((r) => r.status === "rejected").length})
              </button>
            </div>
          </div>

          <div className="report-list-container">
            {error && <div className="error-message">{error}</div>}
            {loading ? (
              <div className="loading">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="empty-state">
                <p>No reports found with this filter</p>
              </div>
            ) : (
              <div className="report-list">
                {filteredReports
                  .filter((r) => r?.id)
                  .map((report) => {
                    if (!report || !report.id) return null;
                    return (
                      <div key={report.id} className="report-card">
                        <div className="report-header">
                          <div className="report-status">
                            {getStatusIcon(report.status)}
                            <span className={`status-badge ${report.status}`}>
                              {report.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="report-date">
                            {new Date(report.creation_date).toLocaleDateString(
                              "en-US",
                            )}
                          </div>
                        </div>

                        <div className="report-content">
                          <div className="report-meta">
                            <p>
                              <strong>Type:</strong> {getTargetType(report)}
                            </p>
                            <p>
                              <strong>Reason:</strong> {report.reason}
                            </p>
                          </div>

                          <p className="report-description">
                            <strong>Description:</strong>{" "}
                            {report.description || "No description provided"}
                          </p>

                          <div className="report-actions">
                            <button
                              type="button"
                              className="btn-view"
                              onClick={() => {
                                const detail: ReportDetail = {
                                  ...report,
                                  reporter_name:
                                    report.reporter_name || "Unknown",
                                  reported_name:
                                    report.reported_name || "Unknown",
                                };
                                setSelectedReport(detail);
                              }}
                            >
                              View Details
                            </button>
                            {report.status !== "resolved" && (
                              <select
                                value={report.status}
                                onChange={(e) =>
                                  handleStatusChange(report.id, e.target.value)
                                }
                                className="status-select"
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            )}
                            <button
                              type="button"
                              className="btn-delete"
                              onClick={() => handleDeleteReport(report.id)}
                              title="Delete report"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedReport?.id && (
        <button
          className="modal-overlay"
          onClick={() => setSelectedReport(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSelectedReport(null);
            }
          }}
          type="button"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h3>Report Details</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedReport(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="label">ID:</span>
                <span className="value">#{selectedReport?.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span
                  className={`value status-badge ${selectedReport?.status}`}
                >
                  {selectedReport?.status === "pending"
                    ? "Pending"
                    : selectedReport?.status === "in_progress"
                      ? "In Progress"
                      : selectedReport?.status === "resolved"
                        ? "Resolved"
                        : "Rejected"}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{getTargetType(selectedReport)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Reason:</span>
                <span className="value">{selectedReport?.reason || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="label">Description:</span>
                <p className="value description">
                  {selectedReport?.description || "No description provided"}
                </p>
              </div>
              <div className="detail-row">
                <span className="label">Reported by:</span>
                <span className="value">
                  {selectedReport?.reporter_name || "Unknown"}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Reported Entity:</span>
                <span className="value">
                  {selectedReport?.reported_name || "Unknown"}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">
                  {selectedReport?.creation_date
                    ? new Date(selectedReport.creation_date).toLocaleString(
                        "en-US",
                      )
                    : "N/A"}
                </span>
              </div>
              {selectedReport?.handled_by && (
                <div className="detail-row">
                  <span className="label">Handled by:</span>
                  <span className="value">
                    Admin ID: {selectedReport.handled_by}
                  </span>
                </div>
              )}
              {selectedReport?.resolution_note && (
                <div className="detail-row">
                  <span className="label">Resolution Note:</span>
                  <p className="value description">
                    {selectedReport.resolution_note}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedReport?.status !== "resolved" && (
                <select
                  value={selectedReport?.status || ""}
                  onChange={(e) => {
                    if (selectedReport?.id) {
                      handleStatusChange(selectedReport.id, e.target.value);
                      setSelectedReport(null);
                    }
                  }}
                  className="status-select-modal"
                >
                  <option value="pending">Mark as Pending</option>
                  <option value="in_progress">Mark as In Progress</option>
                  <option value="resolved">Mark as Resolved</option>
                  <option value="rejected">Mark as Rejected</option>
                </select>
              )}
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </button>
      )}
    </>
  );
}

export default ReportManager;
