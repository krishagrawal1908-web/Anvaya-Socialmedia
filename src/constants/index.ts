import type { INavLink } from "@/types";

export const bottombarLinks: INavLink[] = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/wallpaper.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/assets/icons/people.svg",
    route: "/all-users",
    label: "People",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Saved",
  },
  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/create-post",
    label: "Create",
  },
];

export const sidebarLinks: INavLink[] = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/wallpaper.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/assets/icons/people.svg",
    route: "/all-users",
    label: "People",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Saved",
  },
  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/create-post",
    label: "Create Post",
  },
];

export const profileTabs = [
  {
    value: "posts",
    label: "Posts",
    icon: "/assets/icons/posts.svg",
  },
  {
    value: "liked",
    label: "Liked Posts",
    icon: "/assets/icons/liked.svg",
  },
  {
    value: "saved",
    label: "Saved Posts",
    icon: "/assets/icons/save.svg",
  },
];

export const accountTabs = [
  {
    value: "posts",
    label: "Posts",
    icon: "/assets/icons/posts.svg",
  },
  {
    value: "liked",
    label: "Liked Posts",
    icon: "/assets/icons/liked.svg",
  },
];

export const sidebarLinksBottom = [
  {
    imgURL: "/assets/icons/logout.svg",
    route: "/sign-in",
    label: "Logout",
  },
];