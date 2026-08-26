interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

const variantStyles: Record<string, string> = {
  new: "bg-michket-gold text-white",
  popular: "bg-michket-black text-white",
  promo: "bg-red-500 text-white",
  limited: "bg-michket-gold/80 text-white",
  exclusive: "bg-michket-charcoal text-white",
  default: "bg-michket-ivory text-michket-charcoal",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {children}
    </span>
  );
}
