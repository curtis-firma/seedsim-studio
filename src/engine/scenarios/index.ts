import { kickstartProof } from "./kickstartProof";
import { conservative } from "./conservative";
import { aggressive } from "./aggressive";

export const scenarios = {
  "Kickstart / Proof": kickstartProof,
  Conservative: conservative,
  Aggressive: aggressive,
} as const;

export type ScenarioName = keyof typeof scenarios;
