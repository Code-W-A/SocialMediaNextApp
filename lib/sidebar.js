export const sidebarRoutes = (user) => [
  {
    name: "acasă",
    icon: "eva:home-fill",
    route: "/home",
  },
  {
    name: "matches",
    icon: "eva:heart-fill",
    route: "/matches",
  },
  {
    name: "mesaje",
    icon: "eva:message-circle-fill",
    route: "/messages",
  },
  {
    name: "profilul meu",
    icon: "bi:person-fill",
    route: `/profile/${user?.id}`,
  },
];
