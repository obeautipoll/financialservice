import { createContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import Admin from "./admin.jsx";
import { ensureSupabase } from "./supabase.js";

export const AuthContext = createContext(null);

const fallbackConfig = {
  site_name: "Content Management System",
  logo_url: "",
  description: "Update this content from the admin dashboard."
};

const loginLookupTables = (
  import.meta.env.VITE_LOGIN_LOOKUP_TABLES || "users,admin_users"
)
  .split(",")
  .map((table) => table.trim())
  .filter(Boolean);

function LandingPage({ config, configLoading, session }) {
  return (
    <main className="landing-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Supabase CMS</p>
          <h1>{config.site_name}</h1>
          <p>{config.description}</p>

          {!session ? (
            <Link className="primary-button link-button" to="/admin">
              Admin Login
            </Link>
          ) : null}
        </div>

        <div className="hero-visual">
          {config.logo_url ? (
            <img alt={`${config.site_name} logo`} className="site-logo" src={config.logo_url} />
          ) : (
            <div className="logo-placeholder large">Add a logo URL in the dashboard</div>
          )}
        </div>
      </section>

      <section className="info-strip">
        <div className="info-card">
          <h2>Dynamic Landing Page</h2>
          <p>Rendered with React and loaded from the `landing_page_config` table.</p>
        </div>
        <div className="info-card">
          <h2>Admin Editing</h2>
          <p>Update site name, logo URL, and description with Supabase Auth protection.</p>
        </div>
        <div className="info-card">
          <h2>Status</h2>
          <p>{configLoading ? "Loading content..." : "Content loaded from Supabase."}</p>
        </div>
      </section>
    </main>
  );
}

function ProtectedAdminRoute({ children, session, config }) {
  if (session && !config) {
    return <div className="page-shell">Loading dashboard...</div>;
  }

  return <>{children}</>;
}

function App() {
  const [session, setSession] = useState(null);
  const [config, setConfig] = useState(fallbackConfig);
  const [configLoading, setConfigLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const supabase = ensureSupabase();

  const loadConfig = async () => {
    try {
      setConfigLoading(true);
      const { data, error } = await supabase
        .from("landing_page_config")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      setStatusMessage(error.message || "Unable to load site configuration.");
    } finally {
      setConfigLoading(false);
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

      await loadConfig();
    };

    bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
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

    let lastLookupError = null;

    for (const tableName of loginLookupTables) {
      const { data: account, error: lookupError } = await supabase
        .from(tableName)
        .select("email")
        .eq("username", normalizedIdentifier)
        .maybeSingle();

      if (lookupError) {
        if (lookupError.code === "PGRST205" || lookupError.status === 404) {
          continue;
        }

        lastLookupError = lookupError;
        break;
      }

      if (account?.email) {
        return account.email;
      }
    }

    if (lastLookupError) {
      throw lastLookupError;
    }

    throw new Error(
      `Username login is not configured for the available tables (${loginLookupTables.join(", ")}), or the username was not found. You can also sign in with your email instead.`
    );
  };

  const handleLogin = async ({ username, password }) => {
    try {
      setLoginLoading(true);
      setStatusMessage("");

      const email = await resolveLoginEmail(username);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      setStatusMessage("Login successful.");
    } catch (error) {
      setStatusMessage(error.message || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStatusMessage("Signed out.");
  };

  const handleSave = async (payload) => {
    try {
      setSaveLoading(true);
      setStatusMessage("");

      const recordId = config?.id || 1;
      const { data, error } = await supabase
        .from("landing_page_config")
        .upsert(
          [
            {
              id: recordId,
              site_name: payload.site_name,
              logo_url: payload.logo_url,
              description: payload.description
            }
          ],
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setConfig(data);
      setStatusMessage("Landing page content saved.");
    } catch (error) {
      setStatusMessage(error.message || "Save failed.");
    } finally {
      setSaveLoading(false);
    }
  };

  const authValue = useMemo(() => ({ session, setSession }), [session]);

  return (
    <AuthContext.Provider value={authValue}>
      <div className="page-shell">
        <header className="site-header">
          <Link className="brand-mark" to="/">
            CMS
          </Link>
          <nav className="site-nav">
            <Link to="/">Home</Link>
            <Link to="/admin">{session ? "Dashboard" : "Admin"}</Link>
          </nav>
        </header>

        <Routes>
          <Route
            element={<LandingPage config={config} configLoading={configLoading} session={session} />}
            path="/"
          />
          <Route
            element={
              <ProtectedAdminRoute config={config} session={session}>
                <Admin
                  config={config}
                  loginLoading={loginLoading}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onSave={handleSave}
                  saveLoading={saveLoading}
                  session={session}
                  statusMessage={statusMessage}
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

export default App;
