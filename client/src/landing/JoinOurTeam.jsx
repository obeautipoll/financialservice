import { FooterCallout, LinkButton, PageHero, SectionRenderer, getActiveItems, renderPageState } from "./ManagedPage.jsx";

function JoinOurTeam({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const cardsSection = (page.sections || []).find((section) => section.section_type === "cards");
  const otherSections = (page.sections || []).filter((section) => section.id !== cardsSection?.id);

  return (
    <main className="landing-shell landing-page team-page">
      <PageHero page={page} siteSettings={siteSettings} />

      {cardsSection ? (
        <section className="content-section spotlight-grid-section">
          <div className="section-heading">
            <p className="eyebrow">{cardsSection.section_label}</p>
            {cardsSection.title ? <h2>{cardsSection.title}</h2> : null}
            {cardsSection.body ? <p>{cardsSection.body}</p> : null}
          </div>
          <div className="spotlight-grid">
            {getActiveItems(cardsSection).map((item) => (
              <article className="spotlight-card" key={item.id}>
                {item.image_url ? <img alt={item.title} className="content-image" src={item.image_url} /> : null}
                <h3>{item.title}</h3>
                {item.body ? <p>{item.body}</p> : null}
                {item.link_label && item.link_url ? <LinkButton to={item.link_url}>{item.link_label}</LinkButton> : null}
              </article>
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

export default JoinOurTeam;
