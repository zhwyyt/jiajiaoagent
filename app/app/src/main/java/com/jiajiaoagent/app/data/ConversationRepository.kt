package com.jiajiaoagent.app.data

import com.jiajiaoagent.app.BuildConfig
import com.jiajiaoagent.app.network.BackendClient
import com.jiajiaoagent.app.network.StartSessionRequest
import com.jiajiaoagent.app.network.StartSessionResponse
import com.jiajiaoagent.app.network.TurnMessage
import com.jiajiaoagent.app.network.TurnRequest
import com.jiajiaoagent.app.network.TurnResponse

class ConversationRepository(
    private val backendClient: BackendClient = BackendClient(BuildConfig.BACKEND_BASE_URL)
) {
    suspend fun startSession(): StartSessionResponse {
        return backendClient.startSession(
            StartSessionRequest(
                childId = "trial-child-001",
                topicId = "my-family",
                currentLevel = 2
            )
        )
    }

    suspend fun sendTurn(
        sessionId: String,
        turnIndex: Int,
        childText: String,
        recentTurns: List<TurnMessage>
    ): TurnResponse {
        return backendClient.sendTurn(
            TurnRequest(
                sessionId = sessionId,
                topicId = "my-family",
                turnIndex = turnIndex,
                childUtteranceText = childText,
                recentTurns = recentTurns
            )
        )
    }
}
