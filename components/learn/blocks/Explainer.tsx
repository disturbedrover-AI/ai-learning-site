import { explainers } from "@/components/explainers/registry";
import { Block, Icon } from "./Block";

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
    <Block label="Interactive" icon={<Icon d="M5 3l14 9-14 9V3z" />}>
      <Component />
    </Block>
  );
}
