import type {
  ChildContext,
  TopicContext,
  TurnRequest,
  TurnStrategy
} from "../types/session.js";

export function buildPromptPayload(
  request: TurnRequest,
  strategy: TurnStrategy,
  childContext: ChildContext,
  topicContext: TopicContext
) {
  const fallbackReplyText = buildFallbackReplyText(
    request,
    strategy,
    childContext,
    topicContext
  );

  return {
    topicId: request.topicId,
    replyMode: strategy.replyMode,
    fallbackReplyText,
    childLevel: childContext.currentSpeakingLevel
  };
}

function buildFallbackReplyText(
  request: TurnRequest,
  strategy: TurnStrategy,
  childContext: ChildContext,
  topicContext: TopicContext
): string {
  const utterance = request.childUtteranceText.trim();
  const lowerText = utterance.toLowerCase();
  const containsChinese = /[\u4e00-\u9fff]/.test(utterance);
  const wordCount = utterance.split(/\s+/).filter(Boolean).length;
  const encouragingLead = childContext.encouragementStyle === "lively" ? "Awesome!" : "Good job!";
  const familyMembers = [
    "mother",
    "mom",
    "mum",
    "father",
    "dad",
    "sister",
    "brother",
    "grandma",
    "grandmother",
    "grandpa",
    "grandfather"
  ];
  const mentionedFamilyMember = familyMembers.find((member) => lowerText.includes(member));
  const mentionsFamilyActivity =
    /\b(play|read|cook|watch|go|eat|sing|dance|walk|talk|study|help)\b/i.test(utterance);
  const mentionsFeeling =
    /\b(happy|fun|nice|kind|busy|great|good|sweet|friendly)\b/i.test(utterance);

  if (containsChinese) {
    return buildChineseBridgeReply(encouragingLead, utterance);
  }

  if (strategy.replyMode === "expand-answer") {
    if (strategy.correctionFocus === "sentence-starter") {
      const starter = topicContext.sentenceStarters[0] ?? "I like ...";
      return `${encouragingLead} Let's make it a full sentence. You can start like this: "${starter}" Now you try.`;
    }

    if (wordCount <= 2) {
      if (strategy.speakingMove === "choice" && topicContext.eitherOrPrompts.length > 0) {
        return `${encouragingLead} Let's choose first. ${topicContext.eitherOrPrompts[0]}`;
      }

      if (mentionedFamilyMember) {
        const article = /^[aeiou]/i.test(mentionedFamilyMember) ? "an" : "a";
        return `${encouragingLead} Let's say a full sentence together: "I have ${article} ${mentionedFamilyMember}." Can you say it?`;
      }

      const starter = topicContext.sentenceStarters[0] ?? "I like ...";
      return `${encouragingLead} Please say one full sentence. You can say, "${starter}"`;
    }
  }

  if (mentionedFamilyMember) {
    if (mentionsFamilyActivity) {
      return `${encouragingLead} That is a nice family activity. Who do you like to do that with in your family?`;
    }

    if (mentionsFeeling) {
      return `${encouragingLead} Nice describing word. What else can you tell me about your ${mentionedFamilyMember}?`;
    }

    return `${encouragingLead} You talked about your ${mentionedFamilyMember}. What does your ${mentionedFamilyMember} like to do?`;
  }

  if (lowerText.includes("i have")) {
    return `${encouragingLead} Can you add one more detail about that person? You can tell me the age, hobby, or what you do together.`;
  }

  if (/\b(he|she)\s+is\b/.test(lowerText)) {
    return `${encouragingLead} Nice describing sentence. Can you tell me one thing you do with your family?`;
  }

  if (request.turnIndex >= 5) {
    const wrapupTarget = topicContext.wrapupTargets[0] ?? "Please say two short connected sentences.";
    return `You are doing well. ${wrapupTarget}`;
  }

  if (strategy.correctionFocus === "add-reason") {
    const reasonStarter = topicContext.sentenceStarters[2] ?? "I like it because ...";
    return `${encouragingLead} Nice answer. Now add a reason. You can say, "${reasonStarter}"`;
  }

  if (strategy.speakingMove === "choice" && topicContext.eitherOrPrompts.length > 0) {
    const choicePrompt =
      topicContext.eitherOrPrompts[request.turnIndex % Math.max(topicContext.eitherOrPrompts.length, 1)] ??
      topicContext.eitherOrPrompts[0];
    return `${encouragingLead} ${choicePrompt}`;
  }

  const followUpQuestion =
    topicContext.followUpQuestions[request.turnIndex % Math.max(topicContext.followUpQuestions.length, 1)] ??
    `Tell me a little more about ${topicContext.title}.`;

  return `${encouragingLead} ${followUpQuestion}`;
}

function buildChineseBridgeReply(encouragingLead: string, utterance: string): string {
  const lowered = utterance.toLowerCase();
  const familyWord = resolveFamilyWord(utterance, lowered);
  const activity = resolveActivityWord(utterance, lowered);
  const feeling = resolveFeelingWord(utterance, lowered);

  if (familyWord && activity) {
    return `${encouragingLead} If you forget a word, Chinese is okay first. In English, you can say: "I like to ${activity} with my ${familyWord}." Can you say it in English?`;
  }

  if (familyWord && feeling) {
    return `${encouragingLead} You can say: "My ${familyWord} is ${feeling}." Now try the whole sentence in English.`;
  }

  if (familyWord) {
    const article = /^[aeiou]/i.test(familyWord) ? "a" : "a";
    if (familyWord === "family") {
      return `${encouragingLead} You can say: "My family is happy." or "I love my family." Can you try one English sentence?`;
    }

    return `${encouragingLead} You can say: "I have ${article} ${familyWord}." or "My ${familyWord} is nice." Can you try the English sentence?`;
  }

  if (activity) {
    return `${encouragingLead} Nice idea. In English, you can say: "I like to ${activity}." Can you say the whole sentence?`;
  }

  return `${encouragingLead} If you forget one word, you can say it in Chinese first. Then we say the whole idea in English together. Can you try one full English sentence?`;
}

function resolveFamilyWord(utterance: string, lowered: string): string | null {
  const mappings: Array<[RegExp, string]> = [
    [/\bmother\b|\bmom\b|\bmum\b|妈妈|妈咪|母亲/u, "mother"],
    [/\bfather\b|\bdad\b|爸爸|父亲/u, "father"],
    [/\bsister\b|姐姐|妹妹/u, "sister"],
    [/\bbrother\b|哥哥|弟弟/u, "brother"],
    [/\bgrandma\b|\bgrandmother\b|奶奶|外婆|姥姥/u, "grandma"],
    [/\bgrandpa\b|\bgrandfather\b|爷爷|外公|姥爷/u, "grandpa"],
    [/\bfamily\b|家人|家庭/u, "family"]
  ];

  for (const [pattern, value] of mappings) {
    if (pattern.test(utterance) || pattern.test(lowered)) {
      return value;
    }
  }

  return null;
}

function resolveActivityWord(utterance: string, lowered: string): string | null {
  const mappings: Array<[RegExp, string]> = [
    [/\bplay football\b|踢足球/u, "play football"],
    [/\bplay basketball\b|打篮球/u, "play basketball"],
    [/\bwatch tv\b|看电视/u, "watch TV"],
    [/\bread\b|看书|读书/u, "read books"],
    [/\bsing\b|唱歌/u, "sing"],
    [/\bdance\b|跳舞/u, "dance"],
    [/\bcook\b|做饭/u, "cook"],
    [/\beat dinner\b|吃饭/u, "eat dinner"],
    [/\bgo to the park\b|去公园/u, "go to the park"]
  ];

  for (const [pattern, value] of mappings) {
    if (pattern.test(utterance) || pattern.test(lowered)) {
      return value;
    }
  }

  return null;
}

function resolveFeelingWord(utterance: string, lowered: string): string | null {
  const mappings: Array<[RegExp, string]> = [
    [/\bkind\b|善良/u, "kind"],
    [/\bhappy\b|开心|快乐/u, "happy"],
    [/\bnice\b|很好|很棒/u, "nice"],
    [/\bfriendly\b|友好/u, "friendly"],
    [/\bbusy\b|忙/u, "busy"]
  ];

  for (const [pattern, value] of mappings) {
    if (pattern.test(utterance) || pattern.test(lowered)) {
      return value;
    }
  }

  return null;
}
