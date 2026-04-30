import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";

function Admin({
  cmsDataSource,
  cmsError,
  cmsLoading,
  loginLoading,
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
  onLogin,
  pages,
  resolvedEmail,
  saveLoading,
  session,
  siteSettings,
  statusMessage,
  statusTone
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
      onAddItem={onAddItem}
      onAddSection={onAddSection}
      onDeleteItem={onDeleteItem}
      onDeleteSection={onDeleteSection}
      onLogout={onLogout}
      onSaveItem={onSaveItem}
      onSavePage={onSavePage}
      onSaveSection={onSaveSection}
      onSaveSiteSettings={onSaveSiteSettings}
      onUploadAsset={onUploadAsset}
      cmsDataSource={cmsDataSource}
      cmsError={cmsError}
      cmsLoading={cmsLoading}
      pages={pages}
      saveLoading={saveLoading}
      siteSettings={siteSettings}
      statusMessage={statusMessage}
      statusTone={statusTone}
    />
  );
}

export default Admin;
