import { useEffect, useState } from "react";

const defaults = {
  site_name: "",
  logo_url: "",
  description: ""
};

function Dashboard({ config, onLogout, onSave, saveLoading, statusMessage }) {
  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (config) {
      setForm({
        site_name: config.site_name || "",
        logo_url: config.logo_url || "",
        description: config.description || ""
      });
    }
  }, [config]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(form);
  };

  return (
    <section className="card dashboard-card">
      <div className="dashboard-topbar">
        <div className="section-heading">
          <p className="eyebrow">CMS Dashboard</p>
          <h2>Edit landing page content</h2>
          <p>Changes are saved directly to the `landing_page_config` table.</p>
        </div>

        <button className="secondary-button" onClick={onLogout} type="button">
          Sign Out
        </button>
      </div>

      <div className="dashboard-layout">
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            <span>Site Name</span>
            <input
              name="site_name"
              onChange={handleChange}
              required
              type="text"
              value={form.site_name}
            />
          </label>

          <label>
            <span>Logo URL</span>
            <input
              name="logo_url"
              onChange={handleChange}
              type="url"
              value={form.logo_url}
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              name="description"
              onChange={handleChange}
              required
              rows="6"
              value={form.description}
            />
          </label>

          <button className="primary-button" disabled={saveLoading} type="submit">
            {saveLoading ? "Saving..." : "Save Content"}
          </button>
        </form>

        <aside className="preview-panel">
          <h3>Live Preview</h3>
          {form.logo_url ? (
            <img alt={form.site_name || "Site logo"} className="preview-logo" src={form.logo_url} />
          ) : (
            <div className="logo-placeholder">Logo Preview</div>
          )}
          <h4>{form.site_name || "Site name"}</h4>
          <p>{form.description || "Description preview will appear here."}</p>
        </aside>
      </div>

      {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
    </section>
  );
}

export default Dashboard;
