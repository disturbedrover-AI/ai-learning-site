/**
 * EXPLAINERS
 * ----------
 * Small interactive, animated components that lessons can show with
 *   <Explainer name="tokenization" />
 *
 * To add one:
 *   1. Create a file in this folder (e.g. Embeddings.tsx) that starts with
 *      "use client" and has a default export.
 *   2. Add one line below: the name lessons use, and the file to load.
 */
type ExplainerModule = Promise<{ default: React.ComponentType }>;

export const explainers: Record<string, () => ExplainerModule> = {
  tokenization: () => import("./Tokenization"),
};
