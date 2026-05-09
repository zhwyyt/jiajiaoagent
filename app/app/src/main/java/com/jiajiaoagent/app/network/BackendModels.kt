package com.jiajiaoagent.app.network

data class StartSessionRequest(
    val childId: String,
    val topicId: String,
    val currentLevel: Int
)

data class StartSessionResponse(
    val sessionId: String,
    val topicId: String,
    val openingMessage: String,
    val suggestedReplyMode: String
)

data class TurnMessage(
    val speaker: String,
    val text: String
)

data class TurnRequest(
    val sessionId: String,
    val topicId: String,
    val turnIndex: Int,
    val childUtteranceText: String,
    val recentTurns: List<TurnMessage>
)

data class CorrectionPayload(
    val enabled: Boolean,
    val focus: String?,
    val mode: String
)

data class TurnResponse(
    val sessionId: String,
    val agentReplyText: String,
    val shouldPlayTts: Boolean,
    val correction: CorrectionPayload,
    val promptHint: String?,
    val isSessionComplete: Boolean
)
