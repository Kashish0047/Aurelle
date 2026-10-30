/** Sidebar entries, in order. */
export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" },
  { href: "/admin/services", label: "Services", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/admin/packages", label: "Packages", icon: "M20 7 12 3 4 7v10l8 4 8-4V7Zm-8 4 8-4M12 11 4 7m8 4v10" },
  { href: "/admin/offers", label: "Offers & Banners", icon: "M7 7h.01M3 11V3h8l10 10-8 8L3 11Z" },
  { href: "/admin/gallery", label: "Recent Work", icon: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "M7 8h10M7 12h6m-9 8 3-3h11V4H4v16Z" },
  { href: "/admin/team", label: "Team", icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0" },
  { href: "/admin/faq", label: "FAQ", icon: "M9 9a3 3 0 1 1 4 2.8c-.6.3-1 .9-1 1.6V14m0 3h.01" },
  { href: "/admin/bookings", label: "Bookings", icon: "M7 3v4m10-4v4M4 9h16M5 5h14v16H5z" },
  { href: "/admin/settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-3 2-1-2-4-2 1-2-1-1-2h-4l-1 2-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4-2-1v-2Z" },
] as const;

export type AdminNavItem = (typeof ADMIN_NAV)[number];
