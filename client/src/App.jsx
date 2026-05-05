import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Admin from "./admin/Admin.jsx";
import About from "./landing/About.jsx";
import Contact from "./landing/Contact.jsx";
import Home from "./landing/Home.jsx";
import InsuranceProducts from "./landing/InsuranceProducts.jsx";
import JoinOurTeam from "./landing/JoinOurTeam.jsx";
import { SiteFooter } from "./landing/ManagedPage.jsx";
import Resources from "./landing/Resources.jsx";
import { getPublicNavLabel, slugToHref } from "./pageDefinitions.js";
import { ensureSupabase, getSupabaseConfigStatus, uploadStorageAsset } from "./supabase.js";

export const AuthContext = createContext(null);

const fallbackSiteSettings = {
  site_name: "Financial Services",
  logo_url: "",
  footer_cta_visible: true,
  footer_cta_title: "Ready to take the next step?",
  footer_cta_body:
    "Book a free consultation today and let our team help you create a financial protection plan.",
  footer_cta_button_label: "Book a Free Consultation",
  footer_cta_button_url: "/contact",
  office_location_title: "Office Location",
  office_location_address: "",
  contact_phone: "",
  contact_email: "",
  social_links: [],
  footer_quicklinks_visible: true,
  copyright_name: "ZPG Eagle Financial Team"
};

const fallbackPages = [
  {
    id: "fallback-home",
    slug: "home",
    nav_label: "Home",
    page_title: "Secure Your Future with the Right Financial and Insurance Guidance",
    page_description:
      "We help individuals, families, and professionals understand their insurance options, protect their income, and build a better financial future.",
    hero_title: "Secure Your Future with the Right Financial and Insurance Guidance",
    hero_body:
      "We help individuals, families, and professionals understand their insurance options, protect their income, and build a better financial future.",
    hero_primary_button_label: "Book a Free Financial Review",
    hero_primary_button_url: "/contact",
    hero_secondary_button_label: "Talk to Our Team",
    hero_secondary_button_url: "/contact",
    hero_image_url: "",
    hero_visible: true,
    is_published: true,
    sort_order: 1,
    sections: [
      {
        id: "fallback-who-we-help",
        page_id: "fallback-home",
        section_key: "who-we-help",
        section_label: "Who We Help",
        section_type: "cards",
        title: "Who We Help",
        subtitle: "",
        body: "",
        image_url: "",
        primary_button_label: "",
        primary_button_url: "",
        secondary_button_label: "",
        secondary_button_url: "",
        sort_order: 1,
        is_active: true,
        items: [
          {
            id: "fallback-individuals",
            section_id: "fallback-who-we-help",
            title: "Individuals",
            subtitle: "",
            body: "Starting your financial journey.",
            image_url: "",
            link_label: "",
            link_url: "",
            sort_order: 1,
            is_active: true
          },
          {
            id: "fallback-families",
            section_id: "fallback-who-we-help",
            title: "Families",
            subtitle: "",
            body: "Looking for protection.",
            image_url: "",
            link_label: "",
            link_url: "",
            sort_order: 2,
            is_active: true
          },
          {
            id: "fallback-professionals",
            section_id: "fallback-who-we-help",
            title: "Professionals",
            subtitle: "",
            body: "Planning for long-term security.",
            image_url: "",
            link_label: "",
            link_url: "",
            sort_order: 3,
            is_active: true
          }
        ]
      },
      {
        id: "fallback-services",
        page_id: "fallback-home",
        section_key: "services",
        section_label: "Services Overview",
        section_type: "cards",
        title: "Services Overview",
        subtitle: "",
        body: "",
        image_url: "",
        primary_button_label: "",
        primary_button_url: "",
        secondary_button_label: "",
        secondary_button_url: "",
        sort_order: 2,
        is_active: true,
        items: [
          {
            id: "fallback-service-1",
            section_id: "fallback-services",
            title: "Life Insurance",
            subtitle: "",
            body: "Personalized coverage tailored to your specific goals and budget requirements.",
            image_url: "",
            link_label: "Learn More",
            link_url: "/services",
            sort_order: 1,
            is_active: true
          },
          {
            id: "fallback-service-2",
            section_id: "fallback-services",
            title: "Health Insurance",
            subtitle: "",
            body: "Personalized coverage tailored to your specific goals and budget requirements.",
            image_url: "",
            link_label: "Learn More",
            link_url: "/services",
            sort_order: 2,
            is_active: true
          },
          {
            id: "fallback-service-3",
            section_id: "fallback-services",
            title: "Income Protection",
            subtitle: "",
            body: "Personalized coverage tailored to your specific goals and budget requirements.",
            image_url: "",
            link_label: "Learn More",
            link_url: "/services",
            sort_order: 3,
            is_active: true
          },
          {
            id: "fallback-service-4",
            section_id: "fallback-services",
            title: "Retirement Planning",
            subtitle: "",
            body: "Personalized coverage tailored to your specific goals and budget requirements.",
            image_url: "",
            link_label: "Learn More",
            link_url: "/services",
            sort_order: 4,
            is_active: true
          }
        ]
      },
      {
        id: "fallback-recruitment",
        page_id: "fallback-home",
        section_key: "join-our-team",
        section_label: "Join Our Team",
        section_type: "cta",
        title: "Join Our Team",
        subtitle: "",
        body:
          "Build a meaningful career helping others protect their future. Join our growing financial team and receive training, mentorship, and career support.",
        image_url: "",
        primary_button_label: "Apply to Join Our Team",
        primary_button_url: "/join-our-team",
        secondary_button_label: "",
        secondary_button_url: "",
        sort_order: 3,
        is_active: true,
        items: []
      }
    ]
  }
];

const sortByOrder = (left, right) => {
  const orderDiff = (left.sort_order || 0) - (right.sort_order || 0);

  if (orderDiff !== 0) {
    return orderDiff;
  }

  return String(left.title || left.nav_label || left.section_label || "")
    .localeCompare(String(right.title || right.nav_label || right.section_label || ""));
};

const buildCmsTree = (pages, sections, items) => {
  const itemsBySectionId = items.reduce((accumulator, item) => {
    const sectionItems = accumulator[item.section_id] || [];
    sectionItems.push(item);
    accumulator[item.section_id] = sectionItems;
    return accumulator;
  }, {});

  const sectionsByPageId = sections.reduce((accumulator, section) => {
    const pageSections = accumulator[section.page_id] || [];
    pageSections.push({
      ...section,
      items: (itemsBySectionId[section.id] || []).sort(sortByOrder)
    });
    accumulator[section.page_id] = pageSections;
    return accumulator;
  }, {});

  return pages
    .map((page) => ({
      ...page,
      sections: (sectionsByPageId[page.id] || []).sort(sortByOrder)
    }))
    .sort(sortByOrder);
};

const buildPublishedCmsTree = (pages) =>
  pages
    .filter((page) => page.is_published)
    .map((page) => ({
      ...page,
      sections: (page.sections || [])
        .filter((section) => section.is_active)
        .map((section) => ({
          ...section,
          items: (section.items || []).filter((item) => item.is_active)
        }))
    }));

const cmsSourceLabels = {
  database: "Supabase",
  empty: "empty Supabase tables",
  fallback: "fallback content"
};

const isRemovedCmsPage = (page) => page?.slug === "free-assessment";

const normalizeSocialLinks = (socialLinks) => {
  if (Array.isArray(socialLinks)) {
    return socialLinks;
  }

  if (typeof socialLinks === "string" && socialLinks.trim()) {
    try {
      const parsedLinks = JSON.parse(socialLinks);
      return Array.isArray(parsedLinks) ? parsedLinks : [];
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeSiteSettings = (settingsRow) => ({
  ...fallbackSiteSettings,
  ...(settingsRow || {}),
  social_links: normalizeSocialLinks(settingsRow?.social_links)
});

const withTimeout = (promise, ms, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    })
  ]);

function ProtectedAdminRoute({ children, loading, session }) {
  return <>{children}</>;
}

function ConfigErrorScreen() {
  const configStatus = getSupabaseConfigStatus();

  return (
    <main className="page-shell">
      <section className="card auth-card">
        <div className="section-heading">
          <p className="eyebrow">Configuration Error</p>
          <h2>Supabase is not configured in this deployment</h2>
          <p>Add the required Vercel environment variables and redeploy.</p>
        </div>

        <div className="stack-form">
          <label>
            <span>VITE_SUPABASE_URL</span>
            <input disabled readOnly type="text" value={configStatus.urlConfigured ? "set" : "missing"} />
          </label>

          <label>
            <span>VITE_SUPABASE_ANON_KEY</span>
            <input
              disabled
              readOnly
              type="text"
              value={configStatus.anonKeyConfigured ? "set" : "missing"}
            />
          </label>

          <label>
            <span>VITE_LOGIN_LOOKUP_TABLES</span>
            <input
              disabled
              readOnly
              type="text"
              value={configStatus.lookupTables || "not set"}
            />
          </label>
        </div>
      </section>
    </main>
  );
}

function ContentUnavailableScreen({ message }) {
  return (
    <main className="landing-shell">
      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Content unavailable</p>
          <h2>Landing page content is not loaded from Supabase</h2>
          <p>{message}</p>
        </div>
      </section>
    </main>
  );
}

function App() {
  const location = useLocation();
  const cmsLoadRunId = useRef(0);
  const [session, setSession] = useState(null);
  const [siteSettings, setSiteSettings] = useState(fallbackSiteSettings);
  const [pages, setPages] = useState(fallbackPages);
  const [cmsDataSource, setCmsDataSource] = useState("fallback");
  const [cmsError, setCmsError] = useState("");
  const [cmsLoading, setCmsLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginResolvedEmail, setLoginResolvedEmail] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("success");

  const supabase = ensureSupabase();

  const setStatus = (message, tone = "success") => {
    setStatusMessage(message);
    setStatusTone(tone);
  };

  const loadCms = async ({ throwOnError = false } = {}) => {
    const runId = cmsLoadRunId.current + 1;
    cmsLoadRunId.current = runId;
    const isCurrentRun = () => runId === cmsLoadRunId.current;

    try {
      setCmsLoading(true);

      const [{ data: settingsRow, error: settingsError }, { data: pageRows, error: pagesError }, { data: sectionRows, error: sectionsError }, { data: itemRows, error: itemsError }] =
        await withTimeout(
          Promise.all([
            supabase.from("site_settings").select("*").order("id", { ascending: true }).limit(1).maybeSingle(),
            supabase.from("cms_pages").select("*").order("sort_order", { ascending: true }),
            supabase.from("cms_sections").select("*").order("sort_order", { ascending: true }),
            supabase.from("cms_section_items").select("*").order("sort_order", { ascending: true })
          ]),
          8000,
          "Timed out while loading site content. Check your Supabase tables and RLS policies."
        );

      if (settingsError) {
        throw settingsError;
      }

      if (pagesError) {
        throw pagesError;
      }

      if (sectionsError) {
        throw sectionsError;
      }

      if (itemsError) {
        throw itemsError;
      }

      if (!isCurrentRun()) {
        return;
      }

      if (settingsRow) {
        setSiteSettings(normalizeSiteSettings(settingsRow));
      } else {
        setSiteSettings(fallbackSiteSettings);
      }

      if (pageRows?.length) {
        setPages(buildCmsTree(pageRows, sectionRows || [], itemRows || []));
        setCmsDataSource("database");
        setCmsError("");
      } else {
        setPages(fallbackPages);
        setCmsDataSource("empty");
        const emptyMessage = "Supabase returned no CMS pages. Run supabase/cms_schema.sql so CRUD has real rows to edit.";
        setCmsError(emptyMessage);

        if (throwOnError) {
          throw new Error(emptyMessage);
        }
      }
    } catch (error) {
      if (!isCurrentRun()) {
        if (throwOnError) {
          throw error;
        }
        return;
      }

      const message = error.message || "Unable to load site content.";
      setSiteSettings(fallbackSiteSettings);
      setPages(fallbackPages);
      setCmsDataSource("fallback");
      setCmsError(message);
      setStatus(message, "error");

      if (throwOnError) {
        throw error;
      }
    } finally {
      if (isCurrentRun()) {
        setCmsLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession();

        if (active) {
          setSession(currentSession);
        }
      } catch (error) {
        if (active) {
          setStatus(error.message || "Unable to read Supabase auth session.", "error");
        }
      }

      await loadCms();
    };

    bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      window.setTimeout(() => {
        loadCms();
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const resolveLoginEmail = async (identifier) => {
    const normalizedIdentifier = identifier.trim().toLowerCase();

    if (!normalizedIdentifier) {
      throw new Error("Username or email is required.");
    }

    if (normalizedIdentifier.includes("@")) {
      return normalizedIdentifier;
    }

    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("username", normalizedIdentifier)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.email) {
      throw new Error("Username not found.");
    }

    return data.email.trim().toLowerCase();
  };

  const handleLogin = async ({ username, password }) => {
    try {
      setLoginLoading(true);
      setStatus("", "success");
      setLoginResolvedEmail("");

      const email = await resolveLoginEmail(username);
      setLoginResolvedEmail(email);

      if (email.endsWith("@example.com")) {
        throw new Error(
          `The users table is still mapped to a placeholder email (${email}). Update public.users.email to the real Supabase Auth email for this username.`
        );
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.status === 400) {
          throw new Error("Invalid login credentials. Check the username mapping and Auth password.");
        }

        throw error;
      }

      setStatus("Login successful.");
    } catch (error) {
      setStatus(error.message || "Login failed.", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStatus("Signed out.");
  };

  const handleRefreshCms = async () => {
    setStatus("", "success");
    await loadCms();
  };

  const assertWritableCms = () => {
    if (cmsDataSource !== "database") {
      const label = cmsSourceLabels[cmsDataSource] || cmsDataSource;
      throw new Error(
        `Cannot save while the admin is using ${label}. ${cmsError || "Load real Supabase CMS rows first."}`
      );
    }
  };

  const saveAndReload = async (callback, successMessage) => {
    try {
      setSaveLoading(true);
      setStatus("", "success");
      assertWritableCms();
      await callback();
      await loadCms({ throwOnError: true });
      setStatus(successMessage);
    } catch (error) {
      setStatus(error.message || "Save failed.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSiteSettings = async (payload) => {
    await saveAndReload(async () => {
      const { error } = await supabase.from("site_settings").upsert(
        [
          {
            id: 1,
            ...payload
          }
        ],
        { onConflict: "id" }
      );

      if (error) {
        throw error;
      }
    }, "Global site settings saved.");
  };

  const handleSavePage = async (payload) => {
    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_pages").upsert([payload], { onConflict: "id" });

      if (error) {
        throw error;
      }
    }, `${payload.nav_label} page saved.`);
  };

  const handleSaveSection = async (payload) => {
    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_sections").upsert([payload], { onConflict: "id" });

      if (error) {
        throw error;
      }
    }, "Section saved.");
  };

  const handleAddSection = async (pageId, payload = {}) => {
    const sectionKey = payload.section_key || `section-${Date.now()}`;
    const sortOrder = Number(payload.sort_order) || 0;

    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_sections").insert([
        {
          page_id: pageId,
          section_key: sectionKey,
          section_label: payload.section_label || "New Section",
          section_type: payload.section_type || "cards",
          title: payload.title || "New Section",
          subtitle: payload.subtitle || "",
          body: payload.body || "Add content here.",
          image_url: payload.image_url || "",
          primary_button_label: payload.primary_button_label || "",
          primary_button_url: payload.primary_button_url || "",
          secondary_button_label: payload.secondary_button_label || "",
          secondary_button_url: payload.secondary_button_url || "",
          sort_order: sortOrder,
          is_active: payload.is_active ?? true
        }
      ]);

      if (error) {
        throw error;
      }
    }, "Section added.");
  };

  const handleDeleteSection = async (sectionId) => {
    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_sections").delete().eq("id", sectionId);

      if (error) {
        throw error;
      }
    }, "Section deleted.");
  };

  const handleSaveItem = async (payload) => {
    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_section_items").upsert([payload], { onConflict: "id" });

      if (error) {
        throw error;
      }
    }, "Section item saved.");
  };

  const handleAddItem = async (sectionId, payload = {}) => {
    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_section_items").insert([
        {
          section_id: sectionId,
          title: payload.title || "New Card",
          subtitle: payload.subtitle || "",
          body: payload.body || "Add a short description here.",
          image_url: payload.image_url || "",
          link_label: payload.link_label || "",
          link_url: payload.link_url || "",
          sort_order: Number(payload.sort_order) || 0,
          is_active: payload.is_active ?? true
        }
      ]);

      if (error) {
        throw error;
      }
    }, "Section item added.");
  };

  const handleDeleteItem = async (itemId) => {
    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_section_items").delete().eq("id", itemId);

      if (error) {
        throw error;
      }
    }, "Section item deleted.");
  };

  const handleUploadAsset = async (file, folder) => {
    try {
      setStatus("", "success");
      assertWritableCms();
      const result = await uploadStorageAsset(file, folder);
      setStatus("Image uploaded.");
      return result.publicUrl;
    } catch (error) {
      setStatus(error.message || "Image upload failed.", "error");
      throw error;
    }
  };

  const handleSubmitContactLead = async ({ full_name, phone }) => {
    const trimmedName = String(full_name || "").trim();
    const trimmedPhone = String(phone || "").trim();

    if (!trimmedName) {
      throw new Error("Name is required.");
    }

    if (!trimmedPhone) {
      throw new Error("Number is required.");
    }

    const { error } = await supabase.from("contact_leads").insert([
      {
        full_name: trimmedName,
        email: "",
        phone: trimmedPhone,
        preferred_contact_method: "phone",
        subject: "Name and number contact form",
        message: "",
        source_page: "contact",
        status: "new"
      }
    ]);

    if (error) {
      throw error;
    }
  };

  const handleSubmitTeamApplication = async (payload) => {
    const fullName = String(payload.full_name || "").trim();
    const email = String(payload.email || "").trim();
    const phone = String(payload.phone || "").trim();

    if (!fullName) {
      throw new Error("Name is required.");
    }

    if (!email) {
      throw new Error("Email is required.");
    }

    if (!phone) {
      throw new Error("Number is required.");
    }

    const { error } = await supabase.from("team_applications").insert([
      {
        full_name: fullName,
        email,
        phone,
        location: String(payload.location || "").trim(),
        experience_level: String(payload.experience_level || "").trim(),
        message: String(payload.message || "").trim(),
        status: "new"
      }
    ]);

    if (error) {
      throw error;
    }
  };

  const authValue = useMemo(() => ({ session, setSession }), [session]);
  const managedPages = useMemo(() => pages.filter((page) => !isRemovedCmsPage(page)), [pages]);
  const landingPages = useMemo(
    () => (cmsDataSource === "database" ? buildPublishedCmsTree(managedPages) : []),
    [cmsDataSource, managedPages]
  );
  const landingContentError =
    !cmsLoading && cmsDataSource !== "database"
      ? cmsError || "Supabase did not return CMS content."
      : !cmsLoading && !landingPages.length
        ? "Supabase returned CMS rows, but no landing pages are published."
        : "";
  const navPages = landingPages.filter((page) => page.slug !== "home");
  const findLandingPageBySlug = (slug) => landingPages.find((page) => page.slug === slug) || null;
  const isAdminRoute = location.pathname.startsWith("/admin");
  const renderLandingPage = (PageComponent, slug, useFirstPage = false) => {
    if (landingContentError) {
      return <ContentUnavailableScreen message={landingContentError} />;
    }

    return (
      <PageComponent
        page={findLandingPageBySlug(slug) || (useFirstPage ? landingPages[0] : null)}
        pagesLoading={cmsLoading}
        siteSettings={siteSettings}
      />
    );
  };
  const renderContactPage = () => {
    if (landingContentError) {
      return <ContentUnavailableScreen message={landingContentError} />;
    }

    return (
      <Contact
        onSubmitContactLead={handleSubmitContactLead}
        page={findLandingPageBySlug("contact")}
        pagesLoading={cmsLoading}
        siteSettings={siteSettings}
      />
    );
  };
  const getAboutTeamMembers = () => {
    const aboutPage = findLandingPageBySlug("about-us");
    const teamSection = (aboutPage?.sections || []).find(
      (section) =>
        section.section_type === "cards" &&
        /team|member/i.test(`${section.section_key} ${section.section_label} ${section.title}`)
    );

    return (teamSection?.items || []).filter((item) => item.is_active !== false);
  };

  return (
    <AuthContext.Provider value={authValue}>
      <div className={isAdminRoute ? "admin-route-shell" : "page-shell"}>
        {!isAdminRoute ? (
          <header className="site-header">
            <Link className="header-logo" to="/">
              {siteSettings.logo_url ? (
                <img alt="" aria-hidden="true" src={siteSettings.logo_url} />
              ) : null}
              <span className="header-logo-name">{siteSettings.site_name}</span>
            </Link>
            <nav className="site-nav">
              {navPages.map((page) => (
                <Link key={page.id} to={slugToHref(page.slug)}>
                  {getPublicNavLabel(page)}
                </Link>
              ))}
            </nav>
            <div className="header-actions">
              <Link className="header-cta" to={siteSettings.footer_cta_button_url || "/contact"}>
                {siteSettings.footer_cta_button_label || "Book a Free Consultation"}
              </Link>
              {session ? <Link className="header-manage" to="/admin">Manage Content</Link> : null}
            </div>
          </header>
        ) : null}
        <Routes>
          <Route
            element={renderLandingPage(Home, "home", true)}
            path="/"
          />
          <Route
            element={renderLandingPage(About, "about-us")}
            path="/about-us"
          />
          <Route
            element={renderLandingPage(InsuranceProducts, "services")}
            path="/services"
          />
          <Route
            element={renderLandingPage(Resources, "resources")}
            path="/resources"
          />
          <Route
            element={
              landingContentError ? (
                <ContentUnavailableScreen message={landingContentError} />
              ) : (
                <JoinOurTeam
                  onSubmitTeamApplication={handleSubmitTeamApplication}
                  page={findLandingPageBySlug("join-our-team")}
                  pagesLoading={cmsLoading}
                  siteSettings={siteSettings}
                  teamMembers={getAboutTeamMembers()}
                />
              )
            }
            path="/join-our-team"
          />
          <Route
            element={renderContactPage()}
            path="/contact"
          />
          <Route
            element={
              <ProtectedAdminRoute loading={cmsLoading} session={session}>
                <Admin
                  cmsDataSource={cmsDataSource}
                  cmsError={cmsError}
                  cmsLoading={cmsLoading}
                  loginLoading={loginLoading}
                  onAddItem={handleAddItem}
                  onAddSection={handleAddSection}
                  onDeleteItem={handleDeleteItem}
                  onDeleteSection={handleDeleteSection}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onRefreshCms={handleRefreshCms}
                  onSaveItem={handleSaveItem}
                  onSavePage={handleSavePage}
                  onSaveSection={handleSaveSection}
                  onSaveSiteSettings={handleSaveSiteSettings}
                  onUploadAsset={handleUploadAsset}
                  pages={managedPages}
                  resolvedEmail={loginResolvedEmail}
                  saveLoading={saveLoading}
                  session={session}
                  siteSettings={siteSettings}
                  statusMessage={statusMessage}
                  statusTone={statusTone}
                />
              </ProtectedAdminRoute>
            }
            path="/admin/*"
          />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
        {!isAdminRoute ? <SiteFooter pages={landingPages} siteSettings={siteSettings} /> : null}
      </div>
    </AuthContext.Provider>
  );
}

function AppRoot() {
  try {
    return <App />;
  } catch (error) {
    if (error.message?.includes("Supabase is not configured")) {
      return <ConfigErrorScreen />;
    }

    throw error;
  }
}

export default AppRoot;
