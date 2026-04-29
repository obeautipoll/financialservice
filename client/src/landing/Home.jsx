import {
  FooterCallout,
  LinkButton,
  PageHero,
  SectionRenderer,
  findSection,
  getActiveItems,
  renderPageState
} from "./ManagedPage.jsx";

function Home({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const whoWeHelp = findSection(page, "who-we-help");
  const servicesOverview = findSection(page, "services") || findSection(page, "services-overview");
  const recruitment = findSection(page, "join-our-team");
  const remainingSections = (page.sections || []).filter(
    (section) => ![whoWeHelp?.id, servicesOverview?.id, recruitment?.id].includes(section.id)
  );

  return (
    <main className="landing-shell landing-page home-page">
      <PageHero page={page} siteSettings={siteSettings} />

      {whoWeHelp ? (
        <section className="content-section split-section">
          <div className="section-heading split-section-copy">
            <p className="eyebrow">{whoWeHelp.section_label}</p>
            {whoWeHelp.title ? <h2>{whoWeHelp.title}</h2> : null}
            {whoWeHelp.body ? <p>{whoWeHelp.body}</p> : null}
          </div>
          <div className="mini-card-grid">
            {getActiveItems(whoWeHelp).map((item) => (
              <article className="mini-feature-card" key={item.id}>
                {item.image_url ? <img alt={item.title} className="content-image" src={item.image_url} /> : null}
                <h3>{item.title}</h3>
                {item.body ? <p>{item.body}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {servicesOverview ? (
        <section className="content-section">
          <div className="section-heading">
            <p className="eyebrow">{servicesOverview.section_label}</p>
            {servicesOverview.title ? <h2>{servicesOverview.title}</h2> : null}
            {servicesOverview.body ? <p>{servicesOverview.body}</p> : null}
          </div>
          <div className="service-showcase-grid">
            {getActiveItems(servicesOverview).map((item) => (
              <article className="service-showcase-card" key={item.id}>
                <div className="service-showcase-top">
                  <div>
                    <h3>{item.title}</h3>
                    {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
                  </div>
                  {item.image_url ? <img alt={item.title} className="service-avatar" src={item.image_url} /> : null}
                </div>
                {item.body ? <p>{item.body}</p> : null}
                {item.link_label && item.link_url ? <LinkButton to={item.link_url}>{item.link_label}</LinkButton> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {remainingSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      {recruitment ? (
        <section className="content-section spotlight-banner">
          <div className="section-heading">
            <p className="eyebrow">{recruitment.section_label}</p>
            {recruitment.title ? <h2>{recruitment.title}</h2> : null}
            {recruitment.body ? <p>{recruitment.body}</p> : null}
          </div>
          <div className="button-row">
            <LinkButton to={recruitment.primary_button_url}>{recruitment.primary_button_label}</LinkButton>
            {recruitment.secondary_button_label && recruitment.secondary_button_url ? (
              <LinkButton className="secondary-button" to={recruitment.secondary_button_url}>
                {recruitment.secondary_button_label}
              </LinkButton>
            ) : null}
          </div>
        </section>
      ) : null}

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}

export default Home;
