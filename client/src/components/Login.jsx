import { Link } from "react-router-dom";
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
        <p className="eyebrow">Admin Access</p>
        <h2>Log in to manage site content</h2>
        <p>Use your username and password.</p>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          <span>Username</span>
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

      <p className="auth-switch">
        Need an account? <Link to="/signup">Create one</Link>
      </p>

      {resolvedEmail ? <p className="status-message">Resolved email: {resolvedEmail}</p> : null}

      {message ? <p className="status-message error">{message}</p> : null}
    </section>
  );
}

export default Login;
