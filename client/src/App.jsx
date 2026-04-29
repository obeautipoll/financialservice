import { createContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Admin from "./admin/Admin.jsx";
import About from "./landing/About.jsx";
import Contact from "./landing/Contact.jsx";
import FreeAssessment from "./landing/FreeAssessment.jsx";
import Home from "./landing/Home.jsx";
import JoinOurTeam from "./landing/JoinOurTeam.jsx";
import Resources from "./landing/Resources.jsx";
import Services from "./landing/Services.jsx";
import { ensureSupabase, getSupabaseConfigStatus, uploadStorageAsset } from "./supabase.js";

export const AuthContext = createContext(null);

const fallbackSiteSettings = {
  site_name: "Financial Services",
  logo_url: "",
  footer_cta_title: "Ready to take the next step?",
  footer_cta_body:
    "Book a free consultation today and let our team help you create a financial protection plan.",
  footer_cta_button_label: "Book a Free Consultation",
  footer_cta_button_url: "/contact"
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
    hero_secondary_button_label: "Start Free Assessment",
    hero_secondary_button_url: "/free-assessment",
    hero_image_url: "",
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

const slugToHref = (slug) => (slug === "home" ? "/" : `/${slug}`);

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

function App() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [siteSettings, setSiteSettings] = useState(fallbackSiteSettings);
  const [pages, setPages] = useState(fallbackPages);
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

  const loadCms = async () => {
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

      if (settingsRow) {
        setSiteSettings(settingsRow);
      } else {
        setSiteSettings(fallbackSiteSettings);
      }

      if (pageRows?.length) {
        setPages(buildCmsTree(pageRows, sectionRows || [], itemRows || []));
      } else {
        setPages(fallbackPages);
      }
    } catch (error) {
      setSiteSettings(fallbackSiteSettings);
      setPages(fallbackPages);
      setStatus(error.message || "Unable to load site content.", "error");
    } finally {
      setCmsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      if (active) {
        setSession(currentSession);
      }

      await loadCms();
    };

    bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await loadCms();
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

  const saveAndReload = async (callback, successMessage) => {
    try {
      setSaveLoading(true);
      setStatus("", "success");
      await callback();
      await loadCms();
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

  const handleAddSection = async (pageId) => {
    const sectionKey = `section-${Date.now()}`;

    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_sections").insert([
        {
          page_id: pageId,
          section_key: sectionKey,
          section_label: "New Section",
          section_type: "content",
          title: "New Section",
          body: "Add content here.",
          sort_order: Date.now(),
          is_active: true
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

  const handleAddItem = async (sectionId) => {
    await saveAndReload(async () => {
      const { error } = await supabase.from("cms_section_items").insert([
        {
          section_id: sectionId,
          title: "New Item",
          body: "Add item content here.",
          sort_order: Date.now(),
          is_active: true
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
      const result = await uploadStorageAsset(file, folder);
      setStatus("Image uploaded.");
      return result.publicUrl;
    } catch (error) {
      setStatus(error.message || "Image upload failed.", "error");
      throw error;
    }
  };

  const authValue = useMemo(() => ({ session, setSession }), [session]);
  const navPages = pages.filter((page) => page.is_published || session);
  const findPageBySlug = (slug) => pages.find((page) => page.slug === slug) || null;
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <AuthContext.Provider value={authValue}>
      <div className={isAdminRoute ? "admin-route-shell" : "page-shell"}>
        {!isAdminRoute ? (
          <header className="site-header">
            <Link className="header-logo" to="/">
              {siteSettings.logo_url ? (
                <img alt={siteSettings.site_name} src={siteSettings.logo_url} />
              ) : (
                <span>{siteSettings.site_name}</span>
              )}
            </Link>
            <nav className="site-nav">
              {navPages.map((page) => (
                <Link key={page.id} to={slugToHref(page.slug)}>
                  {page.nav_label}
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
            element={
              <Home page={findPageBySlug("home") || pages[0] || null} pagesLoading={cmsLoading} siteSettings={siteSettings} />
            }
            path="/"
          />
          <Route
            element={<About page={findPageBySlug("about-us")} pagesLoading={cmsLoading} siteSettings={siteSettings} />}
            path="/about-us"
          />
          <Route
            element={<Services page={findPageBySlug("services")} pagesLoading={cmsLoading} siteSettings={siteSettings} />}
            path="/services"
          />
          <Route
            element={
              <FreeAssessment
                page={findPageBySlug("free-assessment")}
                pagesLoading={cmsLoading}
                siteSettings={siteSettings}
              />
            }
            path="/free-assessment"
          />
          <Route
            element={<Resources page={findPageBySlug("resources")} pagesLoading={cmsLoading} siteSettings={siteSettings} />}
            path="/resources"
          />
          <Route
            element={
              <JoinOurTeam
                page={findPageBySlug("join-our-team")}
                pagesLoading={cmsLoading}
                siteSettings={siteSettings}
              />
            }
            path="/join-our-team"
          />
          <Route
            element={<Contact page={findPageBySlug("contact")} pagesLoading={cmsLoading} siteSettings={siteSettings} />}
            path="/contact"
          />
          <Route
            element={
              <ProtectedAdminRoute loading={cmsLoading} session={session}>
                <Admin
                  loginLoading={loginLoading}
                  onAddItem={handleAddItem}
                  onAddSection={handleAddSection}
                  onDeleteItem={handleDeleteItem}
                  onDeleteSection={handleDeleteSection}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onSaveItem={handleSaveItem}
                  onSavePage={handleSavePage}
                  onSaveSection={handleSaveSection}
                  onSaveSiteSettings={handleSaveSiteSettings}
                  onUploadAsset={handleUploadAsset}
                  pages={pages}
                  resolvedEmail={loginResolvedEmail}
                  saveLoading={saveLoading}
                  session={session}
                  siteSettings={siteSettings}
                  statusMessage={statusMessage}
                  statusTone={statusTone}
                />
              </ProtectedAdminRoute>
            }
            path="/admin"
          />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
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
