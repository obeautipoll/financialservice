import { useEffect, useState } from "react";
import { ensureSupabase } from "../supabase.js";

const formatSubmittedAt = (value) => {
  if (!value) {
    return "No timestamp";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

function ContactLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");

  const loadLeads = async () => {
    try {
      setLoading(true);
      setMessage("");

      const { data, error } = await ensureSupabase()
        .from("contact_leads")
        .select("id, full_name, phone, status, created_at")
        .eq("source_page", "contact")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setLeads(data || []);
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Unable to load contact requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const markContacted = async (leadId) => {
    try {
      setSavingId(leadId);
      setMessage("");

      const { error } = await ensureSupabase()
        .from("contact_leads")
        .update({ status: "contacted" })
        .eq("id", leadId);

      if (error) {
        throw error;
      }

      setTone("success");
      setMessage("Contact request updated.");
      await loadLeads();
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Unable to update contact request.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <section className="contact-leads-admin">
      <div className="contact-leads-admin-head">
        <div>
          <p className="eyebrow">Contact Requests</p>
          <h3>Name and Number Submissions</h3>
          <p>These are people who submitted the simple contact form.</p>
        </div>
        <button className="secondary-button" disabled={loading} onClick={loadLeads} type="button">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="contact-leads-summary">
        <strong>{leads.length}</strong>
        <span>Total request{leads.length === 1 ? "" : "s"}</span>
      </div>

      {message ? <p className={`status-message${tone === "error" ? " error" : ""}`}>{message}</p> : null}

      {loading ? (
        <p className="contact-leads-empty">Loading contact requests...</p>
      ) : leads.length ? (
        <div className="contact-leads-list">
          {leads.map((lead) => (
            <article className="contact-lead-card" key={lead.id}>
              <div>
                <span>Name</span>
                <strong>{lead.full_name || "No name"}</strong>
              </div>
              <div>
                <span>Number</span>
                <a href={lead.phone ? `tel:${String(lead.phone).replace(/[^\d+]/g, "")}` : undefined}>
                  {lead.phone || "No number"}
                </a>
              </div>
              <div>
                <span>Date Submitted</span>
                <strong>{formatSubmittedAt(lead.created_at)}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{lead.status === "contacted" ? "Contacted" : "New"}</strong>
              </div>
              <button
                className="secondary-button"
                disabled={savingId === lead.id || lead.status === "contacted"}
                onClick={() => markContacted(lead.id)}
                type="button"
              >
                {lead.status === "contacted" ? "Done" : "Mark Contacted"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="contact-leads-empty">No contact requests yet.</p>
      )}
    </section>
  );
}

export default ContactLeads;
