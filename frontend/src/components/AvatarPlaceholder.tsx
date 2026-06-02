type Props = {
  name?: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
};

export default function AvatarPlaceholder({
  name = "U",
  imageUrl,
  alt = "Avatar",
  className = "",
}: Props) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`avatar-placeholder-image ${className}`.trim()}
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className={`avatar-placeholder ${className}`.trim()} aria-hidden>
      {initial}
    </div>
  );
}
