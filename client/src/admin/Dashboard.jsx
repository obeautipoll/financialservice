import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAdminPageDefinitionByPanelId,
  getAdminPageDefinitionBySlug,
  landingPageDefinitions
} from "../pageDefinitions.js";
import PageEditorPanel from "./PageEditorPanel.jsx";
import ContactLeads from "./ContactLeads.jsx";
import SiteInformation from "./SiteInformation.jsx";
import TeamApplications from "./TeamApplications.jsx";

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
  hero_visible: true,
  sort_order: 0,
  is_published: true
};

const websiteContentItems = landingPageDefinitions.map((pageDefinition) => ({
  id: pageDefinition.adminPanelId,
  label: pageDefinition.adminLabel,
  helper: pageDefinition.slug,
  type: "page",
  path: pageDefinition.adminPath
}));

const sidebarGroups = [
  {
    id: "website-content",
    title: "Website Content",
    items: websiteContentItems
  },
  {
    id: "leads-assessment",
    title: "Contact Requests",
    items: [
      { id: "leads-contact", label: "Name and Number", type: "module" },
      { id: "new-leads", label: "New Leads", type: "module" },
      { id: "assessment-results", label: "Assessment Results", type: "module" },
      { id: "consultations", label: "Consultations", type: "module" }
    ]
  },
  {
    id: "recruitment",
    title: "Join Our Team",
    items: [
      { id: "team-applications", label: "Applications", type: "module" }
    ]
  }
];

const initialSidebarGroups = sidebarGroups.reduce(
  (groups, group) => ({
    ...groups,
    [group.id]: group.id === "website-content"
  }),
  {}
);

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
            <span>Status</span>
            <span>Sections</span>
          </div>
          {pages.map((page) => (
            <div className="summary-row" key={page.id}>
              <span>{page.nav_label}</span>
              <span>{page.is_published ? "Published" : "Draft"}</span>
              <span>{page.sections?.length || 0}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SidebarDropdown({ activePanel, group, isOpen, onSelect, onToggle }) {
  const hasActiveItem = group.items.some((item) => item.id === activePanel);

  return (
    <div className="sidebar-dropdown">
      <button
        aria-expanded={isOpen}
        className={`sidebar-group-toggle${isOpen ? " open" : ""}${hasActiveItem ? " active" : ""}`}
        onClick={() => onToggle(group.id)}
        type="button"
      >
        <span>{group.title}</span>
      </button>

      {isOpen ? (
        <div className="sidebar-submenu">
          {group.items.map((item) => (
            <button
              className={`sidebar-item${activePanel === item.id ? " active" : ""}${item.disabled ? " muted" : ""}`}
              disabled={item.disabled}
              key={item.id}
              onClick={() => onSelect(item)}
              type="button"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ModulePanel({ item }) {
  if (item.id === "leads-contact") {
    return <ContactLeads />;
  }

  if (item.id === "team-applications") {
    return <TeamApplications />;
  }

  return (
    <section className="card stack-form">
      <div className="section-heading">
        <p className="eyebrow">Admin Module</p>
        <h3>{item.label}</h3>
        <p>This area is separate from landing page content.</p>
      </div>
      <p className="muted-copy">Connect this module to its Supabase data table when you are ready to manage records here.</p>
    </section>
  );
}

const trimTrailingSlash = (pathname) => pathname.replace(/\/+$/, "") || "/admin";

const getModuleAdminPath = (moduleId) => `/admin/modules/${moduleId}`;

const getRouteStateFromAdminPath = (pathname) => {
  const normalizedPath = trimTrailingSlash(pathname);

  if (normalizedPath === "/admin/site-information") {
    return { activePanel: "site-settings" };
  }

  const pageMatch = normalizedPath.match(/^\/admin\/pages\/([^/]+)$/);
  if (pageMatch) {
    const pageDefinition = getAdminPageDefinitionBySlug(decodeURIComponent(pageMatch[1]));

    if (pageDefinition) {
      return {
        activePanel: pageDefinition.adminPanelId,
        selectedPageSlug: pageDefinition.slug
      };
    }
  }

  const moduleMatch = normalizedPath.match(/^\/admin\/modules\/([^/]+)$/);
  if (moduleMatch) {
    return { activePanel: decodeURIComponent(moduleMatch[1]) };
  }

  return { activePanel: "dashboard" };
};

function Dashboard({
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
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = useMemo(() => getRouteStateFromAdminPath(location.pathname), [location.pathname]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [activePanel, setActivePanel] = useState("dashboard");
  const [openSidebarGroups, setOpenSidebarGroups] = useState(initialSidebarGroups);
  const [pageForm, setPageForm] = useState(pageDefaults);
  const [activeModal, setActiveModal] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  const pageBySlug = useMemo(
    () => pages.reduce((map, page) => ({ ...map, [page.slug]: page }), {}),
    [pages]
  );
  const activePageDefinition = useMemo(
    () => getAdminPageDefinitionByPanelId(activePanel),
    [activePanel]
  );
  const selectedPage = useMemo(() => {
    if (activePageDefinition) {
      return pageBySlug[activePageDefinition.slug] || null;
    }

    return pages.find((page) => page.id === selectedPageId) || pages[0] || null;
  }, [activePageDefinition, pageBySlug, pages, selectedPageId]);
  const activeSidebarItem = useMemo(
    () => sidebarGroups.flatMap((group) => group.items).find((item) => item.id === activePanel) || null,
    [activePanel]
  );
  const isPagePanel = activeSidebarItem?.type === "page";
  const isModulePanel = activeSidebarItem?.type === "module";

  useEffect(() => {
    setActivePanel(routeState.activePanel);

    if (routeState.selectedPageSlug) {
      const targetPage = pageBySlug[routeState.selectedPageSlug];

      if (targetPage) {
        setSelectedPageId(targetPage.id);
      }
    }
  }, [pageBySlug, routeState.activePanel, routeState.selectedPageSlug]);

  useEffect(() => {
    const activeGroup = sidebarGroups.find((group) => group.items.some((item) => item.id === activePanel));

    if (!activeGroup) {
      return;
    }

    setOpenSidebarGroups((current) =>
      current[activeGroup.id]
        ? current
        : {
            ...current,
            [activeGroup.id]: true
          }
    );
  }, [activePanel]);

  useEffect(() => {
    if (!selectedPageId && !activePageDefinition && pages[0]?.id) {
      setSelectedPageId(pages[0].id);
    }
  }, [activePageDefinition, pages, selectedPageId]);

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
      hero_visible: selectedPage.hero_visible ?? true,
      sort_order: selectedPage.sort_order || 0,
      is_published: selectedPage.is_published ?? true
    });
  }, [selectedPage]);

  const handlePageChange = (event) => {
    const { checked, name, type, value } = event.target;
    setPageForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
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
    setActiveModal(null);
  };

  const savePageFieldPatch = async (fieldPatch) => {
    if (!selectedPage) {
      return;
    }

    await onSavePage({
      id: selectedPage.id,
      slug: selectedPage.slug,
      ...pageForm,
      ...fieldPatch,
      sort_order: Number(pageForm.sort_order) || 0
    });
  };

  const toggleHeroVisible = async () => {
    const nextVisible = !(pageForm.hero_visible ?? true);
    setPageForm((current) => ({
      ...current,
      hero_visible: nextVisible
    }));
    await savePageFieldPatch({ hero_visible: nextVisible });
  };

  const handleSidebarSelect = (item) => {
    if (item.disabled) {
      return;
    }

    if (item.id === "dashboard") {
      setActivePanel(item.id);
      navigate("/admin");
      return;
    }

    if (item.id === "site-settings") {
      setActivePanel(item.id);
      navigate("/admin/site-information");
      return;
    }

    if (item.type === "module") {
      setActivePanel(item.id);
      navigate(getModuleAdminPath(item.id));
      return;
    }

    const targetPage = pageBySlug[item.helper] || pageBySlug[item.id];
    setActivePanel(item.id);
    navigate(item.path || `/admin/pages/${item.helper}`);

    if (targetPage) {
      setSelectedPageId(targetPage.id);
    }
  };

  const toggleSidebarGroup = (groupId) => {
    setOpenSidebarGroups((current) => ({
      ...current,
      [groupId]: !current[groupId]
    }));
  };

  return (
    <section className="dashboard-card admin-dashboard">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            {siteSettings.logo_url ? (
              <img alt="" className="sidebar-brand-logo" src={siteSettings.logo_url} />
            ) : (
              <div className="sidebar-logo-mark" aria-hidden="true">S</div>
            )}
            <span className="sidebar-brand-name">{siteSettings.site_name || "Admin Dashboard"}</span>
          </div>

          <nav aria-label="Admin navigation" className="sidebar-nav">
            <div className="sidebar-group">
              <button
                className={`sidebar-item${activePanel === "dashboard" ? " active" : ""}`}
                onClick={() => handleSidebarSelect({ id: "dashboard" })}
                type="button"
              >
                <span>Dashboard</span>
              </button>
            </div>

            {sidebarGroups.map((group) => (
              <SidebarDropdown
                activePanel={activePanel}
                group={group}
                isOpen={openSidebarGroups[group.id]}
                key={group.id}
                onSelect={handleSidebarSelect}
                onToggle={toggleSidebarGroup}
              />
            ))}
          </nav>

          <div className="sidebar-bottom">
            <button
              className={`sidebar-item${activePanel === "site-settings" ? " active" : ""}`}
              onClick={() => handleSidebarSelect({ id: "site-settings" })}
              type="button"
            >
              <span>Site Information</span>
            </button>
            <button className="sidebar-item sidebar-logout" onClick={onLogout} type="button">
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-topbar">
            <div className="admin-search">
              <input placeholder="Search pages, sections, content..." type="text" />
            </div>

            <div className="admin-toolbar">
              <span className="admin-notice">Admin User</span>
            </div>
          </div>

          <div className="dashboard-scroll">
            {activePanel === "dashboard" ? (
              <DashboardOverview pages={pages} />
            ) : activePanel === "site-settings" ? (
              <SiteInformation
                onSaveSiteSettings={onSaveSiteSettings}
                onUploadAsset={onUploadAsset}
                saveLoading={saveLoading}
                siteSettings={siteSettings}
                statusTone={statusTone}
              />
            ) : isModulePanel && activeSidebarItem ? (
              <ModulePanel item={activeSidebarItem} />
            ) : null}
            {isPagePanel && selectedPage ? (
              <PageEditorPanel
                activeModal={activeModal}
                editingSection={editingSection}
                onActiveModalChange={setActiveModal}
                onAddItem={onAddItem}
                onAddSection={onAddSection}
                onDeleteItem={onDeleteItem}
                onDeleteSection={onDeleteSection}
                onEditingSectionChange={setEditingSection}
                onPageChange={handlePageChange}
                onSaveItem={onSaveItem}
                onSaveSection={onSaveSection}
                onSubmitPage={submitPage}
                onToggleHeroVisible={toggleHeroVisible}
                onUploadAsset={onUploadAsset}
                page={selectedPage}
                pageDefinition={activePageDefinition}
                pageForm={pageForm}
                saveLoading={saveLoading}
              />
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
