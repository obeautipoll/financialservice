import { Link, Navigate } from "react-router-dom";

export function renderPageState(page, pagesLoading) {
  if (pagesLoading && !page) {
    return <main className="landing-shell">Loading content...</main>;
  }

  if (!page) {
    return <Navigate replace to="/" />;
  }

  return null;
}

export function LinkButton({ children, className = "primary-button", to }) {
  if (!to) {
    return null;
  }

  const isInternal = to.startsWith("/");

  if (isInternal) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <a className={className} href={to} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
}

export function SectionRenderer({ section }) {
  if (!section.is_active) {
    return null;
  }

  if (section.section_type === "cards") {
    return (
      <section className="content-section section-card-grid">
        <div className="section-heading">
          <p className="eyebrow">{section.section_label}</p>
          {section.title ? <h2>{section.title}</h2> : null}
          {section.body ? <p>{section.body}</p> : null}
        </div>

        <div className="card-grid">
          {(section.items || [])
            .filter((item) => item.is_active)
            .map((item) => (
              <article className="content-card" key={item.id}>
                {item.image_url ? <img alt={item.title} className="content-image" src={item.image_url} /> : null}
                <h3>{item.title}</h3>
                {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
                {item.body ? <p>{item.body}</p> : null}
                {item.link_label && item.link_url ? (
                  <LinkButton className="text-link" to={item.link_url}>
                    {item.link_label}
                  </LinkButton>
                ) : null}
              </article>
            ))}
        </div>
      </section>
    );
  }

  if (section.section_type === "cta") {
    return (
      <section className="content-section cta-banner">
        <div className="section-heading">
          <p className="eyebrow">{section.section_label}</p>
          {section.title ? <h2>{section.title}</h2> : null}
          {section.body ? <p>{section.body}</p> : null}
        </div>

        <div className="button-row">
          <LinkButton to={section.primary_button_url}>{section.primary_button_label}</LinkButton>
          {section.secondary_button_label && section.secondary_button_url ? (
            <LinkButton className="secondary-button" to={section.secondary_button_url}>
              {section.secondary_button_label}
            </LinkButton>
          ) : null}
        </div>
      </section>
    );
  }

  if (section.section_type === "list") {
    return (
      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">{section.section_label}</p>
          {section.title ? <h2>{section.title}</h2> : null}
          {section.body ? <p>{section.body}</p> : null}
        </div>

        <div className="list-block">
          {(section.items || [])
            .filter((item) => item.is_active)
            .map((item) => (
              <article className="list-row" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
                  {item.body ? <p>{item.body}</p> : null}
                </div>
                {item.link_label && item.link_url ? <LinkButton to={item.link_url}>{item.link_label}</LinkButton> : null}
              </article>
            ))}
        </div>
      </section>
    );
  }

  return (
    <section className="content-section">
      <div className="content-layout">
        <div className="section-heading">
          <p className="eyebrow">{section.section_label}</p>
          {section.title ? <h2>{section.title}</h2> : null}
          {section.subtitle ? <p className="card-subtitle">{section.subtitle}</p> : null}
          {section.body ? <p>{section.body}</p> : null}
          <div className="button-row">
            <LinkButton to={section.primary_button_url}>{section.primary_button_label}</LinkButton>
            {section.secondary_button_label && section.secondary_button_url ? (
              <LinkButton className="secondary-button" to={section.secondary_button_url}>
                {section.secondary_button_label}
              </LinkButton>
            ) : null}
          </div>
        </div>

        {section.image_url ? (
          <div className="hero-visual">
            <img alt={section.title || section.section_label} className="site-logo" src={section.image_url} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function findSection(page, sectionKey) {
  return page?.sections?.find((section) => section.section_key === sectionKey) || null;
}

export function findSectionsByType(page, sectionType) {
  return (page?.sections || []).filter((section) => section.section_type === sectionType);
}

export function getActiveItems(section) {
  return (section?.items || []).filter((item) => item.is_active);
}

export function FooterCallout({ siteSettings }) {
  return (
    <section className="content-section footer-cta">
      <div className="section-heading">
        <p className="eyebrow">{siteSettings.site_name}</p>
        <h2>{siteSettings.footer_cta_title}</h2>
        <p>{siteSettings.footer_cta_body}</p>
      </div>

      <LinkButton to={siteSettings.footer_cta_button_url}>{siteSettings.footer_cta_button_label}</LinkButton>
    </section>
  );
}

export function PageHero({ page, siteSettings, eyebrow }) {
  return (
    <section className="hero-panel landing-hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow || page.nav_label || siteSettings.site_name}</p>
        <h1>{page.hero_title || page.page_title}</h1>
        <p>{page.hero_body || page.page_description}</p>

        <div className="button-row">
          {page.hero_primary_button_label && page.hero_primary_button_url ? (
            <LinkButton to={page.hero_primary_button_url}>{page.hero_primary_button_label}</LinkButton>
          ) : null}

          {page.hero_secondary_button_label && page.hero_secondary_button_url ? (
            <LinkButton className="secondary-button" to={page.hero_secondary_button_url}>
              {page.hero_secondary_button_label}
            </LinkButton>
          ) : null}
        </div>
      </div>

      <div className="hero-visual">
        {page.hero_image_url || siteSettings.logo_url ? (
          <img
            alt={page.page_title}
            className="site-logo"
            src={page.hero_image_url || siteSettings.logo_url}
          />
        ) : (
          <div className="logo-placeholder large">Add a hero image or logo</div>
        )}
      </div>
    </section>
  );
}

export function ManagedPage({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  return (
    <main className="landing-shell">
      <PageHero page={page} siteSettings={siteSettings} />

      {(page.sections || []).map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}
