import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <Stagger className="pt-16 pb-12 sm:pt-24 sm:pb-16">
      <StaggerItem>
        <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">{eyebrow}</p>
      </StaggerItem>
      <StaggerItem>
        <h1 className="mt-3 max-w-3xl text-5xl leading-[1.02] font-bold text-foreground sm:text-6xl">{title}</h1>
      </StaggerItem>
      <StaggerItem>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>
      </StaggerItem>
    </Stagger>
  );
}
