import { Link, useLocation } from "react-router-dom";
import { CATEGORIES } from "../constants";

const ICONS = {
  home: "M3 10.6 12 3.2l9 7.4M5.4 9.2V20.8h13.2V9.2",
  list: "M4 6.5h16M4 12h16M4 17.5h16",
  briefcase: "M3.5 8.5h17V20h-17zM8 8.5V5.6h8v2.9M3.5 13.2h17",
  calendar: "M4 6.6h16V20H4zM4 11.2h16M8.4 3.6V8M15.6 3.6V8",
  book: "M12 6.6C10.5 5.1 8 4.6 4 5.1v14c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5v-14c-4-.5-6.5 0-8 1.5Zm0 0v14",
  megaphone: "M4 10v4h3l7 4V6l-7 4H4ZM17 10.4a3.2 3.2 0 0 1 0 3.2",
  pin: "M12 21s6.4-5.4 6.4-9.9A6.4 6.4 0 1 0 5.6 11.1C5.6 15.6 12 21 12 21Zm0-8a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z",
  plus: "M12 5.2v13.6M5.2 12h13.6",
  user: "M12 11.8a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8ZM5 20.4a7 7 0 0 1 14 0",
  profile:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 10.4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM7.3 17.5a5.3 5.3 0 0 1 9.4 0",
};

const CATEGORY_ICONS = {
  Internships: "briefcase",
  Events: "calendar",
  "Study Materials": "book",
  Announcements: "megaphone",
  "Lost & Found": "pin",
};

function SideLink({ link, onNavigate }) {
  return (
    <Link
      to={link.to}
      onClick={onNavigate}
      className={`side-link${link.active ? " active" : ""}`}
      aria-current={link.active ? "page" : undefined}
    >
      <svg
        className="side-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={ICONS[link.icon]} />
      </svg>
      <span>{link.label}</span>
    </Link>
  );
}

export default function Sidebar({ open, onNavigate }) {
  const { pathname, search } = useLocation();
  const category = new URLSearchParams(search).get("category");
  const onFeed = pathname === "/";

  const browse = [
    { to: "/", label: "Home", icon: "home", active: onFeed && !category },
    {
      to: "/?category=All",
      label: "All Posts",
      icon: "list",
      active: onFeed && category === "All",
    },
    ...CATEGORIES.map((name) => ({
      to: `/?category=${encodeURIComponent(name)}`,
      label: name,
      icon: CATEGORY_ICONS[name],
      active: onFeed && category === name,
    })),
  ];

  const mine = [
    {
      to: "/posts/new",
      label: "Create Post",
      icon: "plus",
      active: pathname === "/posts/new",
    },
    {
      to: "/dashboard",
      label: "My Posts",
      icon: "user",
      active: pathname.startsWith("/dashboard") || pathname.endsWith("/edit"),
    },
    {
      to: "/profile",
      label: "Profile",
      icon: "profile",
      active: pathname.startsWith("/profile"),
    },
  ];

  return (
    <>
      <div
        className={`side-scrim${open ? " show" : ""}`}
        onClick={onNavigate}
        aria-hidden="true"
      />
      <aside className={`sidebar${open ? " open" : ""}`} aria-label="Main navigation">
        <nav className="side-nav">
          <p className="side-group">Browse</p>
          {browse.map((link) => (
            <SideLink key={link.to} link={link} onNavigate={onNavigate} />
          ))}
          <p className="side-group">You</p>
          {mine.map((link) => (
            <SideLink key={link.to} link={link} onNavigate={onNavigate} />
          ))}
        </nav>
      </aside>
    </>
  );
}
