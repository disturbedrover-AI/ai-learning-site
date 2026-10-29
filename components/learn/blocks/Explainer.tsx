import { explainers } from "@/components/explainers/registry";
import { MousePointerClick } from "lucide-react";
import { Block } from "./Block";

/** <Explainer name="tokenization" /> shows the matching component from components/explainers/registry.ts. */
export async function Explainer({ name }: { name: string }) {
  const load = explainers[name];
  if (!load) {
    throw new Error(
      `No explainer called "${name}". Available: ${Object.keys(explainers).join(", ")}. See components/explainers/registry.ts.`,
    );
  }
  const { default: Component } = await load();
  return (
    <Block label="Interactive" icon={MousePointerClick} hue="accent" look="grid">
      <Component />
    </Block>
  );
}
