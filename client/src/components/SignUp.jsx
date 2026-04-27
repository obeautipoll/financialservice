import { Link } from "react-router-dom";
import { useState } from "react";

function SignUp({ cooldownActive, loading, message, onSignUp }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSignUp({ email, password, username });
  };

  return (
    <section className="card auth-card">
      <div className="section-heading">
        <p className="eyebrow">Admin Sign Up</p>
        <h2>Create a CMS account</h2>
        <p>This creates a Supabase Auth user and stores your username mapping in `users`.</p>
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
            autoComplete="new-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <button className="primary-button" disabled={loading || cooldownActive} type="submit">
          {loading
            ? "Creating Account..."
            : cooldownActive
              ? "Wait Before Retrying"
              : "Create Account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/admin">Sign in</Link>
      </p>

      {message ? <p className="status-message error">{message}</p> : null}
    </section>
  );
}

export default SignUp;
