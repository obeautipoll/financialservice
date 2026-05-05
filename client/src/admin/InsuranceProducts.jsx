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
    <div className="insurance-admin-card-head">
      <span className="insurance-admin-step">{number}</span>
      <div>
        <h3>{title}</h3>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}

function InsuranceItemCard({ item, kind, onDelete, onEdit, saveLoading }) {
  return (
    <article className="insurance-admin-item-card">
      {item.image_url ? (
        <img alt={item.title || kind} className="insurance-admin-item-icon" src={item.image_url} />
      ) : (
        <div className="insurance-admin-item-icon placeholder">
          <strong>{String(item.title || "?").slice(0, 1)}</strong>
          <span>No photo</span>
        </div>
      )}
      <div className="insurance-admin-item-copy">
        <strong>{item.title || `Unnamed ${kind}`}</strong>
        <span>{item.subtitle || "No short text yet"}</span>
      </div>
      <div className="insurance-admin-item-actions">
        <button className="primary-button" onClick={() => onEdit(item)} type="button">
          Edit
        </button>
        <button className="secondary-button" disabled={saveLoading} onClick={() => onDelete(item)} type="button">
          Delete
        </button>
      </div>
    </article>
  );
}

function InsuranceItemEditor({ item, kind, onClose, onDeleteItem, onSaveItem, onUploadAsset, saveLoading }) {
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
  const isProduct = kind === "product";
  const titleLabel = isProduct ? "Product Name" : "Reason Name";
  const subtitleLabel = isProduct ? "Short Product Text" : "Short Explanation";
  const bodyLabel = isProduct ? "Product Details - one line per bullet" : "Reason Details - one line per bullet";
  const imageLabel = isProduct ? "Product Photo or Icon URL" : "Reason Photo or Icon URL";

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
    <form className="stack-form insurance-admin-item-editor" onSubmit={handleSubmit}>
      <div className="insurance-admin-item-edit-layout">
        <div className="insurance-admin-item-photo-preview">
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
            <span>{titleLabel}</span>
            <input name="title" onChange={handleChange} required type="text" value={form.title} />
          </label>

          <label>
            <span>{subtitleLabel}</span>
            <input name="subtitle" onChange={handleChange} type="text" value={form.subtitle} />
          </label>

          <label className="full-span">
            <span>{bodyLabel}</span>
            <textarea name="body" onChange={handleChange} rows="6" value={form.body} />
          </label>

          <ImageField
            folder={`items/${item.section_id}`}
            label={imageLabel}
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
            <span>Show this {isProduct ? "product" : "reason"}</span>
          </label>
        </div>
      </div>

      <div className="editor-actions">
        <button className="primary-button" disabled={saveLoading} type="submit">
          Save {isProduct ? "Product" : "Reason"}
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

function SectionTextEditor({ defaultTitle, onClose, onSaveSection, saveLoading, section }) {
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
      ...section,
      section_label: form.section_label,
      title: form.title,
      body: form.body,
      is_active: form.is_active
    });
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
      </div>
    </form>
  );
}

function InsuranceProducts({
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingReason, setEditingReason] = useState(null);
  const cardSections = (page.sections || []).filter((section) => section.section_type === "cards");
  const productSection =
    cardSections.find((section) => /product|plan/i.test(`${section.section_key} ${section.section_label} ${section.title}`)) ||
    cardSections[0] ||
    null;
  const whySection =
    cardSections.find(
      (section) =>
        section.id !== productSection?.id &&
        /why|need|reason|income|debt|business/i.test(`${section.section_key} ${section.section_label} ${section.title}`)
    ) ||
    cardSections.find((section) => section.id !== productSection?.id) ||
    null;
  const renderedSectionIds = new Set([productSection?.id, whySection?.id].filter(Boolean));
  const extraSections = (page.sections || []).filter((section) => !renderedSectionIds.has(section.id));
  const products = getActiveItems(productSection);
  const reasons = getActiveItems(whySection);
  const heroImage = getPrimaryImage(pageForm.hero_image_url);

  const closeProductEditor = () => {
    setEditingProduct(null);
    onActiveModalChange(null);
  };

  const closeReasonEditor = () => {
    setEditingReason(null);
    onActiveModalChange(null);
  };

  const createProductSection = () =>
    onAddSection(page.id, {
      section_key: "insurance-products",
      section_label: "Insurance Products",
      section_type: "cards",
      title: "Insurance Products",
      body: "Our life protection insurance plans",
      sort_order: 1,
      is_active: true
    });

  const createWhySection = () =>
    onAddSection(page.id, {
      section_key: "why-insurance-plan",
      section_label: "Why Insurance Plan",
      section_type: "cards",
      title: "Why Do You Need a Life Insurance Plan?",
      body: "Simple reasons clients choose life insurance protection.",
      sort_order: 2,
      is_active: true
    });

  const addProduct = () => {
    if (!productSection) {
      createProductSection();
      return;
    }

    onAddItem(productSection.id, {
      title: "New Insurance Product",
      subtitle: "Short product description",
      body: "Benefit or coverage detail\nPayment term or eligibility\nAge range",
      link_label: "Learn More",
      link_url: "/contact",
      sort_order: (productSection.items?.length || 0) + 1
    });
  };

  const addReason = () => {
    if (!whySection) {
      createWhySection();
      return;
    }

    onAddItem(whySection.id, {
      title: "New Reason",
      subtitle: "Short explanation",
      body: "Add one clear supporting detail.",
      sort_order: (whySection.items?.length || 0) + 1
    });
  };

  const deleteItem = async (item, label) => {
    const confirmed = window.confirm(`Delete ${item.title || label}?`);

    if (!confirmed) {
      return;
    }

    await onDeleteItem(item.id);
  };

  const editExtraSection = (section) => {
    onEditingSectionChange(section);
    onActiveModalChange("edit-section");
  };

  return (
    <div className="insurance-admin-page">
      <section className="insurance-admin-intro-card">
        <div>
          <p className="eyebrow">Insurance Products</p>
          <h2>Simple Insurance Products Editor</h2>
          <p>Edit the banner, insurance product cards, and why-insurance section from one page.</p>
        </div>
        <span className={`insurance-admin-status${pageForm.is_published ? "" : " muted"}`}>
          {pageForm.is_published ? "Public page is visible" : "Public page is hidden"}
        </span>
      </section>

      <div className="insurance-admin-grid">
        <article className="insurance-admin-card insurance-admin-wide">
          <CardHeader number="1" title="Top Banner">
            This controls the large Life Insurance banner at the top of the public page.
          </CardHeader>

          <div className="insurance-admin-banner-preview">
            <div className="insurance-admin-copy-preview">
              <span>{pageForm.hero_visible === false ? "Hidden" : "Visible"}</span>
              <h4>{pageForm.hero_title || pageForm.page_title || "Life Insurance"}</h4>
              <p>{pageForm.hero_body || pageForm.page_description || "No banner text yet."}</p>
            </div>
            {heroImage ? (
              <img alt="" aria-hidden="true" src={heroImage} />
            ) : (
              <div className="insurance-admin-image-placeholder">No banner photo</div>
            )}
          </div>

          <div className="insurance-admin-actions">
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

        <article className="insurance-admin-card">
          <CardHeader number="2" title="Insurance Product Cards">
            {products.length} product{products.length === 1 ? "" : "s"} shown on the public page
          </CardHeader>

          <div className="insurance-admin-item-grid">
            {products.length ? (
              products.map((item) => (
                <InsuranceItemCard
                  item={item}
                  key={item.id}
                  kind="product"
                  onDelete={(product) => deleteItem(product, "this product")}
                  onEdit={(product) => {
                    setEditingProduct(product);
                    onActiveModalChange("edit-product");
                  }}
                  saveLoading={saveLoading}
                />
              ))
            ) : (
              <p className="insurance-admin-empty">
                No insurance products yet. Use Add Product to create a card with photo, name, details, and button.
              </p>
            )}
          </div>

          <div className="insurance-admin-actions">
            <button className="primary-button" disabled={saveLoading} onClick={addProduct} type="button">
              {productSection ? "Add Product" : "Create Product Section"}
            </button>
            <button
              className="secondary-button"
              disabled={!productSection}
              onClick={() => onActiveModalChange("edit-product-section")}
              type="button"
            >
              Edit Section Heading
            </button>
          </div>
        </article>

        <article className="insurance-admin-card">
          <CardHeader number="3" title="Why Insurance Cards">
            {reasons.length} reason{reasons.length === 1 ? "" : "s"} shown below the products
          </CardHeader>

          <div className="insurance-admin-item-grid compact">
            {reasons.length ? (
              reasons.map((item) => (
                <InsuranceItemCard
                  item={item}
                  key={item.id}
                  kind="reason"
                  onDelete={(reason) => deleteItem(reason, "this reason")}
                  onEdit={(reason) => {
                    setEditingReason(reason);
                    onActiveModalChange("edit-reason");
                  }}
                  saveLoading={saveLoading}
                />
              ))
            ) : (
              <p className="insurance-admin-empty">
                No why-insurance cards yet. Add simple reasons like Replace Lost Income, Pay Off Debt, or Business Planning.
              </p>
            )}
          </div>

          <div className="insurance-admin-actions">
            <button className="primary-button" disabled={saveLoading} onClick={addReason} type="button">
              {whySection ? "Add Reason" : "Create Why Section"}
            </button>
            <button
              className="secondary-button"
              disabled={!whySection}
              onClick={() => onActiveModalChange("edit-why-section")}
              type="button"
            >
              Edit Section Heading
            </button>
          </div>
        </article>

        <article className="insurance-admin-card insurance-admin-wide">
          <CardHeader number="4" title="Other Insurance Page Blocks">
            Extra callouts or supporting content for this page
          </CardHeader>

          <div className="insurance-admin-section-list">
            {extraSections.length ? (
              extraSections.map((section) => (
                <button
                  className="insurance-admin-section-button"
                  key={section.id}
                  onClick={() => editExtraSection(section)}
                  type="button"
                >
                  <strong>{section.title || section.section_label}</strong>
                  <span>{section.is_active ? "Visible" : "Hidden"}</span>
                </button>
              ))
            ) : (
              <p className="insurance-admin-empty">No extra blocks yet.</p>
            )}
          </div>

          <div className="insurance-admin-actions">
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
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Insurance Products Page">
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
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Life Insurance Banner">
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
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Insurance Products SEO">
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

      {activeModal === "edit-product" && editingProduct ? (
        <EditorModal onClose={closeProductEditor} title="Edit Insurance Product">
          <InsuranceItemEditor
            item={editingProduct}
            kind="product"
            onClose={closeProductEditor}
            onDeleteItem={onDeleteItem}
            onSaveItem={onSaveItem}
            onUploadAsset={onUploadAsset}
            saveLoading={saveLoading}
          />
        </EditorModal>
      ) : null}

      {activeModal === "edit-reason" && editingReason ? (
        <EditorModal onClose={closeReasonEditor} title="Edit Why Insurance Card">
          <InsuranceItemEditor
            item={editingReason}
            kind="reason"
            onClose={closeReasonEditor}
            onDeleteItem={onDeleteItem}
            onSaveItem={onSaveItem}
            onUploadAsset={onUploadAsset}
            saveLoading={saveLoading}
          />
        </EditorModal>
      ) : null}

      {activeModal === "edit-product-section" && productSection ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Product Section Heading">
          <SectionTextEditor
            defaultTitle="Insurance Products"
            onClose={() => onActiveModalChange(null)}
            onSaveSection={onSaveSection}
            saveLoading={saveLoading}
            section={productSection}
          />
        </EditorModal>
      ) : null}

      {activeModal === "edit-why-section" && whySection ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Edit Why Section Heading">
          <SectionTextEditor
            defaultTitle="Why Do You Need a Life Insurance Plan?"
            onClose={() => onActiveModalChange(null)}
            onSaveSection={onSaveSection}
            saveLoading={saveLoading}
            section={whySection}
          />
        </EditorModal>
      ) : null}

      {activeModal === "add-section" ? (
        <EditorModal onClose={() => onActiveModalChange(null)} title="Add Insurance Page Block">
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

export default InsuranceProducts;
