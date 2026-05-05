import AdminPageEditor from "./AdminPageEditor.jsx";

const editorConfig = {
  sectionDescription: "Edit only the Contact page contact blocks, office details, and contact-page sections here."
};

function Contact(props) {
  return <AdminPageEditor {...props} editorConfig={editorConfig} />;
}

export default Contact;
