import {
  FooterCallout,
  LinkButton,
  SectionRenderer,
  findSectionsByType,
  getActiveItems,
  renderPageState
} from "./ManagedPage.jsx";

const splitDetails = (text) =>
  String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const getHeroImage = (imageList) =>
  String(imageList || "")
    .split(/\s*(?:\r?\n|\|)\s*/)
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean)[0] || "";

function InsuranceProductsHero({ page }) {
  if (page.hero_visible === false) {
    return null;
  }

  const heroImage = getHeroImage(page.hero_image_url);

  return (
    <section className="insurance-hero">
      <div className="insurance-hero-copy">
        <p className="eyebrow">Insurance Products</p>
        <h1>{page.hero_title || "Insurance Products"}</h1>
        <p>{page.hero_body || page.page_description}</p>
        <LinkButton to={page.hero_primary_button_url || "/contact"}>
          {page.hero_primary_button_label || "Get Your Quote"}
        </LinkButton>
      </div>

      {heroImage ? (
        <div className="insurance-hero-image">
          <img alt={page.page_title || "Insurance products"} src={heroImage} />
        </div>
      ) : null}
    </section>
  );
}

function ProductCard({ item }) {
  const details = splitDetails(item.body);

  return (
    <article className="insurance-product-card">
      {item.image_url ? <img alt={item.title} src={item.image_url} /> : null}
      <h3>{item.title}</h3>
      {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
      {details.length ? (
        <ul>
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
      {item.link_label && item.link_url ? <LinkButton to={item.link_url}>{item.link_label}</LinkButton> : null}
    </article>
  );
}

function InsuranceProducts({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const cardSections = findSectionsByType(page, "cards");
  const productSection = cardSections[0] || null;
  const whySection = cardSections[1] || null;
  const renderedIds = new Set([productSection?.id, whySection?.id].filter(Boolean));
  const otherSections = (page.sections || []).filter((section) => !renderedIds.has(section.id));

  return (
    <main className="landing-shell landing-page insurance-products-page">
      <InsuranceProductsHero page={page} />

      <section className="insurance-products-section">
        <div className="section-heading centered-heading">
          <h2>{productSection?.title || "Insurance Products"}</h2>
          <p>{productSection?.body || "Choose from insurance products managed in the admin dashboard."}</p>
        </div>

        {productSection && getActiveItems(productSection).length ? (
          <div className="insurance-product-grid">
            {getActiveItems(productSection).map((item) => (
              <ProductCard item={item} key={item.id} />
            ))}
          </div>
        ) : null}
      </section>

      {whySection ? (
        <section className="insurance-why-section">
          <div className="section-heading centered-heading">
            <h2>{whySection.title || "Why Do You Need an Insurance Plan?"}</h2>
            {whySection.body ? <p>{whySection.body}</p> : null}
          </div>
          <div className="insurance-why-grid">
            {getActiveItems(whySection).map((item) => (
              <ProductCard item={item} key={item.id} />
            ))}
          </div>
        </section>
      ) : null}

      {otherSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}

export default InsuranceProducts;
