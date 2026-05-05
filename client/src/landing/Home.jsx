import { useEffect, useMemo, useState } from "react";
import {
  FooterCallout,
  LinkButton,
  SectionRenderer,
  findSection,
  getActiveItems,
  renderPageState
} from "./ManagedPage.jsx";

const splitHeroImageList = (imageList) =>
  String(imageList || "")
    .split(/\s*(?:\r?\n|\|)\s*/)
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean);

const getHomeHeroImages = (page) => {
  const seen = new Set();

  return splitHeroImageList(page.hero_image_url).filter((imageUrl) => {
    if (seen.has(imageUrl)) {
      return false;
    }

    seen.add(imageUrl);
    return true;
  });
};

const formatHomeHeroButtonLabel = (label) => {
  const trimmedLabel = String(label || "").trim();

  if (!trimmedLabel || (trimmedLabel.startsWith("[") && trimmedLabel.endsWith("]"))) {
    return trimmedLabel;
  }

  return `[${trimmedLabel}]`;
};

function HomeHero({ page }) {
  const heroImages = useMemo(() => getHomeHeroImages(page), [page]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setActiveSlide(0);
  }, [heroImages]);

  useEffect(() => {
    if (heroImages.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  return (
    <section className="home-hero" aria-label={page.hero_title || page.page_title}>
      <div className="home-hero-slideshow" aria-hidden="true">
        {heroImages.map((imageUrl, index) => (
          <img
            alt=""
            className={`home-hero-slide${index === activeSlide ? " active" : ""}`}
            key={imageUrl}
            src={imageUrl}
          />
        ))}
      </div>

      <div className="home-hero-copy">
        <h1>{page.hero_title || page.page_title}</h1>
        <p>{page.hero_body || page.page_description}</p>

        <div className="button-row">
          {page.hero_primary_button_label && page.hero_primary_button_url ? (
            <LinkButton to={page.hero_primary_button_url}>
              {formatHomeHeroButtonLabel(page.hero_primary_button_label)}
            </LinkButton>
          ) : null}

          {page.hero_secondary_button_label && page.hero_secondary_button_url ? (
            <LinkButton className="secondary-button" to={page.hero_secondary_button_url}>
              {formatHomeHeroButtonLabel(page.hero_secondary_button_label)}
            </LinkButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}

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
      {page.hero_visible === false ? null : <HomeHero page={page} />}

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
