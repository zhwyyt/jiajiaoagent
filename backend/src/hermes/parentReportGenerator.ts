import type {
  LearnerProfile,
  LearningPlan,
  LearningSnapshot,
  ParentReport,
  SessionSummary
} from "../types/session.js";

export function buildParentReport(params: {
  childId: string;
  learnerProfile: LearnerProfile;
  learningPlan: LearningPlan;
  learningSnapshot: LearningSnapshot;
  recentSummaries: SessionSummary[];
}): ParentReport {
  const { childId, learnerProfile, learningPlan, learningSnapshot, recentSummaries } = params;

  return {
    childId,
    generatedAt: new Date().toISOString(),
    basedOnSessionIds: recentSummaries.slice(0, 3).map((summary) => summary.sessionId),
    currentFocus: buildCurrentFocus(learningPlan, learnerProfile),
    recentStrengths: buildRecentStrengths(learnerProfile, recentSummaries),
    currentBottleneck: buildCurrentBottleneck(learningSnapshot),
    childSnapshot: buildChildSnapshot(learnerProfile),
    nextSmallGoal: buildNextSmallGoal(learningPlan, learnerProfile),
    parentSupportSuggestions: buildParentSupportSuggestions(learningPlan, learnerProfile)
  };
}

export function formatParentReportText(report: ParentReport): string {
  const sessionCount = Math.max(report.basedOnSessionIds.length, 1);
  const lines = [
    `家长报告（最近${sessionCount}次对话）`,
    `1. 当前重点：${report.currentFocus}`,
    `2. 最近亮点：${report.recentStrengths.join("；") || "暂时还在积累更多样本。"}`,
    `3. 当前卡点：${report.currentBottleneck ?? "目前没有特别突出的卡点，建议继续观察。"}`,
    `4. 孩子画像：${report.childSnapshot}`,
    `5. 下一步小目标：${report.nextSmallGoal}`,
    `6. 家长可这样配合：${report.parentSupportSuggestions.join("；") || "先保持轻松聊天，不急着纠错。"}`
  ];
  return lines.join("\n");
}

function buildCurrentFocus(
  learningPlan: LearningPlan,
  learnerProfile: LearnerProfile
): string {
  const primaryFocus = learningPlan.weeklyFocus[0] ?? learnerProfile.currentStage.mainGrowthTarget;
  return toParentReadableFocus(primaryFocus, learnerProfile.currentStage.mainGrowthTarget);
}

function buildRecentStrengths(
  learnerProfile: LearnerProfile,
  recentSummaries: SessionSummary[]
): string[] {
  const strengths = learnerProfile.recentSignals.recentStrengths.map(toChineseRecentStrength);
  const mainStrengths = recentSummaries
    .map((summary) => summary.mainStrength)
    .filter(Boolean)
    .map((strength) => describeSummaryStrength(strength!));

  return Array.from(new Set([...strengths, ...mainStrengths])).slice(0, 3);
}

function toChineseRecentStrength(value: string): string {
  const lower = value.toLowerCase();
  if (lower.includes("willing to keep interacting")) {
    return "愿意继续互动";
  }
  if (lower.includes("accepts another try")) {
    return "愿意再试一次";
  }
  if (lower.includes("fuller sentences")) {
    return "开始能说出更完整的句子";
  }
  if (lower.includes("extra detail")) {
    return "开始会多补一点信息";
  }
  if (lower.includes("simple reasons")) {
    return "开始能表达简单理由";
  }
  if (lower.includes("either-or support")) {
    return "对轻量选择式引导反应不错";
  }
  if (lower.includes("family topic")) {
    return "在家庭类熟悉话题上更自然";
  }
  if (lower.includes("food topic")) {
    return "在食物类熟悉话题上更自然";
  }
  return value;
}

function buildCurrentBottleneck(learningSnapshot: LearningSnapshot): string | null {
  const bottleneck = learningSnapshot.topBottlenecks[0] ?? null;
  if (!bottleneck) {
    return null;
  }

  switch (bottleneck) {
    case "afraid_to_speak":
      return "一旦表达开始变难，孩子的信心还会明显往下掉。";
    case "output_too_short":
      return "回答还比较容易停在短句，暂时还不够自然展开。";
    case "needs_sentence_starter":
      return "孩子经常还需要一点起句帮助，才能顺利说出完整句。";
    case "needs_cn_bridge":
      return "孩子目前仍然比较依赖中文搭桥，再把意思转成英文。";
    case "cannot_extend_answer":
      return "第一句通常能说出来，但再多补一个小细节还比较难。";
    case "weak_reason_expression":
      return "简单的 why / because 类表达还不够稳定。";
    case "low_retry_willingness":
      return "如果第一下没说出来，孩子再次尝试的意愿还偏弱。";
  }
}

function buildChildSnapshot(learnerProfile: LearnerProfile): string {
  const willingnessText =
    learnerProfile.stableTraits.openingWillingness === "high"
      ? "孩子愿意主动互动，也比较容易进入聊天"
      : learnerProfile.stableTraits.openingWillingness === "medium"
        ? "孩子通常能被带进对话"
        : "孩子目前还需要更多帮助才能顺利开口";
  const pressureText =
    learnerProfile.stableTraits.pressureSensitivity === "high"
      ? "但一旦说话像任务，状态就容易紧起来"
      : learnerProfile.stableTraits.pressureSensitivity === "medium"
        ? "不过当表达压力变大时，稳定度还是会下降"
        : "整体上在说话时已经比较能保持稳定";
  const entryText =
    learnerProfile.stableTraits.preferredEntryStyle === "free-chat-first"
      ? "更适合先从轻松闲聊进入，再慢慢带到训练。"
      : learnerProfile.stableTraits.preferredEntryStyle === "mixed"
        ? "更适合先自然接话，再轻轻往表达训练上带。"
        : "已经开始能接受更直接一点的练习式引导。";
  return `${willingnessText}，${pressureText} ${entryText}`;
}

function buildNextSmallGoal(
  learningPlan: LearningPlan,
  learnerProfile: LearnerProfile
): string {
  const sessionGoal = learningPlan.sessionGoal?.trim();
  if (sessionGoal) {
    return toParentReadableGoal(sessionGoal);
  }

  const growthTarget = learnerProfile.currentStage.mainGrowthTarget.trim();
  return capitalizeFirst(growthTarget) + ".";
}

function buildParentSupportSuggestions(
  learningPlan: LearningPlan,
  learnerProfile: LearnerProfile
): string[] {
  const suggestions: string[] = [];
  if (learningPlan.parentFacingNoteSeed.suggestedParentSupport) {
    suggestions.push(toParentReadableSuggestion(learningPlan.parentFacingNoteSeed.suggestedParentSupport));
  }

  if (learnerProfile.stableTraits.pressureSensitivity === "high") {
    suggestions.push("先把语气放轻松，不要太早进入纠错。");
  }

  if (learnerProfile.stableTraits.cnSupportNeed !== "rare") {
    suggestions.push("如果孩子卡住，可以先允许用中文说出意思，再一起转成一句简短英文。");
  }

  if (learnerProfile.stableTraits.preferredEntryStyle === "free-chat-first") {
    suggestions.push("可以先随口聊两句，再慢慢引到更完整的表达。");
  }

  return Array.from(new Set(suggestions)).slice(0, 2);
}

function toParentReadableFocus(primaryFocus: string, growthTarget: string): string {
  const normalized = primaryFocus.toLowerCase();
  if (normalized.includes("full sentence")) {
    return "最近主要在练：把短回答慢慢带成更完整的句子。";
  }
  if (normalized.includes("detail")) {
    return "最近主要在练：回答完第一句后，再多补一个小细节。";
  }
  if (normalized.includes("because") || normalized.includes("reason")) {
    return "最近主要在练：表达自己的想法后，再补一个简单理由。";
  }
  if (normalized.includes("pressure low") || normalized.includes("keep speaking")) {
    return "最近主要在练：先把开口这件事变得更轻松，让孩子愿意继续说。";
  }
  return `最近主要在练：${toChineseGrowthTarget(growthTarget)}`;
}

function describeSummaryStrength(strength: SessionSummary["mainStrength"]): string {
  switch (strength) {
    case "willing_to_speak":
      return "愿意继续互动";
    case "accepts_retry":
      return "通常愿意再试一次";
    case "can_answer_in_full_sentence":
      return "开始能说出更完整的句子";
    case "can_add_detail":
      return "开始会主动多补一点信息";
    case "can_give_simple_reason":
      return "开始能说出简单理由";
    case "responds_well_to_choice_prompt":
      return "对二选一式的轻引导反应不错";
    case "likes_topic_family":
      return "在熟悉的家庭话题上更放松";
    case "likes_topic_food":
      return "在熟悉的食物话题上更放松";
    default:
      return "最近表现出了一些积极的表达信号";
  }
}

function toParentReadableGoal(sessionGoal: string): string {
  const lower = sessionGoal.toLowerCase();
  if (lower.includes("fuller sentences")) {
    return "下一步想帮助孩子把一句话说得更完整一些。";
  }
  if (lower.includes("one more small detail")) {
    return "下一步想帮助孩子在回答后，再自然补一个小细节。";
  }
  if (lower.includes("because sentence")) {
    return "下一步想帮助孩子在合适的时候说出一个简短理由。";
  }
  if (lower.includes("easy questions")) {
    return "下一步想帮助孩子在轻松状态下，更顺地接住几个简单问题。";
  }
  if (lower.includes("carry a little more of the conversation")) {
    return "下一步想帮助孩子自己多承担一点对话。";
  }
  return `${toChineseGrowthTarget(stripTrailingPeriod(sessionGoal))}`;
}

function toParentReadableSuggestion(value: string): string {
  const lower = value.toLowerCase();
  if (lower.includes("do not rush to correct")) {
    return "先让孩子慢慢说完，不要急着纠错。";
  }
  if (lower.includes("whole sentence")) {
    return "可以鼓励孩子把一个词慢慢说成一句完整的话。";
  }
  if (lower.includes("one more small detail")) {
    return "孩子说完后，只追问一个很小的细节就够了。";
  }
  if (lower.includes("because sentence")) {
    return "可以轻轻追问一句“为什么”，但一次只追一个理由。";
  }
  if (lower.includes("try alone first")) {
    return "孩子开口前可以稍微等一等，让他先自己试一下。";
  }
  return value;
}

function toChineseGrowthTarget(value: string): string {
  const lower = value.toLowerCase();
  if (lower.includes("short replies") || lower.includes("fuller sentences")) {
    return "把短回答慢慢带成更完整的句子。";
  }
  if (lower.includes("one more small detail")) {
    return "在第一句之后，再自然补一个小细节。";
  }
  if (lower.includes("because sentence") || lower.includes("reason")) {
    return "在表达想法后，再补一个简单理由。";
  }
  if (lower.includes("low pressure") || lower.includes("willing to answer")) {
    return "先稳住开口意愿，让孩子在低压力下继续说。";
  }
  if (lower.includes("carry a little more of the conversation")) {
    return "让孩子自己多承担一点对话。";
  }
  if (lower.includes("chinese bridge")) {
    return "先用中文搭桥，再把意思转成简短英文。";
  }
  return `${stripTrailingPeriod(value)}。`;
}

function stripTrailingPeriod(value: string): string {
  return value.trim().replace(/[.。]+$/, "");
}

function capitalizeFirst(value: string): string {
  if (!value) {
    return value;
  }
  return value[0].toUpperCase() + value.slice(1);
}
