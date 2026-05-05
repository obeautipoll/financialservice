import { useEffect, useState } from "react";
import { EditorModal, ImageField, NewSectionForm, SectionEditor } from "./AdminPageEditor.jsx";

const getActiveItems = (section) => (section?.items || []).filter((item) => item.is_active !== false);

const getPrimaryImage = (imageList) =>
  String(imageList || "")
    .split(/\s*(?:\r?\n|\|)\s*/)
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean)[0] || "";

function CardHeader({ number, title, children }) {
  return (
    <div className="about-admin-card-head">
      <span className="about-admin-step">{number}</span>
      <div>
        <h3>{title}</h3>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}

function TeamMemberCard({ item, onDelete, onEdit, saveLoading }) {
  return (
    <article className="about-admin-member-card">
      {item.image_url ? (
        <img alt={item.title || "Team member"} className="about-admin-member-photo" src={item.image_url} />
      ) : (
        <div className="about-admin-member-photo placeholder">
          <strong>{String(item.title || "?").slice(0, 1)}</strong>
          <span>No photo yet</span>
        </div>
      )}
      <div>
        <strong>{item.title || "Unnamed member"}</strong>
        <span>{item.subtitle || "No role yet"}</span>
      </div>
      <div className="about-admin-member-actions">
        <button className="primary-button" onClick={() => onEdit(item)} type="button">
          Edit Member
        </button>
        <button className="secondary-button" disabled={saveLoading} onClick={() => onDelete(item)} type="button">
          Delete
        </button>
      </div>
    </article>
  );
}

function TeamMemberEditor({ item, onClose, onDeleteItem, onSaveItem, onUploadAsset, saveLoading }) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    body: "",
    image_url: "",
    link_label: "",
    link_url: "",
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    setForm({
      title: item?.title || "",
      subtitle: item?.subtitle || "",
      body: item?.body || "",
      image_url: item?.image_url || "",
      link_label: item?.link_label || "",
      link_url: item?.link_url || "",
      sort_order: item?.sort_order || 0,
      is_active: item?.is_active ?? true
    });
  }, [item]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSaveItem({
      id: item.id,
      section_id: item.section_id,
      ...form,
      sort_order: Number(form.sort_order) || 0
    });
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete ${item.title || "this team member"}?`);

    if (!confirmed) {
      return;
    }

    await onDeleteItem(item.id);
    onClose();
  };

  return (
    <form className="stack-form about-admin-member-editor" onSubmit={handleSubmit}>
      <div className="about-admin-member-edit-layout">
        <div className="about-admin-member-photo-preview">
          {form.image_url ? (
            <img alt="" aria-hidden="true" src={form.image_url} />
          ) : (
            <div>
              <strong>No photo yet</strong>
              <span>Upload or paste a photo URL below.</span>
            </div>
          )}
        </div>

        <div className="editor-grid">
          <label>
            <span>Member Name</span>
            <input name="title" onChange={handleChange} required type="text" value={form.title} />
          </label>

          <label>
            <span>Role or Title</span>
            <input name="subtitle" onChange={handleChange} type="text" value={form.subtitle} />
          </label>

          <label className="full-span">
            <span>Short Description</span>
            <textarea name="body" onChange={handleChange} rows="4" value={form.body} />
          </label>

          <ImageField
            folder={`items/${item.section_id}`}
            label="Member Photo URL"
            name="image_url"
            onChange={handleChange}
            onUploadAsset={onUploadAsset}
            value={form.image_url}
          />

          <label>
            <span>Sort Order</span>
            <input name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
          </label>

          <label className="checkbox-field">
            <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
            <span>Show this member</span>
          </label>
        </div>
      </div>

      <div className="editor-actions">
        <button className="primary-button" disabled={saveLoading} type="submit">
          Save Member
        </button>
        <button className="secondary-button" onClick={onClose} type="button">
          Cancel
        </button>
        <button className="secondary-button" disabled={saveLoading} onClick={handleDelete} type="button">
          Delete Member
        </button>
      </div>
    </form>
  );
}

function About({
  activeModal,
  editingSection,
  onActiveModalChange,
  onAddItem,
  onAddSection,
  onDeleteItem,
  onDeleteSection,
  onEditingSectionChange,
  onPageChange,
  onSaveItem,
  onSaveSection,
  onSubmitPage,
  onToggleHeroVisible,
  onUploadAsset,
  page,
  pageForm,
  saveLoading
}) {
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const cardSections = (page.sections || []).filter((section) => section.section_type === "cards");
  const ctaSections = (page.sections || []).filter((section) => section.section_type === "cta");
  const teamSection = cardSections[0] || null;
  const historySection =
    (page.sections || []).find((section) => section.section_type === "list") ||
    (page.sections || []).find((section) => section.section_type === "content") ||
    null;
  const internsSection =
    ctaSections.find((section) => /intern|career|join/i.test(`${section.section_label} ${section.title}`)) ||
    ctaSections[0] ||
    null;
  const renderedSectionIds = new Set([teamSection?.id, historySection?.id, internsSection?.id].filter(Boolean));
  const extraSections = (page.sections || []).filter((section) => !renderedSectionIds.has(section.id));
  const teamMembers = getActiveItems(teamSection);
  const historyItems = getActiveItems(historySection);
  const heroImage = getPrimaryImage(pageForm.hero_image_url);

  const editSection = (section) => {
    if (!section) {
      onActiveModalChange("add-section");
      return;
    }

    onEditingSectionChange(section);
    onActiveModalChange("edit-section");
  };

  const addTeamMember = () => {
    if (!teamSection) {
      onActiveModalChange("add-section");
      return;
    }

    onAddItem(teamSection.id, {
      title: "New Team Member",
      subtitle: "Role or Title",
      body: "Short description",
      sort_order: (teamSection.items?.length || 0) + 1
    });
  };

  const editTeamMember = (member) => {
    setEditingTeamMember(member);
    onActiveModalChange("edit-team-member");
  };

  const closeTeamMemberEditor = () => {
    setEditingTeamMember(null);
    onActiveModalChange(null);
  };

  const deleteTeamMember = async (member) => {
    const confirmed = window.confirm(`Delete ${member.title || "this team member"}?`);

    if (!confirmed) {
      return;
    }

    await onDeleteItem(member.id);
  };

  return (
    <div className="about-admin-page">
      <section className="about-admin-intro-card">
        <div>
          <p className="eyebrow">About Us</p>
          <h2>Simple About Page Editor</h2>
          <p>Update the banner, team members, and history without opening every setting at once.</p>
        </div>
        <span className={`about-admin-status${pageForm.is_published ? "" : " muted"}`}>
          {pageForm.is_published ? "Public page is visible" : "Public page is hidden"}
        </span>
      </section>

      <div className="about-admin-grid">
        <article className="about-admin-card about-admin-wide">
          <CardHeader number="1" title="Top Banner">
            This controls the first About Team block visitors see.
          </CardHeader>

          <div className="about-admin-banner-preview">
            <div className="about-admin-copy-preview">
              <span>{pageForm.hero_visible === false ? "Hidden" : "Visible"}</span>
              <h4>{pageForm.hero_title || pageForm.page_title || "About Team"}</h4>
              <p>{pageForm.hero_body || pageForm.page_description || "No banner text yet."}</p>
            </div>
            {heroImage ? (
              <img alt="" aria-hidden="true" src={heroImage} />
            ) : (
              <div className="about-admin-image-placeholder">No banner photo</div>
            )}
          </div>

          <div className="about-admin-actions">
            <button className="primary-button" onClick={() => onActiveModalChange("page-hero")} type="button">
              Edit Banner
            </button>
            <button className="secondary-button" disabled={saveLoading} onClick={onToggleHeroVisible} type="button">
              {pageForm.hero_visible === false ? "Show Banner" : "Hide Banner"}
            </button>
            <button className="secondary-button" onClick={() => onActiveModalChange("page-basic")} type="button">
              Edit Page Name
            </button>
          </div>
        </article>

        <article className="about-admin-card">
          <CardHeader number="2" title="Our Team">
            {teamMembers.length} team member{teamMembers.length === 1 ? "" : "s"}
          </CardHeader>

          <div className="about-admin-member-grid">
            {teamMembers.length ? (
              teamMembers.map((item) => (
                <TeamMemberCard
                  item={item}
                  key={item.id}
                  onDelete={deleteTeamMember}
                  onEdit={editTeamMember}
                  saveLoading={saveLoading}
                />
              ))
            ) : (
              <p className="about-admin-empty">No team members yet. Click Add Team Member to create the first card.</p>
            )}
          </div>

          <div className="about-admin-actions">
            <button className="primary-button" disabled={saveLoading} onClick={addTeamMember} type="button">
              Add Team Member
            </button>
            <button className="secondary-button" onClick={() => editSection(teamSection)} type="button">
              Edit Team Section
            </button>
          </div>
        </article>

        <article className="about-admin-card">
          <CardHeader number="3" title="History">
            {historyItems.length} history item{historyItems.length === 1 ? "" : "s"}
          </CardHeader>

          <div className="about-admin-history-list">
            {historyItems.length ? (
              historyItems.slice(0, 3).map((item) => (
                <div className="about-admin-history-row" key={item.id}>
                  <strong>{item.subtitle || item.title || "History item"}</strong>
                  <span>{item.title}</span>
                </div>
              ))
            ) : (
              <p className="about-admin-empty">No history items yet.</p>
            )}
          </div>

          <div className="about-admin-actions">
            <button className="primary-button" onClick={() => editSection(historySection)} type="button">
              Edit History
            </button>
          </div>
        </article>

        <article className="about-admin-card">
          <CardHeader number="4" title="Other About Blocks">
            Interns and supporting sections
          </CardHeader>

          <div className="about-admin-section-list">
            {internsSection ? (
              <button className="about-admin-section-button" onClick={() => editSection(internsSection)} type="button">
                <strong>{internsSection.title || internsSection.section_label}</strong>
                <span>{internsSection.is_active ? "Visible" : "Hidden"}</span>
              </button>
            ) : null}
            {extraSections.map((section) => (
              <button className="about-admin-section-button" key={section.id} onClick={() => editSection(section)} type="button">
                <strong>{section.title || section.section_label}</strong>
                <span>{section.is_active ? "Visible" : "Hidden"}</span>
              </button>
            ))}
            {!internsSection && !extraSections.length ? <p className="about-admin-empty">No extra blocks yet.</p> : null}
          </div>

          <div className="about-admin-actions">
            <button className="secondary-button" onClick={() => onActiveModalChange("add-section")} type="button">
              Add Block
            </button>
            <button className="secondary-button" onClick={() => onActiveModalChange("page-seo")} type="button">
              Edit SEO
            </button>
          </div>
        </article>
      </div>

      {activeModal === "page-basic" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit About Page Name">
          <form className="stack-form" onSubmit={onSubmitPage}>
            <div className="editor-grid">
              <label>
                <span>Menu Label</span>
                <input name="nav_label" onChange={onPageChange} required type="text" value={pageForm.nav_label} />
              </label>
              <label className="checkbox-field">
                <input checked={pageForm.is_published} name="is_published" onChange={onPageChange} type="checkbox" />
                <span>Show this page publicly</span>
              </label>
              <label className="full-span">
                <span>Page Title</span>
                <input name="page_title" onChange={onPageChange} required type="text" value={pageForm.page_title} />
              </label>
              <label className="full-span">
                <span>Short Description</span>
                <textarea name="page_description" onChange={onPageChange} rows="4" value={pageForm.page_description} />
              </label>
            </div>
            <div className="editor-actions">
              <button className="primary-button" disabled={saveLoading} type="submit">
                Save
              </button>
              <button className="secondary-button" onClick={() => onActiveModalChange(null)} type="button">
                Cancel
              </button>
            </div>
          </form>
        </EditorModal>
      ) : null}

      {activeModal === "edit-team-member" && editingTeamMember ? (
        <EditorModal onClose={closeTeamMemberEditor} title="Edit Team Member">
          <TeamMemberEditor
            item={editingTeamMember}
            onClose={closeTeamMemberEditor}
            onDeleteItem={onDeleteItem}
            onSaveItem={onSaveItem}
            onUploadAsset={onUploadAsset}
            saveLoading={saveLoading}
          />
        </EditorModal>
      ) : null}

      {activeModal === "page-hero" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Top Banner">
          <form className="stack-form" onSubmit={onSubmitPage}>
            <div className="editor-grid">
              <label className="checkbox-field full-span">
                <input checked={pageForm.hero_visible !== false} name="hero_visible" onChange={onPageChange} type="checkbox" />
                <span>Show banner on public page</span>
              </label>
              <label className="full-span">
                <span>Banner Title</span>
                <input name="hero_title" onChange={onPageChange} type="text" value={pageForm.hero_title} />
              </label>
              <label className="full-span">
                <span>Banner Text</span>
                <textarea name="hero_body" onChange={onPageChange} rows="5" value={pageForm.hero_body} />
              </label>
              <label>
                <span>Button Text</span>
                <input
                  name="hero_primary_button_label"
                  onChange={onPageChange}
                  type="text"
                  value={pageForm.hero_primary_button_label}
                />
              </label>
              <label>
                <span>Button Link</span>
                <input
                  name="hero_primary_button_url"
                  onChange={onPageChange}
                  type="text"
                  value={pageForm.hero_primary_button_url}
                />
              </label>
              <ImageField
                folder={`pages/${page.slug}`}
                label="Banner Photo URL"
                name="hero_image_url"
                onChange={onPageChange}
                onUploadAsset={onUploadAsset}
                value={pageForm.hero_image_url}
              />
            </div>
            <div className="editor-actions">
              <button className="primary-button" disabled={saveLoading} type="submit">
                Save Banner
              </button>
              <button className="secondary-button" onClick={() => onActiveModalChange(null)} type="button">
                Cancel
              </button>
            </div>
          </form>
        </EditorModal>
      ) : null}

      {activeModal === "page-seo" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit About SEO">
          <form className="stack-form" onSubmit={onSubmitPage}>
            <div className="editor-grid">
              <label>
                <span>SEO Title</span>
                <input name="seo_title" onChange={onPageChange} type="text" value={pageForm.seo_title} />
              </label>
              <label>
                <span>SEO Description</span>
                <input name="seo_description" onChange={onPageChange} type="text" value={pageForm.seo_description} />
              </label>
            </div>
            <div className="editor-actions">
              <button className="primary-button" disabled={saveLoading} type="submit">
                Save SEO
              </button>
              <button className="secondary-button" onClick={() => onActiveModalChange(null)} type="button">
                Cancel
              </button>
            </div>
          </form>
        </EditorModal>
      ) : null}

      {activeModal === "add-section" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Add About Block">
          <NewSectionForm
            hideSystemFields
            onAddSection={onAddSection}
            onClose={() => onActiveModalChange(null)}
            onUploadAsset={onUploadAsset}
            page={page}
            saveLoading={saveLoading}
          />
        </EditorModal>
      ) : null}

      {activeModal === "edit-section" && editingSection ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title={`Edit ${editingSection.section_label}`}>
          <SectionEditor
            hideSystemFields
            isAboutPage
            onAddItem={onAddItem}
            onAfterSave={() => onActiveModalChange(null)}
            onDeleteItem={onDeleteItem}
            onDeleteSection={onDeleteSection}
            onSaveItem={onSaveItem}
            onSaveSection={onSaveSection}
            onUploadAsset={onUploadAsset}
            saveLoading={saveLoading}
            section={editingSection}
          />
        </EditorModal>
      ) : null}
    </div>
  );
}

export default About;
