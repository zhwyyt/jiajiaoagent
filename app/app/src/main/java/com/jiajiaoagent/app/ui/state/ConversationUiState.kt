package com.jiajiaoagent.app.ui.state

data class ConversationMessageUi(
    val id: String,
    val speaker: Speaker,
    val text: String
) {
    enum class Speaker {
        AGENT,
        CHILD
    }
}

data class ConversationUiState(
    val topicTitle: String = "My Family",
    val agentMessage: String = "Tap start to begin your speaking session.",
    val promptHint: String? = "Try a full sentence.",
    val messages: List<ConversationMessageUi> = emptyList(),
    val transcript: String = "",
    val draftInput: String = "",
    val isListening: Boolean = false,
    val errorMessage: String? = null,
    val sessionId: String? = null,
    val turnIndex: Int = 0,
    val hasSessionStarted: Boolean = false,
    val isStartingSession: Boolean = false,
    val isSendingTurn: Boolean = false,
    val permissionDenied: Boolean = false
)
