export const sidebarRoutes = (user) => [
  {
    name: "acasă",
    key: "home",
    icon: "eva:home-fill",
    route: "/home",
  },
  {
    name: "matches",
    key: "matches",
    icon: "eva:heart-fill",
    route: "/matches",
  },
  {
    name: "mesaje",
    key: "messages",
    icon: "eva:message-circle-fill",
    route: "/messages",
  },
  {
    name: "premium",
    key: "premium",
    icon: "eva:star-fill",
    route: "/premium",
  },
  {
    name: "profilul meu",
    key: "profile",
    icon: "bi:person-fill",
    route: `/profile/${user?.id}`,
  },
];
