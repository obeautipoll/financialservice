import {
  FooterCallout,
  LinkButton,
  SectionRenderer,
  findSectionsByType,
  getActiveItems,
  renderPageState
} from "./ManagedPage.jsx";

const getPrimaryImage = (imageList, fallbackImage) =>
  String(imageList || fallbackImage || "")
    .split(/\s*(?:\r?\n|\|)\s*/)
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean)[0] || "";

function AboutHero({ page }) {
  if (page.hero_visible === false) {
    return null;
  }

  const heroImage = getPrimaryImage(page.hero_image_url);

  return (
    <section className="about-team-hero">
      <div className="about-team-copy">
        <p className="eyebrow">{page.nav_label || "About Team"}</p>
        <h1>{page.hero_title || page.page_title || "About Team"}</h1>
        <p>{page.hero_body || page.page_description}</p>
        <LinkButton to={page.hero_primary_button_url || "/contact"}>
          {page.hero_primary_button_label || "Learn More"}
        </LinkButton>
      </div>

      {heroImage ? (
        <div className="about-team-hero-image">
          <img alt={page.page_title || "About team"} src={heroImage} />
        </div>
      ) : null}
    </section>
  );
}

function TeamCard({ item }) {
  return (
    <article className="about-team-card">
      {item.image_url ? (
        <img alt={item.title} src={item.image_url} />
      ) : (
        <div className="about-team-photo-placeholder" aria-hidden="true">
          {String(item.title || "?").slice(0, 1)}
        </div>
      )}
      <h3>{item.title}</h3>
      {item.subtitle ? <p>{item.subtitle}</p> : null}
      <div className="team-social-dots" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </article>
  );
}

function HistorySection({ section, page }) {
  const historyItems = getActiveItems(section);

  return (
    <section className="about-history-section">
      <div className="section-heading centered-heading">
        <h2>{section?.title || "History"}</h2>
        {section?.body ? <p>{section.body}</p> : null}
      </div>

      {historyItems.length ? (
        <div className="about-history-list">
          {historyItems.map((item) => (
            <article className="about-history-row" key={item.id}>
              <div>
                <strong>{item.subtitle || item.title}</strong>
                {item.subtitle ? <span>{item.title}</span> : null}
              </div>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="about-history-list">
          <article className="about-history-row">
            <div>
              <strong>{page.nav_label}</strong>
              <span>{page.page_title}</span>
            </div>
            <p>{page.page_description}</p>
          </article>
        </div>
      )}
    </section>
  );
}

function About({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const cardSections = findSectionsByType(page, "cards");
  const ctaSections = findSectionsByType(page, "cta");
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
  const remainingSections = (page.sections || []).filter((section) => !renderedSectionIds.has(section.id));

  return (
    <main className="landing-shell landing-page about-page">
      <AboutHero page={page} />

      <section className="about-team-section">
        <div className="section-heading centered-heading">
          <h2>{teamSection?.title || "Our Team"}</h2>
          <p>{teamSection?.body || page.page_description}</p>
        </div>

        {teamSection && getActiveItems(teamSection).length ? (
          <div className="about-team-grid">
            {getActiveItems(teamSection).map((item) => (
              <TeamCard item={item} key={item.id} />
            ))}
          </div>
        ) : null}
      </section>

      <HistorySection page={page} section={historySection} />

      {internsSection ? (
        <section className="about-interns-section">
          <div className="section-heading centered-heading">
            <h2>{internsSection.title || "Our Interns"}</h2>
            {internsSection.body ? <p>{internsSection.body}</p> : null}
          </div>
          <LinkButton to={internsSection.primary_button_url || "/join-our-team"}>
            {internsSection.primary_button_label || "Learn More"}
          </LinkButton>
        </section>
      ) : null}

      {remainingSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}

export default About;
