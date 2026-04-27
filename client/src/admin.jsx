import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";

function Admin({
  config,
  loginLoading,
  onLogin,
  onLogout,
  resolvedEmail,
  onSave,
  saveLoading,
  session,
  statusMessage
}) {
  if (!session) {
    return (
      <Login
        loading={loginLoading}
        message={statusMessage}
        onLogin={onLogin}
        resolvedEmail={resolvedEmail}
      />
    );
  }

  return (
    <Dashboard
      config={config}
      onLogout={onLogout}
      onSave={onSave}
      saveLoading={saveLoading}
      statusMessage={statusMessage}
    />
  );
}

export default Admin;
