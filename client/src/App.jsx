import { createContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import Admin from "./admin.jsx";
import SignUp from "./components/SignUp.jsx";
import { ensureSupabase, getSupabaseConfigStatus } from "./supabase.js";

export const AuthContext = createContext(null);

const fallbackConfig = {
  site_name: "Content Management System",
  logo_url: "",
  description: "Update this content from the admin dashboard."
};

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
  const [session, setSession] = useState(null);
  const [config, setConfig] = useState(fallbackConfig);
  const [configLoading, setConfigLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpCooldownUntil, setSignUpCooldownUntil] = useState(0);
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

  const resolveLoginEmail = async (username) => {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      throw new Error("Username is required.");
    }

    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("username", normalizedUsername)
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
      setStatusMessage("");

      const email = await resolveLoginEmail(username);

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

  const handleSignUp = async ({ username, email, password }) => {
    try {
      setSignUpLoading(true);
      setStatusMessage("");

      if (Date.now() < signUpCooldownUntil) {
        throw new Error("Too many signup attempts. Wait a minute, then try again.");
      }

      const normalizedUsername = username.trim().toLowerCase();
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedUsername) {
        throw new Error("Username is required.");
      }

      if (!normalizedEmail) {
        throw new Error("Email is required.");
      }

      const { error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password
      });

      if (authError) {
        if (authError.status === 429) {
          setSignUpCooldownUntil(Date.now() + 60 * 1000);
          throw new Error(
            "Email rate limit exceeded. Wait at least 1 minute before trying signup again."
          );
        }

        if (authError.message?.toLowerCase().includes("user already registered")) {
          throw new Error("That email is already registered. Try signing in instead.");
        }

        throw authError;
      }

      const { error: insertError } = await supabase.from("users").insert({
        email: normalizedEmail,
        username: normalizedUsername
      });

      if (insertError) {
        throw insertError;
      }

      setStatusMessage(
        "Account created. If email confirmation is enabled in Supabase, confirm your email before signing in."
      );
    } catch (error) {
      setStatusMessage(error.message || "Sign up failed.");
    } finally {
      setSignUpLoading(false);
    }
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
          <Route
            element={
              session ? (
                <Navigate replace to="/admin" />
              ) : (
                <SignUp
                  cooldownActive={Date.now() < signUpCooldownUntil}
                  loading={signUpLoading}
                  message={statusMessage}
                  onSignUp={handleSignUp}
                />
              )
            }
            path="/signup"
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
