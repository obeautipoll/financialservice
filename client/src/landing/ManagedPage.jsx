import { Link, Navigate } from "react-router-dom";
import { getPublicNavLabel, slugToHref } from "../pageDefinitions.js";

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
  const isPageAnchor = to.startsWith("#");

  if (isInternal) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }

  if (isPageAnchor) {
    return (
      <a className={className} href={to}>
        {children}
      </a>
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
  const hasContent =
    siteSettings.footer_cta_title ||
    siteSettings.footer_cta_body ||
    (siteSettings.footer_cta_button_label && siteSettings.footer_cta_button_url);

  if (siteSettings.footer_cta_visible === false || !hasContent) {
    return null;
  }

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

const getInitials = (label) =>
  String(label || "Social")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getContactHref = (type, value) => {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return "";
  }

  if (type === "phone") {
    const phoneValue = trimmedValue.replace(/[^\d+]/g, "");
    return phoneValue ? `tel:${phoneValue}` : "";
  }

  return `mailto:${trimmedValue}`;
};

export function SiteFooter({ pages = [], siteSettings }) {
  const currentYear = new Date().getFullYear();
  const officeLines = String(siteSettings.office_location_address || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const socialLinks = (Array.isArray(siteSettings.social_links) ? siteSettings.social_links : [])
    .filter((link) => link?.is_active !== false && link?.link_url)
    .sort((left, right) => (Number(left.sort_order) || 0) - (Number(right.sort_order) || 0));
  const quickLinks = (pages || []).filter((page) => page?.is_published !== false);
  const phoneHref = getContactHref("phone", siteSettings.contact_phone);
  const emailHref = getContactHref("email", siteSettings.contact_email);
  const hasContact = Boolean(siteSettings.contact_phone || siteSettings.contact_email);

  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="footer-brand-block">
          <Link className="footer-brand" to="/">
            {siteSettings.logo_url ? <img alt="" aria-hidden="true" src={siteSettings.logo_url} /> : null}
            <span>{siteSettings.site_name}</span>
          </Link>

          <div className="footer-location">
            <h2>{siteSettings.office_location_title || "Office Location"}</h2>
            {officeLines.length ? (
              <address>
                {officeLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            ) : (
              <p>Add the office location in Site Settings.</p>
            )}
            {hasContact ? (
              <div className="footer-location-contact">
                {siteSettings.contact_phone ? (
                  <a href={phoneHref || undefined}>
                    <strong>Contact Number</strong>
                    <span>{siteSettings.contact_phone}</span>
                  </a>
                ) : null}
                {siteSettings.contact_email ? (
                  <a href={emailHref || undefined}>
                    <strong>Contact Email</strong>
                    <span>{siteSettings.contact_email}</span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="footer-lower-grid">
          <div className="footer-social-block">
            <h2>Stay Connected</h2>
            {socialLinks.length ? (
              <div className="footer-social-links">
                {socialLinks.map((link, index) => (
                  <a
                    aria-label={link.label || "Social link"}
                    className="footer-social-link"
                    href={link.link_url}
                    key={`${link.label || "social"}-${index}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.logo_url ? (
                      <img alt="" aria-hidden="true" src={link.logo_url} />
                    ) : (
                      <span>{getInitials(link.label)}</span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p>Add social links in Site Settings.</p>
            )}
          </div>

          {siteSettings.footer_quicklinks_visible !== false && quickLinks.length ? (
            <nav aria-label="Footer quick links" className="footer-quick-links">
              <h2>Quick Links</h2>
              <div>
                {quickLinks.map((page) => (
                  <Link key={page.id || page.slug} to={slugToHref(page.slug)}>
                    {getPublicNavLabel(page)}
                  </Link>
                ))}
              </div>
            </nav>
          ) : null}
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>
          &copy; {currentYear} {siteSettings.copyright_name || siteSettings.site_name}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export function PageHero({ page, siteSettings, eyebrow }) {
  if (page.hero_visible === false) {
    return null;
  }

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

      {page.hero_image_url ? (
        <div className="hero-visual">
          <img
            alt={page.page_title}
            className="site-logo"
            src={page.hero_image_url}
          />
        </div>
      ) : null}
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
