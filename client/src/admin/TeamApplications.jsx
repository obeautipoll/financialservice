import { useEffect, useState } from "react";
import { ensureSupabase } from "../supabase.js";

const statusLabels = {
  accepted: "Accepted",
  declined: "Declined",
  interview: "Interview",
  new: "New",
  reviewing: "Reviewing"
};

const experienceLabels = {
  experienced: "Experienced advisor or agent",
  new: "New to financial services",
  some: "Some sales or finance experience"
};

const formatSubmittedAt = (value) => {
  if (!value) {
    return "No timestamp";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

function TeamApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");

  const loadApplications = async () => {
    try {
      setLoading(true);
      setMessage("");

      const { data, error } = await ensureSupabase()
        .from("team_applications")
        .select("id, full_name, email, phone, location, experience_level, message, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setApplications(data || []);
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Unable to load team applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateStatus = async (applicationId, status) => {
    try {
      setSavingId(applicationId);
      setMessage("");

      const { error } = await ensureSupabase()
        .from("team_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) {
        throw error;
      }

      setTone("success");
      setMessage("Application updated.");
      await loadApplications();
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Unable to update application.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <section className="team-applications-admin">
      <div className="team-applications-head">
        <div>
          <p className="eyebrow">Recruitment</p>
          <h3>Team Applications</h3>
          <p>Review people who applied from the Join Our Team page.</p>
        </div>
        <button className="secondary-button" disabled={loading} onClick={loadApplications} type="button">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="team-applications-summary">
        <strong>{applications.length}</strong>
        <span>Total applicant{applications.length === 1 ? "" : "s"}</span>
      </div>

      {message ? <p className={`status-message${tone === "error" ? " error" : ""}`}>{message}</p> : null}

      {loading ? (
        <p className="team-applications-empty">Loading applications...</p>
      ) : applications.length ? (
        <div className="team-applications-list">
          {applications.map((application) => (
            <article className="team-application-card" key={application.id}>
              <div className="team-application-main">
                <div>
                  <span>Name</span>
                  <strong>{application.full_name || "No name"}</strong>
                </div>
                <div>
                  <span>Number</span>
                  <a href={application.phone ? `tel:${String(application.phone).replace(/[^\d+]/g, "")}` : undefined}>
                    {application.phone || "No number"}
                  </a>
                </div>
                <div>
                  <span>Email</span>
                  <a href={application.email ? `mailto:${application.email}` : undefined}>{application.email || "No email"}</a>
                </div>
                <div>
                  <span>Date Submitted</span>
                  <strong>{formatSubmittedAt(application.created_at)}</strong>
                </div>
              </div>

              <div className="team-application-details">
                <span>{application.location || "No location"}</span>
                <span>{application.experience_level ? experienceLabels[application.experience_level] || application.experience_level : "No experience selected"}</span>
                <strong>{statusLabels[application.status] || application.status}</strong>
              </div>

              {application.message ? <p className="team-application-message">{application.message}</p> : null}

              <div className="team-application-actions">
                <button
                  className="secondary-button"
                  disabled={savingId === application.id || application.status === "reviewing"}
                  onClick={() => updateStatus(application.id, "reviewing")}
                  type="button"
                >
                  Review
                </button>
                <button
                  className="secondary-button"
                  disabled={savingId === application.id || application.status === "interview"}
                  onClick={() => updateStatus(application.id, "interview")}
                  type="button"
                >
                  Interview
                </button>
                <button
                  className="secondary-button"
                  disabled={savingId === application.id || application.status === "accepted"}
                  onClick={() => updateStatus(application.id, "accepted")}
                  type="button"
                >
                  Accept
                </button>
                <button
                  className="secondary-button"
                  disabled={savingId === application.id || application.status === "declined"}
                  onClick={() => updateStatus(application.id, "declined")}
                  type="button"
                >
                  Decline
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="team-applications-empty">No team applications yet.</p>
      )}
    </section>
  );
}

export default TeamApplications;
