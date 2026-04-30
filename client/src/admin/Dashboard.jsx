import { useEffect, useMemo, useState } from "react";

const siteDefaults = {
  site_name: "",
  logo_url: "",
  footer_cta_title: "",
  footer_cta_body: "",
  footer_cta_button_label: "",
  footer_cta_button_url: ""
};

const pageDefaults = {
  nav_label: "",
  page_title: "",
  page_description: "",
  seo_title: "",
  seo_description: "",
  hero_title: "",
  hero_body: "",
  hero_primary_button_label: "",
  hero_primary_button_url: "",
  hero_secondary_button_label: "",
  hero_secondary_button_url: "",
  hero_image_url: "",
  sort_order: 0,
  is_published: true
};

const sectionDefaults = {
  section_key: "",
  section_label: "",
  section_type: "content",
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  primary_button_label: "",
  primary_button_url: "",
  secondary_button_label: "",
  secondary_button_url: "",
  sort_order: 0,
  is_active: true
};

const itemDefaults = {
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  link_label: "",
  link_url: "",
  sort_order: 0,
  is_active: true
};

const sidebarGroups = [
  {
    title: "Website Content",
    items: [
      { id: "home", label: "Hero Section", helper: "home" },
      { id: "home-who-we-help", label: "Who We Help", helper: "home" },
      { id: "services", label: "Services Overview", helper: "services" },
      { id: "about-us", label: "Why Choose Us", helper: "about-us" },
      { id: "resources", label: "Resources", helper: "resources" },
      { id: "join-our-team", label: "Join Our Team", helper: "join-our-team" },
      { id: "contact", label: "Contact Us", helper: "contact" }
    ]
  },
  {
    title: "Leads & Assessment",
    items: [
      { id: "placeholder-new-leads", label: "New Leads", disabled: true },
      { id: "placeholder-results", label: "Assessment Results", disabled: true },
      { id: "placeholder-consultations", label: "Consultations", disabled: true }
    ]
  },
  {
    title: "Recruitment",
    items: [
      { id: "placeholder-team-applications", label: "Team Applications", disabled: true },
      { id: "placeholder-advisor-profiles", label: "Advisor Profiles", disabled: true }
    ]
  }
];

function ImageField({ folder, label, name, onChange, onUploadAsset, value }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const publicUrl = await onUploadAsset(file, folder);
      onChange({
        target: {
          name,
          type: "text",
          value: publicUrl
        }
      });
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-field">
      <label>
        <span>{label}</span>
        <input name={name} onChange={onChange} type="url" value={value} />
      </label>

      <div className="image-upload-row">
        <input accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" />
        <button className="secondary-button" disabled={!file || uploading} onClick={handleUpload} type="button">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

function SiteSettingsForm({ onSaveSiteSettings, onUploadAsset, saveLoading, siteForm, statusTone }) {
  return (
    <form className="card stack-form" onSubmit={onSaveSiteSettings}>
      <div className="section-heading">
        <p className="eyebrow">Site Settings</p>
        <h3>Global Settings</h3>
        <p>Shared brand and footer call-to-action content used across the landing pages.</p>
      </div>

      <div className="editor-grid">
        <label>
          <span>Site Name</span>
          <input name="site_name" required type="text" value={siteForm.site_name} onChange={siteForm.onChange} />
        </label>

        <ImageField
          folder="site-settings"
          label="Logo URL"
          name="logo_url"
          onChange={siteForm.onChange}
          onUploadAsset={onUploadAsset}
          value={siteForm.logo_url}
        />

        <label className="full-span">
          <span>Footer CTA Title</span>
          <input
            name="footer_cta_title"
            type="text"
            value={siteForm.footer_cta_title}
            onChange={siteForm.onChange}
          />
        </label>

        <label className="full-span">
          <span>Footer CTA Body</span>
          <textarea
            name="footer_cta_body"
            rows="4"
            value={siteForm.footer_cta_body}
            onChange={siteForm.onChange}
          />
        </label>

        <label>
          <span>Footer Button Label</span>
          <input
            name="footer_cta_button_label"
            type="text"
            value={siteForm.footer_cta_button_label}
            onChange={siteForm.onChange}
          />
        </label>

        <label>
          <span>Footer Button URL</span>
          <input
            name="footer_cta_button_url"
            type="text"
            value={siteForm.footer_cta_button_url}
            onChange={siteForm.onChange}
          />
        </label>
      </div>

      <div className="editor-actions">
        <button className="primary-button" disabled={saveLoading} type="submit">
          Save Global Settings
        </button>
        <span className={`dashboard-note${statusTone === "error" ? " error" : ""}`}>
          Shared settings affect every landing page.
        </span>
      </div>
    </form>
  );
}

function DashboardOverview({ pages }) {
  const publishedCount = pages.filter((page) => page.is_published).length;
  const sectionCount = pages.reduce((total, page) => total + (page.sections?.length || 0), 0);
  const itemCount = pages.reduce(
    (total, page) =>
      total +
      (page.sections || []).reduce((sectionTotal, section) => sectionTotal + (section.items?.length || 0), 0),
    0
  );
  const draftCount = pages.length - publishedCount;
  const quickPages = pages.slice(0, 3);

  return (
    <div className="dashboard-stack">
      <section className="overview-title">
        <div className="section-heading">
          <h3>Dashboard</h3>
          <p>Manage landing page content, section structure, and shared website settings.</p>
        </div>
      </section>

      <div className="overview-grid metrics-grid">
        <article className="metric-card">
          <span className="metric-kicker">Total Pages</span>
          <strong className="metric-value">{pages.length}</strong>
          <span className="metric-foot">All managed landing pages</span>
        </article>
        <article className="metric-card">
          <span className="metric-kicker">Published</span>
          <strong className="metric-value">{publishedCount}</strong>
          <span className="metric-foot">Live and visible to visitors</span>
        </article>
        <article className="metric-card">
          <span className="metric-kicker">Sections</span>
          <strong className="metric-value">{sectionCount}</strong>
          <span className="metric-foot">Structured content blocks</span>
        </article>
        <article className="metric-card">
          <span className="metric-kicker">Items</span>
          <strong className="metric-value">{itemCount}</strong>
          <span className="metric-foot">Cards, list entries, and rows</span>
        </article>
      </div>

      <div className="overview-board">
        <section className="card panel-card trend-panel">
          <div className="panel-head">
            <h4>Content Health</h4>
            <span>Overview</span>
          </div>

          <div className="mini-bars">
            <div className="mini-bar-row">
              <span>Published</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill navy" style={{ width: `${pages.length ? (publishedCount / pages.length) * 100 : 0}%` }} />
              </div>
              <strong>{publishedCount}</strong>
            </div>
            <div className="mini-bar-row">
              <span>Draft</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill gold" style={{ width: `${pages.length ? (draftCount / pages.length) * 100 : 0}%` }} />
              </div>
              <strong>{draftCount}</strong>
            </div>
            <div className="mini-bar-row">
              <span>Sections</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill slate" style={{ width: `${Math.min(sectionCount * 8, 100)}%` }} />
              </div>
              <strong>{sectionCount}</strong>
            </div>
          </div>
        </section>

        <section className="card panel-card breakdown-panel">
          <div className="panel-head">
            <h4>Structure Mix</h4>
            <span>Pages vs content</span>
          </div>

          <div className="donut-shell">
            <div className="donut-ring">
              <div className="donut-center">{itemCount}</div>
            </div>
            <div className="donut-legend">
              <span><i className="legend-dot navy" /> Pages</span>
              <span><i className="legend-dot gold" /> Sections</span>
              <span><i className="legend-dot slate" /> Items</span>
            </div>
          </div>
        </section>

        <section className="card panel-card quick-panel">
          <div className="panel-head">
            <h4>Quick Access</h4>
            <span>Common actions</span>
          </div>

          <div className="quick-actions">
            {quickPages.map((page) => (
              <button className="quick-action-btn" key={page.id} type="button">
                Edit {page.nav_label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="card panel-card table-panel">
        <div className="panel-head">
          <h4>Page Summary</h4>
          <span>{pages.length} records</span>
        </div>

        <div className="summary-table">
          <div className="summary-row summary-head">
            <span>Page</span>
            <span>Slug</span>
            <span>Status</span>
            <span>Sections</span>
          </div>
          {pages.map((page) => (
            <div className="summary-row" key={page.id}>
              <span>{page.nav_label}</span>
              <span>/{page.slug}</span>
              <span>{page.is_published ? "Published" : "Draft"}</span>
              <span>{page.sections?.length || 0}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DatabaseStatusBanner({ cmsDataSource, cmsError, cmsLoading }) {
  if (cmsLoading) {
    return (
      <section className="database-status-banner">
        <div>
          <strong>Loading Supabase content</strong>
          <span>Checking the CMS tables before enabling admin CRUD.</span>
        </div>
      </section>
    );
  }

  const connected = cmsDataSource === "database";

  return (
    <section className={`database-status-banner${connected ? "" : " error"}`}>
      <div>
        <strong>{connected ? "Connected to Supabase" : "Database content is not loaded"}</strong>
        <span>
          {connected
            ? "Admin CRUD is reading from and writing to the CMS tables."
            : cmsError || "The dashboard is showing fallback content until Supabase returns real rows."}
        </span>
      </div>
    </section>
  );
}

function ItemEditor({ item, onDeleteItem, onSaveItem, onUploadAsset, saveLoading }) {
  const [form, setForm] = useState(itemDefaults);

  useEffect(() => {
    setForm({
      title: item.title || "",
      subtitle: item.subtitle || "",
      body: item.body || "",
      image_url: item.image_url || "",
      link_label: item.link_label || "",
      link_url: item.link_url || "",
      sort_order: item.sort_order || 0,
      is_active: item.is_active ?? true
    });
  }, [item]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSaveItem({
      id: item.id,
      section_id: item.section_id,
      ...form,
      sort_order: Number(form.sort_order) || 0
    });
  };

  return (
    <form className="nested-form" onSubmit={handleSubmit}>
      <div className="editor-grid">
        <label>
          <span>Item Title</span>
          <input name="title" onChange={handleChange} required type="text" value={form.title} />
        </label>

        <label>
          <span>Subtitle</span>
          <input name="subtitle" onChange={handleChange} type="text" value={form.subtitle} />
        </label>

        <label className="full-span">
          <span>Body</span>
          <textarea name="body" onChange={handleChange} rows="4" value={form.body} />
        </label>

        <ImageField
          folder={`items/${item.section_id}`}
          label="Image URL"
          name="image_url"
          onChange={handleChange}
          onUploadAsset={onUploadAsset}
          value={form.image_url}
        />

        <label>
          <span>Link Label</span>
          <input name="link_label" onChange={handleChange} type="text" value={form.link_label} />
        </label>

        <label>
          <span>Link URL</span>
          <input name="link_url" onChange={handleChange} type="text" value={form.link_url} />
        </label>

        <label>
          <span>Sort Order</span>
          <input name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
        </label>

        <label className="checkbox-field">
          <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
          <span>Active</span>
        </label>
      </div>

      <div className="editor-actions">
        <button className="primary-button" disabled={saveLoading} type="submit">
          Save Item
        </button>
        <button
          className="secondary-button"
          disabled={saveLoading}
          onClick={() => onDeleteItem(item.id)}
          type="button"
        >
          Delete Item
        </button>
      </div>
    </form>
  );
}

function SectionEditor({
  onAddItem,
  onDeleteItem,
  onDeleteSection,
  onSaveItem,
  onSaveSection,
  onUploadAsset,
  saveLoading,
  section
}) {
  const [form, setForm] = useState(sectionDefaults);

  useEffect(() => {
    setForm({
      section_key: section.section_key || "",
      section_label: section.section_label || "",
      section_type: section.section_type || "content",
      title: section.title || "",
      subtitle: section.subtitle || "",
      body: section.body || "",
      image_url: section.image_url || "",
      primary_button_label: section.primary_button_label || "",
      primary_button_url: section.primary_button_url || "",
      secondary_button_label: section.secondary_button_label || "",
      secondary_button_url: section.secondary_button_url || "",
      sort_order: section.sort_order || 0,
      is_active: section.is_active ?? true
    });
  }, [section]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSaveSection({
      id: section.id,
      page_id: section.page_id,
      ...form,
      sort_order: Number(form.sort_order) || 0
    });
  };

  return (
    <article className="editor-card">
      <form className="stack-form" onSubmit={handleSubmit}>
        <div className="editor-grid">
          <label>
            <span>Section Label</span>
            <input
              name="section_label"
              onChange={handleChange}
              required
              type="text"
              value={form.section_label}
            />
          </label>

          <label>
            <span>Section Key</span>
            <input
              name="section_key"
              onChange={handleChange}
              required
              type="text"
              value={form.section_key}
            />
          </label>

          <label>
            <span>Section Type</span>
            <select name="section_type" onChange={handleChange} value={form.section_type}>
              <option value="content">Content</option>
              <option value="cards">Cards</option>
              <option value="cta">CTA</option>
              <option value="faq">FAQ</option>
              <option value="list">List</option>
              <option value="hero">Hero</option>
            </select>
          </label>

          <label>
            <span>Sort Order</span>
            <input name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
          </label>

          <label className="checkbox-field">
            <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
            <span>Active</span>
          </label>

          <label className="full-span">
            <span>Title</span>
            <input name="title" onChange={handleChange} type="text" value={form.title} />
          </label>

          <label className="full-span">
            <span>Subtitle</span>
            <input name="subtitle" onChange={handleChange} type="text" value={form.subtitle} />
          </label>

          <label className="full-span">
            <span>Body</span>
            <textarea name="body" onChange={handleChange} rows="5" value={form.body} />
          </label>

          <ImageField
            folder={`sections/${section.page_id}`}
            label="Image URL"
            name="image_url"
            onChange={handleChange}
            onUploadAsset={onUploadAsset}
            value={form.image_url}
          />

          <label>
            <span>Primary Button Label</span>
            <input
              name="primary_button_label"
              onChange={handleChange}
              type="text"
              value={form.primary_button_label}
            />
          </label>

          <label>
            <span>Primary Button URL</span>
            <input
              name="primary_button_url"
              onChange={handleChange}
              type="text"
              value={form.primary_button_url}
            />
          </label>

          <label>
            <span>Secondary Button Label</span>
            <input
              name="secondary_button_label"
              onChange={handleChange}
              type="text"
              value={form.secondary_button_label}
            />
          </label>

          <label>
            <span>Secondary Button URL</span>
            <input
              name="secondary_button_url"
              onChange={handleChange}
              type="text"
              value={form.secondary_button_url}
            />
          </label>
        </div>

        <div className="editor-actions">
          <button className="primary-button" disabled={saveLoading} type="submit">
            Save Section
          </button>
          <button
            className="secondary-button"
            disabled={saveLoading}
            onClick={() => onAddItem(section.id)}
            type="button"
          >
            Add Item
          </button>
          <button
            className="secondary-button"
            disabled={saveLoading}
            onClick={() => onDeleteSection(section.id)}
            type="button"
          >
            Delete Section
          </button>
        </div>
      </form>

      <div className="subeditor-list">
        {section.items?.length ? (
          section.items.map((item) => (
            <ItemEditor
              item={item}
              key={item.id}
              onDeleteItem={onDeleteItem}
              onSaveItem={onSaveItem}
              onUploadAsset={onUploadAsset}
              saveLoading={saveLoading}
            />
          ))
        ) : (
          <p className="muted-copy">No items yet for this section.</p>
        )}
      </div>
    </article>
  );
}

function Dashboard({
  cmsDataSource,
  cmsError,
  cmsLoading,
  onAddItem,
  onAddSection,
  onDeleteItem,
  onDeleteSection,
  onLogout,
  onSaveItem,
  onSavePage,
  onSaveSection,
  onSaveSiteSettings,
  onUploadAsset,
  pages,
  saveLoading,
  siteSettings,
  statusMessage,
  statusTone
}) {
  const [selectedPageId, setSelectedPageId] = useState("");
  const [activePanel, setActivePanel] = useState("dashboard");
  const [siteForm, setSiteForm] = useState(siteDefaults);
  const [pageForm, setPageForm] = useState(pageDefaults);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) || pages[0] || null,
    [pages, selectedPageId]
  );
  const pageBySlug = useMemo(
    () => pages.reduce((map, page) => ({ ...map, [page.slug]: page }), {}),
    [pages]
  );

  useEffect(() => {
    if (!selectedPageId && pages[0]?.id) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  useEffect(() => {
    setSiteForm({
      site_name: siteSettings.site_name || "",
      logo_url: siteSettings.logo_url || "",
      footer_cta_title: siteSettings.footer_cta_title || "",
      footer_cta_body: siteSettings.footer_cta_body || "",
      footer_cta_button_label: siteSettings.footer_cta_button_label || "",
      footer_cta_button_url: siteSettings.footer_cta_button_url || ""
    });
  }, [siteSettings]);

  useEffect(() => {
    if (!selectedPage) {
      setPageForm(pageDefaults);
      return;
    }

    setPageForm({
      nav_label: selectedPage.nav_label || "",
      page_title: selectedPage.page_title || "",
      page_description: selectedPage.page_description || "",
      seo_title: selectedPage.seo_title || "",
      seo_description: selectedPage.seo_description || "",
      hero_title: selectedPage.hero_title || "",
      hero_body: selectedPage.hero_body || "",
      hero_primary_button_label: selectedPage.hero_primary_button_label || "",
      hero_primary_button_url: selectedPage.hero_primary_button_url || "",
      hero_secondary_button_label: selectedPage.hero_secondary_button_label || "",
      hero_secondary_button_url: selectedPage.hero_secondary_button_url || "",
      hero_image_url: selectedPage.hero_image_url || "",
      sort_order: selectedPage.sort_order || 0,
      is_published: selectedPage.is_published ?? true
    });
  }, [selectedPage]);

  const handleSiteChange = (event) => {
    const { name, value } = event.target;
    setSiteForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handlePageChange = (event) => {
    const { checked, name, type, value } = event.target;
    setPageForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const submitSiteSettings = async (event) => {
    event.preventDefault();
    await onSaveSiteSettings({
      site_name: siteForm.site_name,
      logo_url: siteForm.logo_url,
      footer_cta_title: siteForm.footer_cta_title,
      footer_cta_body: siteForm.footer_cta_body,
      footer_cta_button_label: siteForm.footer_cta_button_label,
      footer_cta_button_url: siteForm.footer_cta_button_url
    });
  };

  const submitPage = async (event) => {
    event.preventDefault();

    if (!selectedPage) {
      return;
    }

    await onSavePage({
      id: selectedPage.id,
      slug: selectedPage.slug,
      ...pageForm,
      sort_order: Number(pageForm.sort_order) || 0
    });
  };

  const handleSidebarSelect = (item) => {
    if (item.disabled) {
      return;
    }

    if (item.id === "dashboard" || item.id === "site-settings") {
      setActivePanel(item.id);
      return;
    }

    const targetPage = pageBySlug[item.helper] || pageBySlug[item.id];

    if (targetPage) {
      setSelectedPageId(targetPage.id);
      setActivePanel(item.id);
    }
  };

  return (
    <section className="dashboard-card admin-dashboard">
      <div className="dashboard-topbar">
        <div className="admin-search">
          <input placeholder="Search pages, sections, content..." type="text" />
        </div>

        <div className="admin-toolbar">
          <span className="admin-notice">Admin User</span>
          <button className="secondary-button" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo-mark">S</div>
            <div>
              <strong>Secure Wealth</strong>
              <span>Agency Admin</span>
            </div>
          </div>

          <div className="sidebar-group">
            <button
              className={`sidebar-item${activePanel === "dashboard" ? " active" : ""}`}
              onClick={() => handleSidebarSelect({ id: "dashboard" })}
              type="button"
            >
              <span>Dashboard</span>
            </button>
            <button
              className={`sidebar-item${activePanel === "site-settings" ? " active" : ""}`}
              onClick={() => handleSidebarSelect({ id: "site-settings" })}
              type="button"
            >
              <span>Site Settings</span>
            </button>
          </div>

          {sidebarGroups.map((group) => (
            <div className="sidebar-group" key={group.title}>
              <p className="sidebar-label">{group.title}</p>
              {group.items.map((item) => (
                <button
                  className={`sidebar-item${activePanel === item.id ? " active" : ""}${item.disabled ? " muted" : ""}`}
                  key={item.id}
                  onClick={() => handleSidebarSelect(item)}
                  type="button"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-scroll">
            <DatabaseStatusBanner cmsDataSource={cmsDataSource} cmsError={cmsError} cmsLoading={cmsLoading} />

            {activePanel === "dashboard" ? (
              <DashboardOverview pages={pages} />
            ) : activePanel === "site-settings" ? (
              <SiteSettingsForm
                onSaveSiteSettings={submitSiteSettings}
                onUploadAsset={onUploadAsset}
                saveLoading={saveLoading}
                siteForm={{ ...siteForm, onChange: handleSiteChange }}
                statusTone={statusTone}
              />
            ) : null}
            {activePanel !== "dashboard" && activePanel !== "site-settings" && selectedPage ? (
              <div className="dashboard-stack">
                <div className="card stack-form">
                  <div className="section-heading">
                    <h3>Page Editor</h3>
                    <p>Edit the selected page content and metadata.</p>
                  </div>

                  <form className="stack-form" onSubmit={submitPage}>
                    <div className="editor-grid">
                      <label>
                        <span>Navigation Label</span>
                        <input
                          name="nav_label"
                          onChange={handlePageChange}
                          required
                          type="text"
                          value={pageForm.nav_label}
                        />
                      </label>

                      <label>
                        <span>Slug</span>
                        <input disabled readOnly type="text" value={selectedPage.slug} />
                      </label>

                      <label className="full-span">
                        <span>Page Title</span>
                        <input
                          name="page_title"
                          onChange={handlePageChange}
                          required
                          type="text"
                          value={pageForm.page_title}
                        />
                      </label>

                      <label className="full-span">
                        <span>Page Description</span>
                        <textarea
                          name="page_description"
                          onChange={handlePageChange}
                          rows="4"
                          value={pageForm.page_description}
                        />
                      </label>

                      <label>
                        <span>SEO Title</span>
                        <input name="seo_title" onChange={handlePageChange} type="text" value={pageForm.seo_title} />
                      </label>

                      <label>
                        <span>SEO Description</span>
                        <input
                          name="seo_description"
                          onChange={handlePageChange}
                          type="text"
                          value={pageForm.seo_description}
                        />
                      </label>

                      <label className="full-span">
                        <span>Hero Title</span>
                        <input name="hero_title" onChange={handlePageChange} type="text" value={pageForm.hero_title} />
                      </label>

                      <label className="full-span">
                        <span>Hero Body</span>
                        <textarea name="hero_body" onChange={handlePageChange} rows="5" value={pageForm.hero_body} />
                      </label>

                      <label>
                        <span>Hero Primary Button Label</span>
                        <input
                          name="hero_primary_button_label"
                          onChange={handlePageChange}
                          type="text"
                          value={pageForm.hero_primary_button_label}
                        />
                      </label>

                      <label>
                        <span>Hero Primary Button URL</span>
                        <input
                          name="hero_primary_button_url"
                          onChange={handlePageChange}
                          type="text"
                          value={pageForm.hero_primary_button_url}
                        />
                      </label>

                      <label>
                        <span>Hero Secondary Button Label</span>
                        <input
                          name="hero_secondary_button_label"
                          onChange={handlePageChange}
                          type="text"
                          value={pageForm.hero_secondary_button_label}
                        />
                      </label>

                      <label>
                        <span>Hero Secondary Button URL</span>
                        <input
                          name="hero_secondary_button_url"
                          onChange={handlePageChange}
                          type="text"
                          value={pageForm.hero_secondary_button_url}
                        />
                      </label>

                      <ImageField
                        folder={`pages/${selectedPage.slug}`}
                        label="Hero Image URL"
                        name="hero_image_url"
                        onChange={handlePageChange}
                        onUploadAsset={onUploadAsset}
                        value={pageForm.hero_image_url}
                      />

                      <label>
                        <span>Sort Order</span>
                        <input name="sort_order" onChange={handlePageChange} type="number" value={pageForm.sort_order} />
                      </label>

                      <label className="checkbox-field">
                        <input
                          checked={pageForm.is_published}
                          name="is_published"
                          onChange={handlePageChange}
                          type="checkbox"
                        />
                        <span>Published</span>
                      </label>
                    </div>

                    <button className="primary-button" disabled={saveLoading} type="submit">
                      Save Page
                    </button>
                  </form>
                </div>

                <div className="card stack-form">
                  <div className="section-heading">
                    <h3>Section Editor</h3>
                    <p>Each section is content-only. Add cards or CTA data here.</p>
                  </div>

                  <div className="editor-actions">
                    <button
                      className="primary-button"
                      disabled={saveLoading}
                      onClick={() => onAddSection(selectedPage.id)}
                      type="button"
                    >
                      Add Section
                    </button>
                  </div>

                  {selectedPage.sections?.length ? (
                    <div className="section-editor-list">
                      {selectedPage.sections.map((section) => (
                        <SectionEditor
                          key={section.id}
                          onAddItem={onAddItem}
                          onDeleteItem={onDeleteItem}
                          onDeleteSection={onDeleteSection}
                          onSaveItem={onSaveItem}
                          onSaveSection={onSaveSection}
                          onUploadAsset={onUploadAsset}
                          saveLoading={saveLoading}
                          section={section}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="muted-copy">This page does not have any sections yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {statusMessage ? (
        <p className={`status-message${statusTone === "error" ? " error" : ""}`}>{statusMessage}</p>
      ) : null}
    </section>
  );
}

export default Dashboard;
