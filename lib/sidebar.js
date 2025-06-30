export const sidebarRoutes = (user) => {
  const baseRoutes = [
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

  // Add admin routes if user is admin
  if (user?.email === 'catalin.iamandi@gmail.com') {
    baseRoutes.push(
      {
        name: "admin",
        key: "admin",
        icon: "eva:settings-2-fill",
        route: "/admin",
      },
      {
        name: "support chat",
        key: "adminChats",
        icon: "eva:message-square-fill",
        route: "/admin/chats",
      }
    );
  }

  return baseRoutes;
};
