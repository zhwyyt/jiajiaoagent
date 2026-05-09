import type { ChildContext } from "../types/session.js";

export function loadChildContext(childId: string): ChildContext {
  return {
    childId,
    currentSpeakingLevel: 2,
    focusAreas: ["full sentences"],
    encouragementStyle: "gentle"
  };
}
