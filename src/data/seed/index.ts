import { Guide } from "@/types/guide";
import { githubGuide } from "./github";
import { slackGuide } from "./slack";
import { googleDriveGuide } from "./google-drive";

export const seedGuides: Record<string, Guide> = {
  github: githubGuide,
  slack: slackGuide,
  "google-drive": googleDriveGuide,
};

export const seedGuidesList: Guide[] = [githubGuide, slackGuide, googleDriveGuide];

export function getSeedGuide(slug: string): Guide | undefined {
  return seedGuides[slug];
}
