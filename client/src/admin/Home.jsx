import React from "react";
import AdminPageEditor from "./AdminPageEditor.jsx";

const editorConfig = {
  sectionDescription: "Manage the core visual and content sections of your home page, including the hero area, service overview, and recruitment callouts."
};

/**
 * Home Page Editor Component
 * Updated for a wide, fluid UI that matches the modern dashboard layout.
 */
function Home(props) {
  return (
    <div style={styles.pageWrapper}>
      {/* Page Header Area */}
      <header style={styles.header}>
        <div style={styles.titleStack}>
          <h1 style={styles.mainTitle}>Home Page Content</h1>
          <p style={styles.description}>{editorConfig.sectionDescription}</p>
        </div>
        
        {/* Optional: Add a 'View Live' button if your routing supports it */}
        <div style={styles.actions}>
          <a href="/" target="_blank" rel="noreferrer" style={styles.viewLink}>
            View Live Page ↗
          </a>
        </div>
      </header>

      {/* Main Editor Surface */}
      <main style={styles.editorSurface}>
        <AdminPageEditor {...props} editorConfig={editorConfig} />
      </main>
    </div>
  );
}

// --- Modern Fluid Styles ---
const styles = {
  pageWrapper: {
    width: "100%",
    minHeight: "100vh",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    backgroundColor: "transparent", // Lets the main dashboard background show through
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
    gap: "24px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "24px",
  },
  titleStack: {
    flex: 1,
  },
  mainTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-0.02em",
  },
  description: {
    color: "#64748b",
    fontSize: "16px",
    margin: 0,
    maxWidth: "800px",
    lineHeight: "1.6",
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
  viewLink: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2563eb",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    transition: "all 0.2s ease",
  },
  editorSurface: {
    width: "100%",
    // This ensures that the internal components of AdminPageEditor
    // can expand to fill the wide layout.
  }
};

export default Home;