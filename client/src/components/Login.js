import { useState } from "react";

function Login({ onLogin, loading, message }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin({ email, password });
  };

  return (
    <section className="card auth-card">
      <div className="section-heading">
        <p className="eyebrow">Admin Access</p>
        <h2>Log in to manage site content</h2>
        <p>Use your Supabase Auth email and password.</p>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
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

      {message ? <p className="status-message error">{message}</p> : null}
    </section>
  );
}

export default Login;
