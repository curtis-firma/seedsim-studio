import type { ExplainLine } from "./types";

export function explain(lines: ExplainLine[], step: string, detail: string) {
  lines.push({ step, detail });
}
