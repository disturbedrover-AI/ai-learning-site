import { FadeIn } from "@/components/motion/FadeIn";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <FadeIn className="pt-16 pb-10 sm:pt-20">
      <p className="text-sm font-medium text-accent">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{description}</p>
    </FadeIn>
  );
}
