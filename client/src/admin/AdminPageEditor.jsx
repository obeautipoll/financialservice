import { useEffect, useState } from "react";

const sectionDefaults = {
  section_key: "",
  section_label: "",
  section_type: "content",
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  primary_button_label: "",
  primary_button_url: "",
  secondary_button_label: "",
  secondary_button_url: "",
  sort_order: 0,
  is_active: true
};

const itemDefaults = {
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  link_label: "",
  link_url: "",
  sort_order: 0,
  is_active: true
};

export function ImageField({ folder, label, multiline = false, name, onChange, onUploadAsset, value }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const publicUrl = await onUploadAsset(file, folder);
      const currentValue = String(value || "").trim();
      const nextValue = multiline && currentValue ? `${currentValue}\n${publicUrl}` : publicUrl;

      onChange({
        target: {
          name,
          type: "text",
          value: nextValue
        }
      });
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-field">
      <label>
        <span>{label}</span>
        {multiline ? (
          <textarea name={name} onChange={onChange} rows="5" value={value} />
        ) : (
          <input name={name} onChange={onChange} type="url" value={value} />
        )}
      </label>

      <div className="image-upload-row">
        <input accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" />
        <button className="secondary-button" disabled={!file || uploading} onClick={handleUpload} type="button">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

const splitImageList = (imageList) =>
  String(imageList || "")
    .split(/\s*(?:\r?\n|\|)\s*/)
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean);

function HeroImageListField({ folder, name, onChange, onUploadAsset, value }) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const images = splitImageList(value);

  const emitImages = (nextImages) => {
    onChange({
      target: {
        name,
        type: "text",
        value: nextImages.join("\n")
      }
    });
  };

  const addImageUrl = () => {
    const trimmedUrl = newImageUrl.trim();

    if (!trimmedUrl) {
      return;
    }

    emitImages([...images, trimmedUrl]);
    setNewImageUrl("");
  };

  const uploadImage = async () => {
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const publicUrl = await onUploadAsset(file, folder);
      emitImages([...images, publicUrl]);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    emitImages(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="image-list-field full-span">
      <span>Hero Slideshow Photos</span>
      <div className="image-list">
        {images.length ? (
          images.map((imageUrl, index) => (
            <div className="image-list-row" key={`${imageUrl}-${index}`}>
              <img alt="" aria-hidden="true" src={imageUrl} />
              <input
                onChange={(event) => {
                  emitImages(
                    images.map((currentUrl, currentIndex) =>
                      currentIndex === index ? event.target.value : currentUrl
                    )
                  );
                }}
                type="url"
                value={imageUrl}
              />
              <button className="secondary-button" onClick={() => removeImage(index)} type="button">
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="muted-copy">No slideshow photos yet.</p>
        )}
      </div>

      <div className="image-upload-row">
        <input
          onChange={(event) => setNewImageUrl(event.target.value)}
          placeholder="Paste image URL"
          type="url"
          value={newImageUrl}
        />
        <button className="secondary-button" onClick={addImageUrl} type="button">
          Add URL
        </button>
      </div>

      <div className="image-upload-row">
        <input accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" />
        <button className="secondary-button" disabled={!file || uploading} onClick={uploadImage} type="button">
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
      </div>
    </div>
  );
}

export function EditorModal({ children, onClose, title }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div aria-modal="true" className="editor-modal" role="dialog">
        <div className="modal-head">
          <h3>{title}</h3>
          <button aria-label="Close modal" className="icon-button" onClick={onClose} type="button">
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CollapsiblePanel({ actions, children, defaultOpen = true, title }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="card stack-form compact-editor-panel">
      <div className="panel-head">
        <button
          aria-expanded={open}
          className="plain-toggle"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span>{title}</span>
        </button>
        <div className="editor-actions">{actions}</div>
      </div>
      {open ? children : null}
    </section>
  );
}

function ItemEditor({
  isAboutPage = false,
  isCardSection = false,
  item,
  onDeleteItem,
  onSaveItem,
  onUploadAsset,
  saveLoading
}) {
  const [form, setForm] = useState(itemDefaults);
  const labels =
    isAboutPage && isCardSection
      ? {
          title: "Team Member Name",
          subtitle: "Role or Title",
          body: "Small Description",
          image: "Team Photo URL",
          save: "Save Team Member",
          delete: "Delete Team Member"
        }
      : isCardSection
        ? {
            title: "Name",
            subtitle: "Role or Title",
            body: "Small Description",
            image: "Team Photo URL",
            save: "Save Card",
            delete: "Delete Card"
          }
        : {
            title: "Item Title",
            subtitle: "Subtitle",
            body: "Body",
            image: "Image URL",
            save: "Save Item",
            delete: "Delete Item"
          };

  useEffect(() => {
    setForm({
      title: item.title || "",
      subtitle: item.subtitle || "",
      body: item.body || "",
      image_url: item.image_url || "",
      link_label: item.link_label || "",
      link_url: item.link_url || "",
      sort_order: item.sort_order || 0,
      is_active: item.is_active ?? true
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
  };

  return (
    <form className="nested-form" onSubmit={handleSubmit}>
      <div className="editor-grid">
        <label>
          <span>{labels.title}</span>
          <input name="title" onChange={handleChange} required type="text" value={form.title} />
        </label>

        <label>
          <span>{labels.subtitle}</span>
          <input name="subtitle" onChange={handleChange} type="text" value={form.subtitle} />
        </label>

        <label className="full-span">
          <span>{labels.body}</span>
          <textarea name="body" onChange={handleChange} rows="4" value={form.body} />
        </label>

        <ImageField
          folder={`items/${item.section_id}`}
          label={labels.image}
          name="image_url"
          onChange={handleChange}
          onUploadAsset={onUploadAsset}
          value={form.image_url}
        />

        <label>
          <span>Link Label</span>
          <input name="link_label" onChange={handleChange} type="text" value={form.link_label} />
        </label>

        <label>
          <span>Link URL</span>
          <input name="link_url" onChange={handleChange} type="text" value={form.link_url} />
        </label>

        <label>
          <span>Sort Order</span>
          <input name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
        </label>

        <label className="checkbox-field">
          <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
          <span>Active</span>
        </label>
      </div>

      <div className="editor-actions">
        <button className="primary-button" disabled={saveLoading} type="submit">
          {labels.save}
        </button>
        <button
          className="secondary-button"
          disabled={saveLoading}
          onClick={() => onDeleteItem(item.id)}
          type="button"
        >
          {labels.delete}
        </button>
      </div>
    </form>
  );
}

export function SectionEditor({
  hideSystemFields = false,
  isAboutPage,
  onAddItem,
  onAfterSave,
  onDeleteItem,
  onDeleteSection,
  onSaveItem,
  onSaveSection,
  onUploadAsset,
  saveLoading,
  section
}) {
  const [form, setForm] = useState(sectionDefaults);

  useEffect(() => {
    setForm({
      section_key: section.section_key || "",
      section_label: section.section_label || "",
      section_type: section.section_type || "content",
      title: section.title || "",
      subtitle: section.subtitle || "",
      body: section.body || "",
      image_url: section.image_url || "",
      primary_button_label: section.primary_button_label || "",
      primary_button_url: section.primary_button_url || "",
      secondary_button_label: section.secondary_button_label || "",
      secondary_button_url: section.secondary_button_url || "",
      sort_order: section.sort_order || 0,
      is_active: section.is_active ?? true
    });
  }, [section]);

  const isCardSection = form.section_type === "cards";

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
      ...form,
      sort_order: Number(form.sort_order) || 0
    });
    onAfterSave?.();
  };

  return (
    <article className="editor-card">
      <form className="stack-form" onSubmit={handleSubmit}>
        <div className="editor-grid">
          <label>
            <span>Section Label</span>
            <input name="section_label" onChange={handleChange} required type="text" value={form.section_label} />
          </label>

          {!hideSystemFields && !isAboutPage ? (
            <label>
              <span>Section Key</span>
              <input name="section_key" onChange={handleChange} required type="text" value={form.section_key} />
            </label>
          ) : null}

          <label>
            <span>Section Type</span>
            <select name="section_type" onChange={handleChange} value={form.section_type}>
              <option value="content">Content</option>
              <option value="cards">Cards</option>
              <option value="cta">CTA</option>
              <option value="faq">FAQ</option>
              <option value="list">List</option>
              <option value="hero">Hero</option>
            </select>
          </label>

          {!hideSystemFields ? (
            <label>
              <span>Sort Order</span>
              <input name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
            </label>
          ) : null}

          <label className="checkbox-field">
            <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
            <span>Active</span>
          </label>

          <label className="full-span">
            <span>Title</span>
            <input name="title" onChange={handleChange} type="text" value={form.title} />
          </label>

          <label className="full-span">
            <span>Subtitle</span>
            <input name="subtitle" onChange={handleChange} type="text" value={form.subtitle} />
          </label>

          <label className="full-span">
            <span>Body</span>
            <textarea name="body" onChange={handleChange} rows="5" value={form.body} />
          </label>

          <ImageField
            folder={`sections/${section.page_id}`}
            label="Image URL"
            name="image_url"
            onChange={handleChange}
            onUploadAsset={onUploadAsset}
            value={form.image_url}
          />

          {!isAboutPage ? (
            <label>
              <span>Primary Button Label</span>
              <input name="primary_button_label" onChange={handleChange} type="text" value={form.primary_button_label} />
            </label>
          ) : null}

          <label>
            <span>Primary Button URL</span>
            <input name="primary_button_url" onChange={handleChange} type="text" value={form.primary_button_url} />
          </label>

          {!isAboutPage ? (
            <label>
              <span>Secondary Button Label</span>
              <input
                name="secondary_button_label"
                onChange={handleChange}
                type="text"
                value={form.secondary_button_label}
              />
            </label>
          ) : null}

          <label>
            <span>Secondary Button URL</span>
            <input name="secondary_button_url" onChange={handleChange} type="text" value={form.secondary_button_url} />
          </label>
        </div>

        <div className="editor-actions">
          <button className="primary-button" disabled={saveLoading} type="submit">
            Save Section
          </button>
          <button
            className="secondary-button"
            disabled={saveLoading}
            onClick={() =>
              onAddItem(section.id, {
                title: isAboutPage && isCardSection ? "New Team Member" : isCardSection ? "New Card" : "New Item",
                body: isCardSection ? "Add a small description here." : "Add item content here.",
                sort_order: (section.items?.length || 0) + 1
              })
            }
            type="button"
          >
            {isAboutPage && isCardSection ? "Add Team Member" : isCardSection ? "Add Card" : "Add Item"}
          </button>
          <button
            className="secondary-button"
            disabled={saveLoading}
            onClick={() => onDeleteSection(section.id)}
            type="button"
          >
            Delete Section
          </button>
        </div>
      </form>

      <div className="subeditor-list">
        {section.items?.length ? (
          section.items.map((item) => (
            <ItemEditor
              isAboutPage={isAboutPage}
              isCardSection={isCardSection}
              item={item}
              key={item.id}
              onDeleteItem={onDeleteItem}
              onSaveItem={onSaveItem}
              onUploadAsset={onUploadAsset}
              saveLoading={saveLoading}
            />
          ))
        ) : (
          <p className="muted-copy">
            {isAboutPage && isCardSection
              ? "No team members yet. Use Add Team Member to add a photo, name, and small description."
              : "No items yet for this section."}
          </p>
        )}
      </div>
    </article>
  );
}

export function NewSectionForm({ hideSystemFields = false, onAddSection, onClose, onUploadAsset, page, saveLoading }) {
  const nextSortOrder = (page.sections?.length || 0) + 1;
  const isAboutPage = page.slug === "about-us";
  const [form, setForm] = useState({
    ...sectionDefaults,
    section_key: isAboutPage ? `our-team-${Date.now()}` : `section-${Date.now()}`,
    section_label: isAboutPage ? "Our Team" : "New Section",
    section_type: "cards",
    title: isAboutPage ? "Our Team" : "New Section",
    body: isAboutPage ? "Add team member cards with a photo, name, role, and small description." : "Add content here.",
    sort_order: nextSortOrder
  });

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onAddSection(page.id, {
      ...form,
      section_key: form.section_key || `section-${Date.now()}`
    });
    onClose();
  };

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <div className="editor-grid">
        <label>
          <span>Section Label</span>
          <input name="section_label" onChange={handleChange} required type="text" value={form.section_label} />
        </label>

        {!hideSystemFields ? (
          <label>
            <span>Section Key</span>
            <input name="section_key" onChange={handleChange} required type="text" value={form.section_key} />
          </label>
        ) : null}

        <label>
          <span>Section Type</span>
          <select name="section_type" onChange={handleChange} value={form.section_type}>
            <option value="content">Content</option>
            <option value="cards">Cards</option>
            <option value="cta">CTA</option>
            <option value="faq">FAQ</option>
            <option value="list">List</option>
            <option value="hero">Hero</option>
          </select>
        </label>

        {!hideSystemFields ? (
          <label>
            <span>Sort Order</span>
            <input name="sort_order" onChange={handleChange} type="number" value={form.sort_order} />
          </label>
        ) : null}

        <label className="checkbox-field">
          <input checked={form.is_active} name="is_active" onChange={handleChange} type="checkbox" />
          <span>Visible</span>
        </label>

        <label className="full-span">
          <span>Title</span>
          <input name="title" onChange={handleChange} type="text" value={form.title} />
        </label>

        <label className="full-span">
          <span>Subtitle</span>
          <input name="subtitle" onChange={handleChange} type="text" value={form.subtitle} />
        </label>

        <label className="full-span">
          <span>Body</span>
          <textarea name="body" onChange={handleChange} rows="5" value={form.body} />
        </label>

        {isAboutPage && form.section_type === "cards" ? (
          <p className="muted-copy full-span">
            After adding this section, open Edit and click Add Team Member to add a photo, name, role, and small description.
          </p>
        ) : null}

        <ImageField
          folder={`sections/${page.id}`}
          label="Image URL"
          name="image_url"
          onChange={handleChange}
          onUploadAsset={onUploadAsset}
          value={form.image_url}
        />
      </div>

      <div className="editor-actions">
        <button className="primary-button" disabled={saveLoading} type="submit">
          Add Section
        </button>
        <button className="secondary-button" onClick={onClose} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}

function AdminPageEditor({
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
  pageDefinition,
  pageForm,
  saveLoading,
  editorConfig = {}
}) {
  const isAboutPage = (pageDefinition?.slug || page?.slug) === "about-us";
  const isHomePage = pageDefinition?.admin?.heroImageMode === "list";
  const hideSectionSystemFields = pageDefinition?.admin?.hideSectionSystemFields === true;

  return (
    <>
      <div className="dashboard-stack">
        <CollapsiblePanel
          actions={
            <button className="secondary-button" onClick={() => onActiveModalChange("page-basic")} type="button">
              Edit
            </button>
          }
          title={`${page.nav_label} Page Content`}
        >
          <div className="section-heading">
            <p className="eyebrow">{page.nav_label}</p>
            <h3>{pageForm.page_title}</h3>
            <p>{pageForm.page_description}</p>
          </div>
          <p className="dashboard-note">{pageForm.is_published ? "Published" : "Hidden from public navigation"}</p>
        </CollapsiblePanel>

        <CollapsiblePanel
          actions={
            <button className="secondary-button" onClick={() => onActiveModalChange("page-seo")} type="button">
              Edit SEO
            </button>
          }
          defaultOpen={false}
          title="SEO"
        >
          <div className="summary-list">
            <span>
              <strong>SEO Title:</strong> {pageForm.seo_title || "Not set"}
            </span>
            <span>
              <strong>SEO Description:</strong> {pageForm.seo_description || "Not set"}
            </span>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          actions={
            <>
              <button className="secondary-button" disabled={saveLoading} onClick={onToggleHeroVisible} type="button">
                {pageForm.hero_visible === false ? "Show" : "Hide"}
              </button>
              <button className="secondary-button" onClick={() => onActiveModalChange("page-hero")} type="button">
                Edit Hero
              </button>
            </>
          }
          title="Hero Section"
        >
          <div className="section-heading">
            <h3>{pageForm.hero_title || pageForm.page_title}</h3>
            <p>{pageForm.hero_body || pageForm.page_description}</p>
          </div>
          <p className="dashboard-note">{pageForm.hero_visible === false ? "Hidden on public page" : "Visible on public page"}</p>
        </CollapsiblePanel>

        <div className="card stack-form">
          <div className="section-heading">
            <h3>{page.nav_label} Sections</h3>
            <p>{editorConfig.sectionDescription || "These sections belong only to the selected landing page."}</p>
          </div>

          <div className="editor-actions">
            <button className="primary-button" disabled={saveLoading} onClick={() => onActiveModalChange("add-section")} type="button">
              Add Section
            </button>
          </div>

          {page.sections?.length ? (
            <div className="section-editor-list">
              {page.sections.map((section) => (
                <article className="editor-card section-summary-card" key={section.id}>
                  <div>
                    <h4>{section.section_label}</h4>
                    <p>{section.title || "Untitled section"}</p>
                    <span className="dashboard-note">{section.is_active ? "Visible" : "Hidden"}</span>
                  </div>
                  <div className="editor-actions">
                    <button
                      className="secondary-button"
                      onClick={() => {
                        onEditingSectionChange(section);
                        onActiveModalChange("edit-section");
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="secondary-button"
                      disabled={saveLoading}
                      onClick={() => onDeleteSection(section.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted-copy">This page does not have any sections yet.</p>
          )}
        </div>
      </div>

      {activeModal === "page-basic" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title={`Edit ${page.nav_label} Content`}>
          <form className="stack-form" onSubmit={onSubmitPage}>
            <div className="editor-grid">
              <label>
                <span>Navigation Label</span>
                <input name="nav_label" onChange={onPageChange} required type="text" value={pageForm.nav_label} />
              </label>
              <label className="checkbox-field">
                <input checked={pageForm.is_published} name="is_published" onChange={onPageChange} type="checkbox" />
                <span>Published</span>
              </label>
              <label className="full-span">
                <span>Page Title</span>
                <input name="page_title" onChange={onPageChange} required type="text" value={pageForm.page_title} />
              </label>
              <label className="full-span">
                <span>Page Description</span>
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

      {activeModal === "page-seo" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title={`Edit ${page.nav_label} SEO`}>
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

      {activeModal === "page-hero" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title={`Edit ${page.nav_label} Hero`}>
          <form className="stack-form" onSubmit={onSubmitPage}>
            <div className="editor-grid">
              <label className="checkbox-field full-span">
                <input checked={pageForm.hero_visible !== false} name="hero_visible" onChange={onPageChange} type="checkbox" />
                <span>Show hero on public page</span>
              </label>
              <label className="full-span">
                <span>Hero Title</span>
                <input name="hero_title" onChange={onPageChange} type="text" value={pageForm.hero_title} />
              </label>
              <label className="full-span">
                <span>Hero Body</span>
                <textarea name="hero_body" onChange={onPageChange} rows="5" value={pageForm.hero_body} />
              </label>
              <label>
                <span>Hero Primary Button Label</span>
                <input
                  name="hero_primary_button_label"
                  onChange={onPageChange}
                  type="text"
                  value={pageForm.hero_primary_button_label}
                />
              </label>
              <label>
                <span>Hero Primary Button URL</span>
                <input
                  name="hero_primary_button_url"
                  onChange={onPageChange}
                  type="text"
                  value={pageForm.hero_primary_button_url}
                />
              </label>
              <label>
                <span>Hero Secondary Button Label</span>
                <input
                  name="hero_secondary_button_label"
                  onChange={onPageChange}
                  type="text"
                  value={pageForm.hero_secondary_button_label}
                />
              </label>
              <label>
                <span>Hero Secondary Button URL</span>
                <input
                  name="hero_secondary_button_url"
                  onChange={onPageChange}
                  type="text"
                  value={pageForm.hero_secondary_button_url}
                />
              </label>
              {isHomePage ? (
                <HeroImageListField
                  folder={`pages/${page.slug}`}
                  name="hero_image_url"
                  onChange={onPageChange}
                  onUploadAsset={onUploadAsset}
                  value={pageForm.hero_image_url}
                />
              ) : (
                <ImageField
                  folder={`pages/${page.slug}`}
                  label="Hero Image URL"
                  name="hero_image_url"
                  onChange={onPageChange}
                  onUploadAsset={onUploadAsset}
                  value={pageForm.hero_image_url}
                />
              )}
            </div>
            <div className="editor-actions">
              <button className="primary-button" disabled={saveLoading} type="submit">
                Save Hero
              </button>
              <button className="secondary-button" onClick={() => onActiveModalChange(null)} type="button">
                Cancel
              </button>
            </div>
          </form>
        </EditorModal>
      ) : null}

      {activeModal === "add-section" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title={`Add ${page.nav_label} Section`}>
          <NewSectionForm
            hideSystemFields={hideSectionSystemFields}
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
            hideSystemFields={hideSectionSystemFields}
            isAboutPage={isAboutPage}
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
    </>
  );
}

export default AdminPageEditor;
