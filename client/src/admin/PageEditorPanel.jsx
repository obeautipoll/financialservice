import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Home from "./Home.jsx";
import InsuranceProducts from "./InsuranceProducts.jsx";
import JoinOurTeam from "./JoinOurTeam.jsx";
import Resources from "./Resources.jsx";
import AdminPageEditor from "./AdminPageEditor.jsx";

const pageEditorsBySlug = {
  home: Home,
  "about-us": About,
  services: InsuranceProducts,
  resources: Resources,
  "join-our-team": JoinOurTeam,
  contact: Contact
};

function PageEditorPanel({ pageDefinition, ...props }) {
  const PageEditor = pageEditorsBySlug[pageDefinition?.slug] || AdminPageEditor;

  return <PageEditor {...props} pageDefinition={pageDefinition} />;
}

export default PageEditorPanel;
