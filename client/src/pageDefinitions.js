export const landingPageDefinitions = [
  {
    slug: "home",
    publicPath: "/",
    adminPanelId: "page-home",
    adminLabel: "Home",
    adminPath: "/admin/pages/home",
    admin: {
      hideSectionSystemFields: true,
      heroImageMode: "list"
    }
  },
  {
    slug: "about-us",
    publicPath: "/about-us",
    adminPanelId: "page-about",
    adminLabel: "About Us",
    adminPath: "/admin/pages/about-us",
    admin: {
      hideSectionSystemFields: true
    }
  },
  {
    slug: "services",
    publicPath: "/services",
    publicNavLabel: "Insurance Products",
    adminPanelId: "page-insurance-products",
    adminLabel: "Insurance Products",
    adminPath: "/admin/pages/services",
    admin: {
      hideSectionSystemFields: true
    }
  },
  {
    slug: "resources",
    publicPath: "/resources",
    adminPanelId: "page-resources",
    adminLabel: "Resources",
    adminPath: "/admin/pages/resources",
    admin: {
      hideSectionSystemFields: true
    }
  },
  {
    slug: "join-our-team",
    publicPath: "/join-our-team",
    adminPanelId: "page-join-our-team",
    adminLabel: "Join Our Team",
    adminPath: "/admin/pages/join-our-team",
    admin: {
      hideSectionSystemFields: true
    }
  },
  {
    slug: "contact",
    publicPath: "/contact",
    adminPanelId: "page-contact",
    adminLabel: "Contact",
    adminPath: "/admin/pages/contact",
    admin: {
      hideSectionSystemFields: false
    }
  }
];

export const landingPageDefinitionsBySlug = landingPageDefinitions.reduce(
  (map, pageDefinition) => ({
    ...map,
    [pageDefinition.slug]: pageDefinition
  }),
  {}
);

export const landingPageDefinitionsByAdminPanelId = landingPageDefinitions.reduce(
  (map, pageDefinition) => ({
    ...map,
    [pageDefinition.adminPanelId]: pageDefinition
  }),
  {}
);

export const slugToHref = (slug) => landingPageDefinitionsBySlug[slug]?.publicPath || `/${slug}`;

export const getPublicNavLabel = (page) => {
  const pageDefinition = landingPageDefinitionsBySlug[page?.slug];
  return pageDefinition?.publicNavLabel || page?.nav_label || pageDefinition?.adminLabel || "";
};

export const getAdminPageDefinitionBySlug = (slug) => landingPageDefinitionsBySlug[slug] || null;

export const getAdminPageDefinitionByPanelId = (panelId) =>
  landingPageDefinitionsByAdminPanelId[panelId] || null;
