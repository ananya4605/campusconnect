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

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
