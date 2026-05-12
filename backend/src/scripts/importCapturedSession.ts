import { randomUUID } from "node:crypto";
import { buildLearningPlan } from "../hermes/learningPlanner.js";
import { updateLearningMemoryFromTurn } from "../hermes/memoryUpdateEngine.js";
import {
  buildParentReport,
  formatParentReportText
} from "../hermes/parentReportGenerator.js";
import { evaluateProgress } from "../hermes/progressEvaluator.js";
import { evaluateResponse } from "../hermes/responseEvaluator.js";
import { buildSessionWrapup } from "../hermes/sessionWrapupEngine.js";
import { decideTurnStrategy } from "../hermes/turnStrategyEngine.js";
import { getPostgresPool } from "../storage/postgres/client.js";
import { PostgresLearningMemoryRepository } from "../storage/postgres/learningMemoryRepository.js";
import { PostgresSessionRepository } from "../storage/postgres/sessionRepository.js";
import { getTopicContextById } from "../storage/topicPack.js";
import type { TurnMessage, TurnRequest, TurnResponse } from "../types/session.js";

const CHILD_ID = "qq-497210274-20260512-0900";
const TOPIC_ID = "my-family";

const capturedSessions = [
  {
    sourceSessionId: "35d2b815-cfa7-4765-a54c-7a1d34b0807c",
    startedAt: "2026-05-12T01:00:07.275Z",
    endedAt: "2026-05-12T01:01:06.236Z",
    turns: [
      {
        childText: "hei，are you girl or boy?",
        agentReplyText:
          "I’m like your English friend here. You can call me a girl if you want. Are you a boy or a girl?"
      },
      {
        childText: "i am boy",
        agentReplyText:
          "You used a full sentence today. Great speaking today. Next time, try one full sentence like \"My brother likes football.\""
      }
    ]
  },
  {
    sourceSessionId: "ee3dad90-478a-4684-9f08-d5b2589ff83a",
    startedAt: "2026-05-12T01:02:42.752Z",
    endedAt: "2026-05-12T01:08:12.347Z",
    turns: [
      {
        childText: "有点听不懂，sentence什么意思",
        agentReplyText:
          "No problem. “Sentence” means “句子”. For example, “I love my family.” is a sentence. 你可以先说中文，我帮你变成英文。."
      },
      {
        childText: "OK。i know.我今天很happy.my father 送了我一个礼物",
        agentReplyText:
          "That’s great! You can say, “I am very happy today. My father gave me a gift.” What gift was it? 你可以说：我今天很开心。我爸爸送了我一个礼物。."
      },
      {
        childText: "一架无人机，i like it",
        agentReplyText:
          "Wow, a drone! You can say, “It is a drone. I like it very much.” Do you play with the drone with your father? 你可以说：这是一个无人机，我非常喜欢它。."
      },
      {
        childText: "我们还在研究怎么让它飞起来",
        agentReplyText:
          "That sounds fun. You can say, “We are still learning how to make it fly.” 你也可以说：我们还在学怎么让它飞起来。 Will you try again with your father?"
      },
      {
        childText: "yes，but i 想学一下English",
        agentReplyText:
          "Yes, of course. You can say, “I am learning to fly the drone with my father.” 你可以说：我正在和爸爸学习放飞无人机。."
      },
      {
        childText: "跟你聊的很高兴，我学了几个新句子",
        agentReplyText:
          "Me too. You did very well today. Can you say one sentence about you and your father and the drone? 你可以说一句关于你和爸爸还有无人机的话吗？."
      }
    ]
  }
] as const;

async function run(): Promise<void> {
  const pool = getPostgresPool();
  const learningMemoryRepository = new PostgresLearningMemoryRepository(pool);
  const sessionRepository = new PostgresSessionRepository(pool);
  const topicContext = getTopicContextById(TOPIC_ID);

  await ensureChildExists(pool);
  await clearImportedChildData(pool);
  const importedSessionIds: string[] = [];

  for (const capturedSession of capturedSessions) {
    const sessionId = randomUUID();
    importedSessionIds.push(sessionId);
    await sessionRepository.createSession({
      sessionId,
      childId: CHILD_ID,
      topicId: TOPIC_ID
    });

    const recentTurns: TurnMessage[] = [];
    let lastRequest: TurnRequest | null = null;

    for (let index = 0; index < capturedSession.turns.length; index += 1) {
      const turnData = capturedSession.turns[index];
      const recentSummaries = await learningMemoryRepository.listRecentSessionSummaries(CHILD_ID, 5);
      const snapshot = await learningMemoryRepository.getLearningSnapshot(CHILD_ID);
      const learnerProfile = await learningMemoryRepository.getLearnerProfile(CHILD_ID);
      const evaluatorResult = evaluateProgress({
        snapshot,
        recentSummaries
      });
      const learningPlan = buildLearningPlan({
        snapshot,
        learnerProfile,
        evaluatorResult,
        recentSummaries,
        topicContext
      });
      const request: TurnRequest = {
        sessionId,
        topicId: TOPIC_ID,
        turnIndex: index,
        childUtteranceText: turnData.childText,
        recentTurns: [...recentTurns]
      };
      const strategy = decideTurnStrategy(request, topicContext, learningPlan, learnerProfile);
      const evaluated = evaluateResponse(turnData.agentReplyText);
      const response: TurnResponse = {
        sessionId,
        agentReplyText: evaluated.agentReplyText,
        shouldPlayTts: false,
        source: "fallback",
        correction: {
          enabled: evaluated.correctionEnabled,
          focus: evaluated.correctionFocus,
          mode: evaluated.correctionEnabled ? "gentle" : "none"
        },
        promptHint: evaluated.promptHint ?? strategy.promptHint,
        isSessionComplete: false
      };

      await updateLearningMemoryFromTurn({
        repository: learningMemoryRepository,
        childId: CHILD_ID,
        request,
        response,
        strategy,
        topicContext,
        sessionGoal: learningPlan.sessionGoal
      });

      recentTurns.push({ speaker: "child", text: turnData.childText });
      recentTurns.push({ speaker: "agent", text: response.agentReplyText });
      lastRequest = request;
    }

    if (!lastRequest) {
      throw new Error(`No captured turns to import for source session ${capturedSession.sourceSessionId}.`);
    }

    const wrapup = buildSessionWrapup(sessionId, lastRequest, topicContext);
    await sessionRepository.completeSession(wrapup);

    await pool.query(
      `
      UPDATE sessions
      SET
        started_at = $2,
        ended_at = $3,
        created_at = $2,
        updated_at = $3,
        turn_count = $4,
        child_utterance_count = $4,
        average_response_length = $5
      WHERE id = $1
      `,
      [
        sessionId,
        capturedSession.startedAt,
        capturedSession.endedAt,
        capturedSession.turns.length,
        computeAverageWordCount(capturedSession.turns.map((turn) => turn.childText))
      ]
    );

    await pool.query(
      `
      UPDATE learning_session_summaries
      SET
        ended_at = $2,
        summary_json = jsonb_set(
          jsonb_set(summary_json, '{startedAt}', to_jsonb($3::text), true),
          '{endedAt}',
          to_jsonb($4::text),
          true
        ),
        created_at = $3::timestamptz,
        updated_at = $4::timestamptz
      WHERE session_id = $1
      `,
      [sessionId, capturedSession.endedAt, capturedSession.startedAt, capturedSession.endedAt]
    );
  }

  const recentSummaries = await learningMemoryRepository.listRecentSessionSummaries(CHILD_ID, 3);
  const snapshot = await learningMemoryRepository.getLearningSnapshot(CHILD_ID);
  const learnerProfile = await learningMemoryRepository.getLearnerProfile(CHILD_ID);

  if (!snapshot || !learnerProfile) {
    throw new Error("Snapshot or learner profile missing after import.");
  }

  const evaluatorResult = evaluateProgress({
    snapshot,
    recentSummaries
  });
  const learningPlan = buildLearningPlan({
    snapshot,
    learnerProfile,
    evaluatorResult,
    recentSummaries,
    topicContext
  });
  const report = buildParentReport({
    childId: CHILD_ID,
    learnerProfile,
    learningPlan,
    learningSnapshot: snapshot,
    recentSummaries
  });

  console.log(
    JSON.stringify(
      {
        importedSessionIds,
        sourceSessionIds: capturedSessions.map((session) => session.sourceSessionId),
        importedTurns: capturedSessions.reduce((sum, session) => sum + session.turns.length, 0),
        basedOnSessionIds: report.basedOnSessionIds,
        parentReportText: formatParentReportText(report)
      },
      null,
      2
    )
  );

  await pool.end();
}

async function ensureChildExists(
  pool: ReturnType<typeof getPostgresPool>
): Promise<void> {
  await pool.query(
    `
    INSERT INTO children (
      id,
      display_name,
      grade,
      english_level,
      confidence_level,
      chinese_support_level,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    ON CONFLICT (id)
    DO NOTHING
    `,
    [CHILD_ID, "QQ Imported 2026-05-12 09:00", 3, 2, "medium", "medium"]
  );
}

async function clearImportedChildData(
  pool: ReturnType<typeof getPostgresPool>
): Promise<void> {
  await pool.query(`DELETE FROM learner_profiles WHERE child_id = $1`, [CHILD_ID]);
  await pool.query(`DELETE FROM learning_snapshots WHERE child_id = $1`, [CHILD_ID]);
  await pool.query(`DELETE FROM sessions WHERE child_id = $1`, [CHILD_ID]);
}

function computeAverageWordCount(values: readonly string[]): number {
  const total = values.reduce((sum, value) => {
    return sum + value.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  return Number((total / Math.max(values.length, 1)).toFixed(2));
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
