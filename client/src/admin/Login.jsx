import { useState } from "react";

function Login({ onLogin, loading, message, resolvedEmail }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin({ username, password });
  };

  return (
    <section className="card auth-card">
      <div className="section-heading">
        <p className="eyebrow">Secure Access</p>
        <h2>Log in to update website content</h2>
        <p>Use your username or Supabase Auth email, plus your password.</p>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          <span>Username or email</span>
          <input
            autoComplete="username"
            name="username"
            onChange={(event) => setUsername(event.target.value)}
            required
            type="text"
            value={username}
          />
        </label>

        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {resolvedEmail ? <p className="status-message">Resolved email: {resolvedEmail}</p> : null}

      {message ? <p className="status-message error">{message}</p> : null}
    </section>
  );
}

export default Login;
