import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EditorModal, ImageField, NewSectionForm, SectionEditor } from "./AdminPageEditor.jsx";

const getItems = (section) => section?.items || [];

const getPrimaryImage = (imageList) =>
  String(imageList || "")
    .split(/\s*(?:\r?\n|\|)\s*/)
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean)[0] || "";

const getJoinSections = (page) => {
  const cardSections = (page.sections || []).filter((section) => section.section_type === "cards");
  const mentorshipSection =
    cardSections.find((section) => /mentor|spotlight/i.test(`${section.section_key} ${section.section_label} ${section.title}`)) ||
    cardSections[0] ||
    null;
  const benefitsSection =
    cardSections.find(
      (section) =>
        section.id !== mentorshipSection?.id &&
        /benefit|career|role|training|support|join|why/i.test(`${section.section_key} ${section.section_label} ${section.title}`)
    ) ||
    cardSections.find((section) => section.id !== mentorshipSection?.id) ||
    null;
  const renderedSectionIds = new Set([mentorshipSection?.id, benefitsSection?.id].filter(Boolean));
  const extraSections = (page.sections || []).filter((section) => !renderedSectionIds.has(section.id));

  return {
    benefitsSection,
    extraSections,
    mentorshipSection
  };
};

function CardHeader({ children, number, title }) {
  return (
    <div className="join-admin-card-head">
      <span className="join-admin-step">{number}</span>
      <div>
        <h3>{title}</h3>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}

function JoinItemCard({ item, kind, onDelete, onEdit, onToggleVisible, saveLoading }) {
  return (
    <article className={`join-admin-item-card${item.is_active === false ? " muted" : ""}`}>
      {item.image_url ? (
        <img alt={item.title || kind} className="join-admin-item-photo" src={item.image_url} />
      ) : (
        <div className="join-admin-item-photo placeholder">
          <strong>{String(item.title || "?").slice(0, 1)}</strong>
          <span>No photo</span>
        </div>
      )}
      <div className="join-admin-item-copy">
        <strong>{item.title || `Unnamed ${kind}`}</strong>
        <span>{item.subtitle || "No short text yet"}</span>
        <span>{item.is_active === false ? "Hidden from public page" : "Visible on public page"}</span>
      </div>
      <div className="join-admin-item-actions">
        <button className="primary-button" onClick={() => onEdit(item)} type="button">
          Edit
        </button>
        <button className="secondary-button" disabled={saveLoading} onClick={() => onToggleVisible(item)} type="button">
          {item.is_active === false ? "Show" : "Hide"}
        </button>
        <button className="secondary-button" disabled={saveLoading} onClick={() => onDelete(item)} type="button">
          Delete
        </button>
      </div>
    </article>
  );
}

function JoinItemEditor({ item, kind, onClose, onDeleteItem, onSaveItem, onUploadAsset, saveLoading }) {
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
  const isSpotlight = kind === "spotlight";

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
    const confirmed = window.confirm(`Delete ${item.title || `this ${kind}`}?`);

    if (!confirmed) {
      return;
    }

    await onDeleteItem(item.id);
    onClose();
  };

  return (
    <form className="stack-form join-admin-item-editor" onSubmit={handleSubmit}>
      <div className="join-admin-item-edit-layout">
        <div className="join-admin-item-photo-preview">
          {form.image_url ? (
            <img alt="" aria-hidden="true" src={form.image_url} />
          ) : (
            <div>
              <strong>No photo yet</strong>
              <span>Upload or paste a photo URL.</span>
            </div>
          )}
        </div>

        <div className="editor-grid">
          <label>
            <span>{isSpotlight ? "Spotlight Title" : "Card Title"}</span>
            <input name="title" onChange={handleChange} required type="text" value={form.title} />
          </label>

          <label>
            <span>{isSpotlight ? "Small Highlight Text" : "Short Label"}</span>
            <input name="subtitle" onChange={handleChange} type="text" value={form.subtitle} />
          </label>

          <label className="full-span">
            <span>{isSpotlight ? "Spotlight Description" : "Card Description"}</span>
            <textarea name="body" onChange={handleChange} rows="5" value={form.body} />
          </label>

          <ImageField
            folder={`items/${item.section_id}`}
            label={isSpotlight ? "Mentorship Photo URL" : "Card Photo URL"}
            name="image_url"
            onChange={handleChange}
            onUploadAsset={onUploadAsset}
            value={form.image_url}
          />

          <label>
            <span>Button Text</span>
            <input name="link_label" onChange={handleChange} type="text" value={form.link_label} />
          </label>

          <label>
            <span>Button Link</span>
            <input name="link_url" onChange={handleChange} type="text" value={form.link_url} />
          </label>

          <label>
            <span>Display Order</span>
            <input name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
          </label>

          <label className="checkbox-field">
            <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
            <span>Show this {isSpotlight ? "spotlight" : "card"}</span>
          </label>
        </div>
      </div>

      <div className="editor-actions">
        <button className="primary-button" disabled={saveLoading} type="submit">
          Save {isSpotlight ? "Spotlight" : "Card"}
        </button>
        <button className="secondary-button" onClick={onClose} type="button">
          Cancel
        </button>
        <button className="secondary-button" disabled={saveLoading} onClick={handleDelete} type="button">
          Delete
        </button>
      </div>
    </form>
  );
}

function SectionTextEditor({ defaultTitle, onClose, onDeleteSection, onSaveSection, saveLoading, section }) {
  const [form, setForm] = useState({
    section_label: "",
    title: "",
    body: "",
    is_active: true
  });

  useEffect(() => {
    setForm({
      section_label: section?.section_label || defaultTitle,
      title: section?.title || defaultTitle,
      body: section?.body || "",
      is_active: section?.is_active ?? true
    });
  }, [defaultTitle, section]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSaveSection({
      id: section.id,
      page_id: section.page_id,
      section_key: section.section_key,
      section_type: section.section_type,
      subtitle: section.subtitle || "",
      image_url: section.image_url || "",
      primary_button_label: section.primary_button_label || "",
      primary_button_url: section.primary_button_url || "",
      secondary_button_label: section.secondary_button_label || "",
      secondary_button_url: section.secondary_button_url || "",
      sort_order: Number(section.sort_order) || 0,
      section_label: form.section_label,
      title: form.title,
      body: form.body,
      is_active: form.is_active
    });
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete ${section.section_label || defaultTitle}? This will also delete its cards.`);

    if (!confirmed) {
      return;
    }

    await onDeleteSection(section.id);
    onClose();
  };

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <div className="editor-grid">
        <label>
          <span>Admin Section Name</span>
          <input name="section_label" onChange={handleChange} required type="text" value={form.section_label} />
        </label>

        <label className="checkbox-field">
          <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
          <span>Show this section</span>
        </label>

        <label className="full-span">
          <span>Section Heading</span>
          <input name="title" onChange={handleChange} type="text" value={form.title} />
        </label>

        <label className="full-span">
          <span>Small Text Under Heading</span>
          <textarea name="body" onChange={handleChange} rows="4" value={form.body} />
        </label>
      </div>

      <div className="editor-actions">
        <button className="primary-button" disabled={saveLoading} type="submit">
          Save Section
        </button>
        <button className="secondary-button" onClick={onClose} type="button">
          Cancel
        </button>
        <button className="secondary-button" disabled={saveLoading} onClick={handleDelete} type="button">
          Delete Section
        </button>
      </div>
    </form>
  );
}

function JoinOurTeam({
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
  const [editingSpotlight, setEditingSpotlight] = useState(null);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const { benefitsSection, extraSections, mentorshipSection } = getJoinSections(page);
  const spotlightItems = getItems(mentorshipSection);
  const benefitItems = getItems(benefitsSection);
  const heroImage = getPrimaryImage(pageForm.hero_image_url);

  const createMentorshipSection = () =>
    onAddSection(page.id, {
      section_key: "mentorship-spotlight",
      section_label: "Mentorship Spotlight",
      section_type: "cards",
      title: "Mentorship Spotlight",
      body: "Show mentorship stories that encourage visitors to apply.",
      sort_order: 1,
      is_active: true
    });

  const createBenefitsSection = () =>
    onAddSection(page.id, {
      section_key: "career-benefits",
      section_label: "Why Join Us",
      section_type: "cards",
      title: "Why Join Our Team",
      body: "Simple reasons people choose to build a career with us.",
      sort_order: 2,
      is_active: true
    });

  const addSpotlight = () => {
    if (!mentorshipSection) {
      createMentorshipSection();
      return;
    }

    onAddItem(mentorshipSection.id, {
      title: "Mentorship Spotlight",
      subtitle: "Training and support",
      body: "Add a short mentorship story or career support message.",
      link_label: "",
      link_url: "",
      sort_order: (mentorshipSection.items?.length || 0) + 1
    });
  };

  const addBenefit = () => {
    if (!benefitsSection) {
      createBenefitsSection();
      return;
    }

    onAddItem(benefitsSection.id, {
      title: "New Career Benefit",
      subtitle: "Short label",
      body: "Add one clear reason to join the team.",
      link_label: "",
      link_url: "",
      sort_order: (benefitsSection.items?.length || 0) + 1
    });
  };

  const deleteItem = async (item, label) => {
    const confirmed = window.confirm(`Delete ${item.title || label}?`);

    if (!confirmed) {
      return;
    }

    await onDeleteItem(item.id);
  };

  const toggleItemVisible = async (item) => {
    await onSaveItem({
      ...item,
      is_active: item.is_active === false
    });
  };

  const toggleSectionVisible = async (section) => {
    await onSaveSection({
      id: section.id,
      page_id: section.page_id,
      section_key: section.section_key,
      section_label: section.section_label,
      section_type: section.section_type,
      title: section.title || "",
      subtitle: section.subtitle || "",
      body: section.body || "",
      image_url: section.image_url || "",
      primary_button_label: section.primary_button_label || "",
      primary_button_url: section.primary_button_url || "",
      secondary_button_label: section.secondary_button_label || "",
      secondary_button_url: section.secondary_button_url || "",
      sort_order: Number(section.sort_order) || 0,
      is_active: section.is_active === false
    });
  };

  const deleteSection = async (section, label) => {
    const confirmed = window.confirm(`Delete ${section.section_label || label}? This will also delete its cards.`);

    if (!confirmed) {
      return;
    }

    await onDeleteSection(section.id);
  };

  const closeSpotlightEditor = () => {
    setEditingSpotlight(null);
    onActiveModalChange(null);
  };

  const closeBenefitEditor = () => {
    setEditingBenefit(null);
    onActiveModalChange(null);
  };

  const editExtraSection = (section) => {
    onEditingSectionChange(section);
    onActiveModalChange("edit-section");
  };

  return (
    <div className="join-admin-page">
      <section className="join-admin-intro-card">
        <div>
          <p className="eyebrow">Join Our Team</p>
          <h2>Simple Join Our Team Editor</h2>
          <p>Edit the career banner, mentorship spotlight, career cards, and applications from one place.</p>
        </div>
        <span className={`join-admin-status${pageForm.is_published ? "" : " muted"}`}>
          {pageForm.is_published ? "Public page is visible" : "Public page is hidden"}
        </span>
      </section>

      <div className="join-admin-grid">
        <article className="join-admin-card join-admin-wide">
          <CardHeader number="1" title="Top Banner">
            This is the first career message visitors see.
          </CardHeader>

          <div className="join-admin-banner-preview">
            <div className="join-admin-copy-preview">
              <span>{pageForm.hero_visible === false ? "Hidden" : "Visible"}</span>
              <h4>{pageForm.hero_title || pageForm.page_title || "Join Our Team"}</h4>
              <p>{pageForm.hero_body || pageForm.page_description || "No banner text yet."}</p>
            </div>
            {heroImage ? (
              <img alt="" aria-hidden="true" src={heroImage} />
            ) : (
              <div className="join-admin-image-placeholder">No banner photo</div>
            )}
          </div>

          <div className="join-admin-actions">
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

        <article className="join-admin-card">
          <CardHeader number="2" title="Mentorship Spotlight">
            {spotlightItems.length} spotlight card{spotlightItems.length === 1 ? "" : "s"} above the real team list
          </CardHeader>

          <div className="join-admin-item-grid">
            {spotlightItems.length ? (
              spotlightItems.map((item) => (
                <JoinItemCard
                  item={item}
                  key={item.id}
                  kind="spotlight"
                  onDelete={(spotlight) => deleteItem(spotlight, "this spotlight")}
                  onEdit={(spotlight) => {
                    setEditingSpotlight(spotlight);
                    onActiveModalChange("edit-spotlight");
                  }}
                  onToggleVisible={toggleItemVisible}
                  saveLoading={saveLoading}
                />
              ))
            ) : (
              <p className="join-admin-empty">No mentorship cards yet. Add one or two photos with simple mentorship text.</p>
            )}
          </div>

          <div className="join-admin-actions">
            <button className="primary-button" disabled={saveLoading} onClick={addSpotlight} type="button">
              {mentorshipSection ? "Add Spotlight" : "Create Mentorship Section"}
            </button>
            <button
              className="secondary-button"
              disabled={!mentorshipSection}
              onClick={() => onActiveModalChange("edit-mentorship-section")}
              type="button"
            >
              Edit Heading
            </button>
            <button
              className="secondary-button"
              disabled={!mentorshipSection || saveLoading}
              onClick={() => toggleSectionVisible(mentorshipSection)}
              type="button"
            >
              {mentorshipSection?.is_active === false ? "Show Section" : "Hide Section"}
            </button>
            <button
              className="secondary-button"
              disabled={!mentorshipSection || saveLoading}
              onClick={() => deleteSection(mentorshipSection, "Mentorship Spotlight")}
              type="button"
            >
              Delete Section
            </button>
          </div>
        </article>

        <article className="join-admin-card">
          <CardHeader number="3" title="Why Join Us Cards">
            {benefitItems.length} card{benefitItems.length === 1 ? "" : "s"} explaining why people should apply
          </CardHeader>

          <div className="join-admin-item-grid">
            {benefitItems.length ? (
              benefitItems.map((item) => (
                <JoinItemCard
                  item={item}
                  key={item.id}
                  kind="benefit"
                  onDelete={(benefit) => deleteItem(benefit, "this card")}
                  onEdit={(benefit) => {
                    setEditingBenefit(benefit);
                    onActiveModalChange("edit-benefit");
                  }}
                  onToggleVisible={toggleItemVisible}
                  saveLoading={saveLoading}
                />
              ))
            ) : (
              <p className="join-admin-empty">No career cards yet. Add simple reasons like Training, Mentorship, or Growth.</p>
            )}
          </div>

          <div className="join-admin-actions">
            <button className="primary-button" disabled={saveLoading} onClick={addBenefit} type="button">
              {benefitsSection ? "Add Card" : "Create Why Join Us Section"}
            </button>
            <button
              className="secondary-button"
              disabled={!benefitsSection}
              onClick={() => onActiveModalChange("edit-benefits-section")}
              type="button"
            >
              Edit Heading
            </button>
            <button
              className="secondary-button"
              disabled={!benefitsSection || saveLoading}
              onClick={() => toggleSectionVisible(benefitsSection)}
              type="button"
            >
              {benefitsSection?.is_active === false ? "Show Section" : "Hide Section"}
            </button>
            <button
              className="secondary-button"
              disabled={!benefitsSection || saveLoading}
              onClick={() => deleteSection(benefitsSection, "Why Join Us")}
              type="button"
            >
              Delete Section
            </button>
          </div>
        </article>

        <article className="join-admin-card">
          <CardHeader number="4" title="Real Team Members">
            This page automatically shows the team list from About Us.
          </CardHeader>
          <p className="join-admin-empty">To change real team names, roles, or photos, edit the About Us team section.</p>
          <div className="join-admin-actions">
            <Link className="primary-button" to="/admin/pages/about-us">
              Edit Team Members
            </Link>
          </div>
        </article>

        <article className="join-admin-card">
          <CardHeader number="5" title="Applications">
            Review people who submitted the Join Our Team form.
          </CardHeader>
          <p className="join-admin-empty">Applications include name, email, number, date submitted, and status.</p>
          <div className="join-admin-actions">
            <Link className="primary-button" to="/admin/modules/team-applications">
              View Applications
            </Link>
          </div>
        </article>

        <article className="join-admin-card join-admin-wide">
          <CardHeader number="6" title="Other Join Our Team Blocks">
            Extra supporting sections for this page
          </CardHeader>

          <div className="join-admin-section-list">
            {extraSections.length ? (
              extraSections.map((section) => (
                <button className="join-admin-section-button" key={section.id} onClick={() => editExtraSection(section)} type="button">
                  <strong>{section.title || section.section_label}</strong>
                  <span>{section.is_active ? "Visible" : "Hidden"}</span>
                </button>
              ))
            ) : (
              <p className="join-admin-empty">No extra blocks yet.</p>
            )}
          </div>

          <div className="join-admin-actions">
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
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Join Our Team Page">
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

      {activeModal === "page-hero" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Career Banner">
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
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Join Our Team SEO">
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

      {activeModal === "edit-spotlight" && editingSpotlight ? (
        <EditorModal onClose={closeSpotlightEditor} title="Edit Mentorship Spotlight">
          <JoinItemEditor
            item={editingSpotlight}
            kind="spotlight"
            onClose={closeSpotlightEditor}
            onDeleteItem={onDeleteItem}
            onSaveItem={onSaveItem}
            onUploadAsset={onUploadAsset}
            saveLoading={saveLoading}
          />
        </EditorModal>
      ) : null}

      {activeModal === "edit-benefit" && editingBenefit ? (
        <EditorModal onClose={closeBenefitEditor} title="Edit Why Join Us Card">
          <JoinItemEditor
            item={editingBenefit}
            kind="benefit"
            onClose={closeBenefitEditor}
            onDeleteItem={onDeleteItem}
            onSaveItem={onSaveItem}
            onUploadAsset={onUploadAsset}
            saveLoading={saveLoading}
          />
        </EditorModal>
      ) : null}

      {activeModal === "edit-mentorship-section" && mentorshipSection ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Mentorship Section Heading">
          <SectionTextEditor
            defaultTitle="Mentorship Spotlight"
            onClose={() => onActiveModalChange(null)}
            onDeleteSection={onDeleteSection}
            onSaveSection={onSaveSection}
            saveLoading={saveLoading}
            section={mentorshipSection}
          />
        </EditorModal>
      ) : null}

      {activeModal === "edit-benefits-section" && benefitsSection ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Why Join Us Section Heading">
          <SectionTextEditor
            defaultTitle="Why Join Our Team"
            onClose={() => onActiveModalChange(null)}
            onDeleteSection={onDeleteSection}
            onSaveSection={onSaveSection}
            saveLoading={saveLoading}
            section={benefitsSection}
          />
        </EditorModal>
      ) : null}

      {activeModal === "add-section" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Add Join Our Team Block">
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

export default JoinOurTeam;
