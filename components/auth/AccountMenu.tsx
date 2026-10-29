"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, UserRound } from "lucide-react";
import { popover } from "@/lib/motion";
import { avatarUrl, displayName, useAuth } from "./AuthProvider";
import { Avatar } from "./Avatar";

/** Header: "Sign in", or the signed-in user's avatar with a small menu. Hidden when accounts aren't set up. */
export function AccountMenu() {
  const { configured, loading, user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!configured) return null;
  // Same size as the avatar, so the header doesn't jump while we check.
  if (loading) return <span className="size-9 rounded-full border border-border bg-surface" aria-hidden />;

  if (!user) {
    const next = pathname.startsWith("/login") ? "/learn" : pathname;
    return (
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Sign in
      </Link>
    );
  }

  const name = displayName(user, profile);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        className="flex rounded-full transition-opacity hover:opacity-90"
      >
        <Avatar name={name} src={avatarUrl(user, profile)} size={36} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={popover}
            className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-2xl border border-border bg-surface p-1.5 shadow-lg shadow-black/5"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-background"
            >
              <UserRound className="size-4 text-muted" aria-hidden /> Your account
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.refresh();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-background"
            >
              <LogOut className="size-4 text-muted" aria-hidden /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
