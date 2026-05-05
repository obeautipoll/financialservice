import React, { useEffect, useState } from "react";

// --- Defaults & Helpers ---
const siteDefaults = {
  site_name: "",
  logo_url: "",
  footer_cta_visible: true,
  footer_cta_title: "",
  footer_cta_body: "",
  footer_cta_button_label: "",
  footer_cta_button_url: "",
  office_location_title: "",
  office_location_address: "",
  contact_phone: "",
  contact_email: "",
  social_links: [],
  footer_quicklinks_visible: true,
  copyright_name: ""
};

const socialLinkDefaults = {
  label: "",
  logo_url: "",
  link_url: "",
  sort_order: 0,
  is_active: true
};

const normalizeSocialLinks = (socialLinks) => {
  if (Array.isArray(socialLinks)) {
    return socialLinks.map((link, index) => ({
      ...socialLinkDefaults,
      ...link,
      sort_order: Number(link?.sort_order) || index + 1
    }));
  }
  return [];
};

// --- Sub-Component: Image Field with Preview ---
function ImageField({ folder, label, name, onChange, onUploadAsset, value }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const publicUrl = await onUploadAsset(file, folder);
      onChange({ target: { name, type: "text", value: publicUrl } });
      setFile(null);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.imageInputWrapper}>
        {value && <img src={value} alt="Preview" style={styles.miniPreview} />}
        <input
          name={name}
          onChange={onChange}
          placeholder="https://image-url.com"
          style={styles.input}
          type="url"
          value={value}
        />
      </div>
      <div style={styles.uploadRow}>
        <input 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          style={styles.fileInput} 
          type="file" 
        />
        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          style={!file || uploading ? styles.btnDisabled : styles.btnSecondary}
          type="button"
        >
          {uploading ? "..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
function SiteInformation({ onSaveSiteSettings, onUploadAsset, saveLoading, siteSettings, statusTone }) {
  const [siteForm, setSiteForm] = useState(siteDefaults);

  useEffect(() => {
    if (siteSettings) {
      setSiteForm({
        ...siteDefaults,
        ...siteSettings,
        social_links: normalizeSocialLinks(siteSettings.social_links)
      });
    }
  }, [siteSettings]);

  const handleSiteChange = (event) => {
    const { checked, name, type, value } = event.target;
    setSiteForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSocialLinkChange = (index, field, value) => {
    setSiteForm((current) => {
      const updated = [...current.social_links];
      updated[index] = { ...updated[index], [field]: value };
      return { ...current, social_links: updated };
    });
  };

  const handleAddSocialLink = () => {
    setSiteForm((curr) => ({
      ...curr,
      social_links: [...curr.social_links, { ...socialLinkDefaults, id: Date.now() }]
    }));
  };

  const handleRemoveSocialLink = (index) => {
    setSiteForm((curr) => ({
      ...curr,
      social_links: curr.social_links.filter((_, i) => i !== index)
    }));
  };

  const submitSiteSettings = async (e) => {
    e.preventDefault();
    await onSaveSiteSettings(siteForm);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submitSiteSettings}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={{ flex: 1 }}>
            <h2 style={styles.title}>Basic Landing Page Information</h2>
            <p style={styles.subtitle}>Update your brand identity, contact info, and global footer settings.</p>
          </div>
          <button disabled={saveLoading} style={saveLoading ? styles.btnDisabled : styles.btnPrimary} type="submit">
            {saveLoading ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>

        {/* Status Message */}
        {statusTone && (
          <div style={{ ...styles.statusBanner, backgroundColor: statusTone === "error" ? "#fee2e2" : "#dcfce7" }}>
            <p style={{ color: statusTone === "error" ? "#991b1b" : "#166534", margin: 0, fontWeight: "500" }}>
              {statusTone === "error" ? "Something went wrong. Please check your fields." : "Settings updated successfully!"}
            </p>
          </div>
        )}

        <div style={styles.grid}>
          {/* Card 1: Branding */}
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Brand Identity</h3>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Site Name</label>
              <input
                name="site_name"
                onChange={handleSiteChange}
                required
                style={styles.input}
                type="text"
                value={siteForm.site_name}
              />
            </div>
            <ImageField
              folder="site-settings"
              label="Logo"
              name="logo_url"
              onChange={handleSiteChange}
              onUploadAsset={onUploadAsset}
              value={siteForm.logo_url}
            />
          </section>

          {/* Card 2: Contact Information */}
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Contact Details</h3>
            <div style={styles.twoColumn}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input name="contact_email" onChange={handleSiteChange} style={styles.input} type="email" value={siteForm.contact_email} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone Number</label>
                <input name="contact_phone" onChange={handleSiteChange} style={styles.input} type="text" value={siteForm.contact_phone} />
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Copyright Name</label>
              <input name="copyright_name" onChange={handleSiteChange} style={styles.input} type="text" value={siteForm.copyright_name} />
            </div>
          </section>

          {/* Card 3: Footer Call-to-Action */}
          <section style={{ ...styles.card, gridColumn: "1 / -1" }}>
            <div style={styles.cardHeaderAction}>
              <h3 style={styles.cardTitle}>Footer Call-to-Action</h3>
              <label style={styles.checkboxLabel}>
                <input checked={siteForm.footer_cta_visible} name="footer_cta_visible" onChange={handleSiteChange} type="checkbox" />
                <span>Show consultation callout on public pages</span>
              </label>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>CTA Title</label>
              <input name="footer_cta_title" onChange={handleSiteChange} style={styles.input} type="text" value={siteForm.footer_cta_title} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>CTA Body Text</label>
              <textarea name="footer_cta_body" onChange={handleSiteChange} rows="3" style={styles.textarea} value={siteForm.footer_cta_body} />
            </div>
            <div style={styles.twoColumn}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Button Label</label>
                <input name="footer_cta_button_label" onChange={handleSiteChange} style={styles.input} type="text" value={siteForm.footer_cta_button_label} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Button URL</label>
                <input name="footer_cta_button_url" onChange={handleSiteChange} style={styles.input} type="text" value={siteForm.footer_cta_button_url} />
              </div>
            </div>
          </section>

          {/* Card 4: Social Links */}
          <section style={{ ...styles.card, gridColumn: "1 / -1" }}>
            <div style={styles.cardHeaderAction}>
              <h3 style={styles.cardTitle}>Social Media Profiles</h3>
              <button onClick={handleAddSocialLink} style={styles.btnSecondary} type="button">+ Add New Social</button>
            </div>
            <div style={styles.socialList}>
              {siteForm.social_links.length > 0 ? (
                siteForm.social_links.map((link, index) => (
                  <div key={link.id || index} style={styles.socialRow}>
                    <input
                      onChange={(e) => handleSocialLinkChange(index, "label", e.target.value)}
                      placeholder="Platform Name"
                      style={{ ...styles.input, flex: 1 }}
                      value={link.label}
                    />
                    <input
                      onChange={(e) => handleSocialLinkChange(index, "link_url", e.target.value)}
                      placeholder="Profile URL"
                      style={{ ...styles.input, flex: 2 }}
                      value={link.link_url}
                    />
                    <button onClick={() => handleRemoveSocialLink(index)} style={styles.btnDanger} type="button">Remove</button>
                  </div>
                ))
              ) : (
                <p style={{ color: "#888", fontSize: "14px", fontStyle: "italic" }}>No social profiles added yet.</p>
              )}
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}

// --- Full-Width Modern Styles ---
const styles = {
  container: { 
    width: "100%", 
    padding: "32px", 
    boxSizing: "border-box", 
    fontFamily: "'Inter', system-ui, sans-serif",
    backgroundColor: "transparent"
  },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "32px", 
    gap: "20px" 
  },
  title: { fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0", color: "#1e293b" },
  subtitle: { color: "#64748b", fontSize: "15px", margin: 0 },
  
  // Grid expands to 2 columns on desktops, but spans full width
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(48%, 1fr))", 
    gap: "24px",
    width: "100%" 
  },
  
  card: { 
    background: "#fff", 
    border: "1px solid #e2e8f0", 
    borderRadius: "16px", 
    padding: "32px", 
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" 
  },
  cardTitle: { fontSize: "20px", fontWeight: "600", margin: "0 0 24px 0", color: "#334155" },
  cardHeaderAction: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px"
  },
  
  fieldGroup: { marginBottom: "20px" },
  label: { display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#475569" },
  input: { 
    width: "100%", 
    padding: "12px 16px", 
    borderRadius: "10px", 
    border: "1px solid #cbd5e1", 
    fontSize: "15px", 
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    outline: "none"
  },
  textarea: { 
    width: "100%", 
    padding: "12px 16px", 
    borderRadius: "10px", 
    border: "1px solid #cbd5e1", 
    fontSize: "15px", 
    boxSizing: "border-box", 
    resize: "vertical",
    minHeight: "80px"
  },
  
  twoColumn: { display: "flex", gap: "20px", flexWrap: "wrap" },
  imageInputWrapper: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" },
  miniPreview: { 
    width: "56px", 
    height: "56px", 
    borderRadius: "10px", 
    objectFit: "contain", 
    background: "#f8fafc", 
    border: "1px solid #e2e8f0",
    padding: "4px"
  },
  uploadRow: { display: "flex", gap: "12px", alignItems: "center" },
  fileInput: { fontSize: "13px", color: "#64748b" },
  
  btnPrimary: { 
    background: "#2563eb", 
    color: "#fff", 
    border: "none", 
    padding: "12px 28px", 
    borderRadius: "10px", 
    fontWeight: "600", 
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)"
  },
  btnSecondary: { 
    background: "#f1f5f9", 
    color: "#475569", 
    border: "1px solid #e2e8f0", 
    padding: "10px 20px", 
    borderRadius: "10px", 
    fontWeight: "600", 
    cursor: "pointer" 
  },
  btnDanger: { 
    background: "transparent", 
    color: "#ef4444", 
    border: "1px solid #fecaca", 
    padding: "8px 16px", 
    borderRadius: "8px", 
    fontSize: "13px", 
    cursor: "pointer",
    fontWeight: "500"
  },
  btnDisabled: { background: "#e2e8f0", color: "#94a3b8", border: "none", padding: "12px 28px", borderRadius: "10px", cursor: "not-allowed" },
  
  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "500", color: "#334155" },
  statusBanner: { padding: "16px 24px", borderRadius: "12px", marginBottom: "32px", border: "1px solid rgba(0,0,0,0.05)" },
  socialList: { display: "flex", flexDirection: "column", gap: "12px" },
  socialRow: { display: "flex", gap: "12px", alignItems: "center" }
};

export default SiteInformation;