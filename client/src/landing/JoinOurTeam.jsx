import { useState } from "react";
import { FooterCallout, PageHero, SectionRenderer, getActiveItems, renderPageState } from "./ManagedPage.jsx";

function ApplicationForm({ onSubmitTeamApplication }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    experience_level: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      setSubmitting(true);
      await onSubmitTeamApplication(form);
      setForm({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        experience_level: "",
        message: ""
      });
      setTone("success");
      setMessage("Application received. Our team will review your details.");
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Unable to submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="join-application-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <p className="eyebrow">Apply Now</p>
        <h2>Join Our Team</h2>
        <p>Send your basic details. We will contact you about the next step.</p>
      </div>

      <div className="join-form-grid">
        <label>
          <span>Name</span>
          <input autoComplete="name" name="full_name" onChange={handleChange} required type="text" value={form.full_name} />
        </label>

        <label>
          <span>Email</span>
          <input autoComplete="email" name="email" onChange={handleChange} required type="email" value={form.email} />
        </label>

        <label>
          <span>Number</span>
          <input autoComplete="tel" name="phone" onChange={handleChange} required type="tel" value={form.phone} />
        </label>

        <label>
          <span>Location</span>
          <input name="location" onChange={handleChange} type="text" value={form.location} />
        </label>

        <label className="full-span">
          <span>Experience</span>
          <select name="experience_level" onChange={handleChange} value={form.experience_level}>
            <option value="">Select one</option>
            <option value="new">New to financial services</option>
            <option value="some">Some sales or finance experience</option>
            <option value="experienced">Experienced advisor or agent</option>
          </select>
        </label>

        <label className="full-span">
          <span>Short Message</span>
          <textarea name="message" onChange={handleChange} rows="4" value={form.message} />
        </label>
      </div>

      <button className="primary-button" disabled={submitting} type="submit">
        {submitting ? "Sending..." : "Submit Application"}
      </button>

      {message ? <p className={`form-message ${tone}`}>{message}</p> : null}
    </form>
  );
}

function TeamMemberPreview({ member }) {
  return (
    <article className="join-team-member-card">
      {member.image_url ? (
        <img alt={member.title || "Team member"} src={member.image_url} />
      ) : (
        <div className="join-team-member-placeholder" aria-hidden="true">
          {String(member.title || "?").slice(0, 1)}
        </div>
      )}
      <div>
        <h3>{member.title || "Team Member"}</h3>
        {member.subtitle ? <p>{member.subtitle}</p> : null}
      </div>
    </article>
  );
}

function MentorshipSpotlight({ items }) {
  const spotlightItems = items.slice(0, 2);
  const fallbackItems = [
    {
      id: "mentorship-primary",
      title: "Join Our Team",
      body: "Work with experienced mentors, learn the financial services process, and grow with a team that supports your next step."
    },
    {
      id: "mentorship-secondary",
      title: "Mentorship Spotlight",
      body: "Receive practical guidance, client-service training, and support from people who want to help you build confidence."
    }
  ];
  const renderedItems = spotlightItems.length ? spotlightItems : fallbackItems;

  return (
    <section className="content-section join-mentorship-section">
      <div className="section-heading centered-heading">
        <h2>Mentorship Spotlight</h2>
      </div>

      <div className="join-mentorship-list">
        {renderedItems.map((item, index) => (
          <article className={`join-mentorship-row${index % 2 === 1 ? " reversed" : ""}`} key={item.id || item.title}>
            {item.image_url ? (
              <img alt={item.title || "Mentorship"} src={item.image_url} />
            ) : (
              <div className="join-mentorship-photo-placeholder" aria-hidden="true">
                {String(item.title || "M").slice(0, 1)}
              </div>
            )}
            <div className="join-mentorship-copy">
              <h3>{item.title || "Mentorship Spotlight"}</h3>
              {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
              <p>{item.body || "Learn directly from the team and build a career helping people protect their future."}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function JoinOurTeam({ onSubmitTeamApplication, page, pagesLoading, siteSettings, teamMembers = [] }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const cardSections = (page.sections || []).filter((section) => section.section_type === "cards");
  const mentorshipSection =
    cardSections.find((section) => /mentor|spotlight/i.test(`${section.section_key} ${section.section_label} ${section.title}`)) ||
    cardSections[0] ||
    null;
  const benefitsSection =
    cardSections.find(
      (section) =>
        section.id !== mentorshipSection?.id &&
        /benefit|career|role|training|support|join|why/i.test(`${section.section_key} ${section.section_label} ${section.title}`)
    ) ||
    cardSections.find((section) => section.id !== mentorshipSection?.id) ||
    null;
  const renderedSectionIds = new Set([mentorshipSection?.id, benefitsSection?.id].filter(Boolean));
  const otherSections = (page.sections || []).filter((section) => !renderedSectionIds.has(section.id));

  return (
    <main className="landing-shell landing-page team-page">
      <PageHero page={page} siteSettings={siteSettings} />

      {benefitsSection ? (
        <section className="content-section join-team-benefits">
          <div className="section-heading">
            <p className="eyebrow">{benefitsSection.section_label}</p>
            {benefitsSection.title ? <h2>{benefitsSection.title}</h2> : null}
            {benefitsSection.body ? <p>{benefitsSection.body}</p> : null}
          </div>
          <div className="join-benefit-grid">
            {getActiveItems(benefitsSection).map((item) => (
              <article className="join-benefit-card" key={item.id}>
                {item.image_url ? <img alt={item.title} className="content-image" src={item.image_url} /> : null}
                <h3>{item.title}</h3>
                {item.subtitle ? <p className="card-subtitle">{item.subtitle}</p> : null}
                {item.body ? <p>{item.body}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {otherSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <MentorshipSpotlight items={getActiveItems(mentorshipSection)} />

      {teamMembers.length ? (
        <section className="content-section join-team-preview-section">
          <div className="section-heading centered-heading">
            <p className="eyebrow">Our Team</p>
            <h2>Meet the People You May Work With</h2>
            <p>Get to know the team behind our client service and training culture.</p>
          </div>
          <div className="join-team-member-grid">
            {teamMembers.map((member) => (
              <TeamMemberPreview key={member.id} member={member} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-section join-application-section" id="join-application">
        <div className="join-application-copy">
          <p className="eyebrow">Career Opportunity</p>
          <h2>Ready to start a meaningful career?</h2>
          <p>
            We are looking for people who communicate well, care about clients, and are willing to learn. Submit your details and our team will contact you.
          </p>
        </div>
        <ApplicationForm onSubmitTeamApplication={onSubmitTeamApplication} />
      </section>

      <FooterCallout siteSettings={siteSettings} />
    </main>
  );
}

export default JoinOurTeam;
