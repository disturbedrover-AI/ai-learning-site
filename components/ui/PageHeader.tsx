import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <Stagger className="pt-16 pb-10 sm:pt-20">
      <StaggerItem>
        <p className="text-sm font-medium text-accent">{eyebrow}</p>
      </StaggerItem>
      <StaggerItem>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
      </StaggerItem>
      <StaggerItem>
        <p className="mt-4 max-w-2xl text-lg text-muted">{description}</p>
      </StaggerItem>
    </Stagger>
  );
}
