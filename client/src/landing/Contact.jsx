import { useState } from "react";
import { FooterCallout, LinkButton, PageHero, SectionRenderer, getActiveItems, renderPageState } from "./ManagedPage.jsx";

function ContactRequestForm({ onSubmitContactLead }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: ""
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
      await onSubmitContactLead({
        full_name: form.full_name.trim(),
        phone: form.phone.trim()
      });
      setForm({
        full_name: "",
        phone: ""
      });
      setTone("success");
      setMessage("Thank you. We received your name and number.");
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Unable to send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="contact-request-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <p className="eyebrow">Contact Form</p>
        <h2>Name and Number</h2>
        <p>Send your contact details and our team will reach out.</p>
      </div>

      <label>
        <span>Name</span>
        <input
          autoComplete="name"
          name="full_name"
          onChange={handleChange}
          placeholder="Your name"
          required
          type="text"
          value={form.full_name}
        />
      </label>

      <label>
        <span>Number</span>
        <input
          autoComplete="tel"
          name="phone"
          onChange={handleChange}
          placeholder="Your phone number"
          required
          type="tel"
          value={form.phone}
        />
      </label>

      <button className="primary-button" disabled={submitting} type="submit">
        {submitting ? "Sending..." : "Send"}
      </button>

      {message ? <p className={`form-message ${tone}`}>{message}</p> : null}
    </form>
  );
}

function Contact({ onSubmitContactLead, page, pagesLoading, siteSettings }) {
  const state = renderPageState(page, pagesLoading);
  if (state) {
    return state;
  }

  const leadSection = (page.sections || [])[0] || null;
  const extraSections = (page.sections || []).slice(1);

  return (
    <main className="landing-shell landing-page contact-page">
      <PageHero page={page} siteSettings={siteSettings} />

      <section className="content-section contact-layout" id="contact-details">
        <div className="section-heading">
          <p className="eyebrow">{leadSection?.section_label || "Contact Us"}</p>
          <h2>{leadSection?.title || "Talk to Our Team"}</h2>
          <p>{leadSection?.body || "Leave your name and number and our team will contact you."}</p>
          {leadSection?.primary_button_label && leadSection?.primary_button_url ? (
            <LinkButton to={leadSection.primary_button_url}>{leadSection.primary_button_label}</LinkButton>
          ) : null}
        </div>
        <ContactRequestForm onSubmitContactLead={onSubmitContactLead} />
      </section>

      {leadSection && getActiveItems(leadSection).length ? (
        <section className="content-section contact-card-section">
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
