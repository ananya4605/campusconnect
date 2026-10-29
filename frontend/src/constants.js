export const CATEGORIES = [
  "Internships",
  "Events",
  "Study Materials",
  "Announcements",
  "Lost & Found",
];

export const CATEGORY_CLASS = {
  Internships: "badge-internships",
  Events: "badge-events",
  "Study Materials": "badge-study",
  Announcements: "badge-announce",
  "Lost & Found": "badge-lost",
};

export const CATEGORY_ACCENT = {
  Internships: "acc-internships",
  Events: "acc-events",
  "Study Materials": "acc-study",
  Announcements: "acc-announce",
  "Lost & Found": "acc-lost",
};

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function initials(value) {
  const words = (value || "").split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
