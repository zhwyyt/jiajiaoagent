# API and Data Shapes

## Project

小学生英语口语陪练 Agent（Android MVP）

## Goal

本文件定义 MVP 阶段的核心数据形状，供 Android 客户端与 Agent 服务在实现前对齐。

## 1. Topic

```json
{
  "id": "my-family",
  "title": "My Family",
  "targetLevelMin": 1,
  "targetLevelMax": 3,
  "goals": [
    "Introduce family members",
    "Use he and she correctly",
    "Answer with full sentences"
  ],
  "keyVocabulary": ["mother", "father", "sister", "brother"],
  "keyPatterns": [
    "This is my ...",
    "He is ...",
    "She is ..."
  ],
  "starterQuestions": [
    "Who is in your family?",
    "Do you have a brother or sister?"
  ],
  "followUpQuestions": [
    "What does your mother do?",
    "Who do you play with at home?"
  ],
  "commonMistakes": [
    "he/she confusion",
    "single-word answers"
  ],
  "completionSignals": [
    "child names at least two family members",
    "child answers one follow-up question"
  ]
}
```

## 2. Session Start Request

```json
{
  "childId": "trial-child-001",
  "topicId": "my-family",
  "currentLevel": 2
}
```

## 3. Conversation Turn Request

```json
{
  "sessionId": "sess_001",
  "topicId": "my-family",
  "turnIndex": 3,
  "childUtteranceText": "I have one sister",
  "recentTurns": [
    {
      "speaker": "agent",
      "text": "Do you have a brother or sister?"
    },
    {
      "speaker": "child",
      "text": "I have one sister"
    }
  ]
}
```

## 4. Conversation Turn Response

```json
{
  "sessionId": "sess_001",
  "agentReplyText": "Good job. You can also say: I have one sister. What is her name?",
  "shouldPlayTts": true,
  "correction": {
    "enabled": false,
    "focus": null,
    "mode": "none"
  },
  "promptHint": null,
  "isSessionComplete": false
}
```

## 5. Session Summary

```json
{
  "sessionId": "sess_001",
  "childId": "trial-child-001",
  "topicId": "my-family",
  "turnCount": 8,
  "childUtteranceCount": 4,
  "averageResponseLength": 4.5,
  "highlightedCorrections": [
    "Use full sentence instead of single-word answer"
  ],
  "strengths": [
    "Answered independently",
    "Used family words correctly"
  ],
  "focusAreas": [
    "Longer answers",
    "he/she distinction"
  ],
  "topicCompleted": true,
  "nextPracticeHints": [
    "Use three full sentences about family",
    "Practice He is / She is"
  ]
}
```

## 6. Growth Profile

```json
{
  "childId": "trial-child-001",
  "currentSpeakingLevel": 2,
  "recentTopics": ["greetings", "my-family"],
  "strengths": [
    "Willing to answer",
    "Can use simple family words"
  ],
  "commonMistakes": [
    "short answers",
    "he/she confusion"
  ],
  "responseLengthTrend": "stable",
  "practiceFrequencyLast7Days": 3,
  "currentFocusAreas": [
    "full sentences",
    "simple follow-up answers"
  ],
  "latestPlanSummary": "Practice full-sentence family answers this week"
}
```

## 7. Training Plan

```json
{
  "planId": "plan_001",
  "childId": "trial-child-001",
  "periodType": "weekly",
  "goals": [
    "Use full sentences",
    "Practice family topic",
    "Answer one why question"
  ],
  "focusTopics": ["my-family"],
  "focusSentencePatterns": [
    "This is my ...",
    "He is ...",
    "She is ..."
  ],
  "practiceSuggestions": [
    "Practice for 8 minutes each day",
    "Say three sentences about your family",
    "Repeat one corrected sentence each session"
  ],
  "encouragementNote": "You are getting better at speaking by yourself."
}
```

## 8. Implementation Note

These shapes are intentionally simple and may evolve during implementation, but Android and backend should align to these structures before building conversation endpoints.
