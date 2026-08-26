"use client";

interface SortSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

export function SortSelect({ options, value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs text-michket-charcoal/50 whitespace-nowrap">
        Trier par
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 text-xs text-michket-black bg-michket-ivory border border-michket-gold/15 focus:outline-none focus:border-michket-gold/40 transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
