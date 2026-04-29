import {
  FooterCallout,
  PageHero,
  SectionRenderer,
  findSectionsByType,
  getActiveItems,
  renderPageState
} from "./ManagedPage.jsx";

function About({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const cardSections = findSectionsByType(page, "cards");
  const nonCardSections = (page.sections || []).filter((section) => section.section_type !== "cards");

  return (
    <main className="landing-shell landing-page about-page">
      <PageHero page={page} siteSettings={siteSettings} />

      <section className="content-section narrative-panel">
        <div className="section-heading">
          <p className="eyebrow">{page.nav_label}</p>
          <h2>{page.page_title}</h2>
          <p>{page.page_description}</p>
        </div>
      </section>

      {cardSections.map((section) => (
        <section className="content-section team-section" key={section.id}>
          <div className="section-heading">
            <p className="eyebrow">{section.section_label}</p>
            {section.title ? <h2>{section.title}</h2> : null}
            {section.body ? <p>{section.body}</p> : null}
          </div>
          <div className="profile-grid">
            {getActiveItems(section).map((item) => (
              <article className="profile-card" key={item.id}>
                {item.image_url ? <img alt={item.title} className="profile-image" src={item.image_url} /> : null}
                <h3>{item.title}</h3>
                {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
                {item.body ? <p>{item.body}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ))}

      {nonCardSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}

export default About;
