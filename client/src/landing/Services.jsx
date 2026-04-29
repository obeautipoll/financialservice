import {
  FooterCallout,
  LinkButton,
  PageHero,
  SectionRenderer,
  findSectionsByType,
  getActiveItems,
  renderPageState
} from "./ManagedPage.jsx";

function Services({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const cardSections = findSectionsByType(page, "cards");
  const otherSections = (page.sections || []).filter((section) => section.section_type !== "cards");

  return (
    <main className="landing-shell landing-page services-page">
      <PageHero page={page} siteSettings={siteSettings} />

      {cardSections.map((section) => (
        <section className="content-section stacked-services" key={section.id}>
          <div className="section-heading">
            <p className="eyebrow">{section.section_label}</p>
            {section.title ? <h2>{section.title}</h2> : null}
            {section.body ? <p>{section.body}</p> : null}
          </div>
          <div className="stacked-service-list">
            {getActiveItems(section).map((item) => (
              <article className="stacked-service-row" key={item.id}>
                <div className="stacked-service-main">
                  {item.image_url ? <img alt={item.title} className="service-avatar" src={item.image_url} /> : null}
                  <div>
                    <h3>{item.title}</h3>
                    {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
                    {item.body ? <p>{item.body}</p> : null}
                  </div>
                </div>
                {item.link_label && item.link_url ? <LinkButton to={item.link_url}>{item.link_label}</LinkButton> : null}
              </article>
            ))}
          </div>
        </section>
      ))}

      {otherSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}

export default Services;
