import type { ChildContext } from "../types/session.js";

export interface ProfileRepository {
  getChildContext(childId: string): Promise<ChildContext>;
}

export class InMemoryProfileRepository implements ProfileRepository {
  async getChildContext(childId: string): Promise<ChildContext> {
    return {
      childId,
      currentSpeakingLevel: 2,
      focusAreas: ["full sentences"],
      encouragementStyle: "gentle"
    };
  }
}
