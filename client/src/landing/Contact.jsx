import { FooterCallout, LinkButton, PageHero, SectionRenderer, getActiveItems, renderPageState } from "./ManagedPage.jsx";

function Contact({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const leadSection = (page.sections || [])[0] || null;
  const extraSections = (page.sections || []).slice(1);

  return (
    <main className="landing-shell landing-page contact-page">
      <PageHero page={page} siteSettings={siteSettings} />

      {leadSection ? (
        <section className="content-section contact-layout">
          <div className="section-heading">
            <p className="eyebrow">{leadSection.section_label}</p>
            {leadSection.title ? <h2>{leadSection.title}</h2> : null}
            {leadSection.body ? <p>{leadSection.body}</p> : null}
            {leadSection.primary_button_label && leadSection.primary_button_url ? (
              <LinkButton to={leadSection.primary_button_url}>{leadSection.primary_button_label}</LinkButton>
            ) : null}
          </div>
          <div className="contact-card-list">
            {getActiveItems(leadSection).map((item) => (
              <article className="contact-card" key={item.id}>
                <h3>{item.title}</h3>
                {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
                {item.body ? <p>{item.body}</p> : null}
                {item.link_label && item.link_url ? <LinkButton to={item.link_url}>{item.link_label}</LinkButton> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {extraSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}

export default Contact;
