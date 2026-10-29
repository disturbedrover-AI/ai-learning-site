import { icons, type LucideProps } from "lucide-react";

/** "brain-circuit" → "BrainCircuit", the name lucide-react uses. */
const toComponentName = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/** A lesson's icon, from the `icon` field in its frontmatter (any name from lucide.dev/icons). */
export function LessonIcon({ name, ...props }: { name?: string } & LucideProps) {
  const Icon = name ? icons[toComponentName(name) as keyof typeof icons] : icons.BookOpen;
  if (!Icon) {
    throw new Error(`Lesson icon "${name}" doesn't exist. Pick a name from lucide.dev/icons, e.g. "brain-circuit".`);
  }
  return <Icon aria-hidden strokeWidth={1.75} {...props} />;
}
