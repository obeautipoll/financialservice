import AdminPageEditor from "./AdminPageEditor.jsx";

const editorConfig = {
  sectionDescription: "Edit only the Resources page articles, guides, downloads, and resource-page sections here."
};

function Resources(props) {
  return <AdminPageEditor {...props} editorConfig={editorConfig} />;
}

export default Resources;
