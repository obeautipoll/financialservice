import { FooterCallout, LinkButton, PageHero, SectionRenderer, getActiveItems, renderPageState } from "./ManagedPage.jsx";

function FreeAssessment({ page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const leadSection = (page.sections || [])[0] || null;
  const trailingSections = (page.sections || []).slice(1);

  return (
    <main className="landing-shell landing-page assessment-page">
      <PageHero page={page} siteSettings={siteSettings} />

      <section className="content-section assessment-shell">
        <div className="assessment-summary">
          <div className="section-heading">
            <p className="eyebrow">{leadSection?.section_label || page.nav_label}</p>
            <h2>{leadSection?.title || page.page_title}</h2>
            <p>{leadSection?.body || page.page_description}</p>
          </div>
          {leadSection?.primary_button_label && leadSection?.primary_button_url ? (
            <LinkButton to={leadSection.primary_button_url}>{leadSection.primary_button_label}</LinkButton>
          ) : null}
        </div>

        <div className="assessment-steps">
          {getActiveItems(leadSection).map((item, index) => (
            <article className="assessment-step-card" key={item.id}>
              <span className="step-index">{index + 1}</span>
              <h3>{item.title}</h3>
              {item.body ? <p>{item.body}</p> : null}
            </article>
          ))}
        </div>
      </section>

      {trailingSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}

export default FreeAssessment;
