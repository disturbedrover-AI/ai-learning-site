import Link from "next/link";
import { site } from "@/lib/site";

/** Placeholder logo: swap the mark for a real logo file later. */
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-foreground">
        AI
      </span>
      <span>{site.name}</span>
    </Link>
  );
}
