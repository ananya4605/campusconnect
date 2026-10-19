import { CATEGORIES } from "../constants";

export default function CategoryFilter({ value, onChange }) {
  const options = ["All", ...CATEGORIES];
  return (
    <div className="chips" role="tablist" aria-label="Filter by category">
      {options.map((option) => (
        <button
          key={option}
          role="tab"
          aria-selected={value === option}
          className={`chip ${value === option ? "chip-active" : ""}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
