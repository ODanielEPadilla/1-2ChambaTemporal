type Props = {
  size?: "sm" | "md" | "lg" | "hero";
  showText?: boolean;
  className?: string;
};

const sizes = {
  sm: 36,
  md: 48,
  lg: 64,
  hero: 120,
};

export default function BrandLogo({
  size = "md",
  showText = false,
  className = "",
}: Props) {
  const height = sizes[size];

  return (
    <div className={`brand-logo ${className}`.trim()}>
      <img
        src="/logo-chamba.png"
        alt="1/2 Chamba"
        className="brand-logo-image"
        style={{ height }}
      />
      {showText && <span className="brand-logo-text">1/2 Chamba</span>}
    </div>
  );
}
