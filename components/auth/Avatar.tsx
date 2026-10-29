import Image from "next/image";

/** A round avatar: the user's picture, or their initials on the accent colour. */
export function Avatar({ name, src, size = 36 }: { name: string; src: string | null; size?: number }) {
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return src ? (
    // unoptimized: avatars come from the sign-in provider's own servers.
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      referrerPolicy="no-referrer"
      className="shrink-0 rounded-full border border-border object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-accent font-display font-bold text-accent-foreground"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </span>
  );
}
