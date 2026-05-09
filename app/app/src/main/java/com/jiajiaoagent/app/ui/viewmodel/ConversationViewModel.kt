package com.jiajiaoagent.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.speech.SpeechRecognizer
import com.jiajiaoagent.app.data.ConversationRepository
import com.jiajiaoagent.app.network.BackendClient
import com.jiajiaoagent.app.network.TurnMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.jiajiaoagent.app.ui.state.ConversationMessageUi
import com.jiajiaoagent.app.ui.state.ConversationUiState

class ConversationViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ConversationUiState())
    val uiState: StateFlow<ConversationUiState> = _uiState.asStateFlow()
    private val repository = ConversationRepository()
    private val recentTurns = mutableListOf<TurnMessage>()

    fun startSession() {
        if (_uiState.value.hasSessionStarted) return

        _uiState.value = _uiState.value.copy(
            isStartingSession = true,
            errorMessage = null,
            permissionDenied = false
        )

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val response = repository.startSession()
                recentTurns.clear()
                recentTurns += TurnMessage("agent", response.openingMessage)
                val openingMessage = buildMessage(
                    speaker = ConversationMessageUi.Speaker.AGENT,
                    text = response.openingMessage
                )
                _uiState.value = _uiState.value.copy(
                    sessionId = response.sessionId,
                    topicTitle = response.topicId.replace("-", " "),
                    agentMessage = response.openingMessage,
                    messages = listOf(openingMessage),
                    hasSessionStarted = true,
                    turnIndex = 0,
                    errorMessage = null,
                    isStartingSession = false
                )
            } catch (error: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = error.message ?: "Failed to start session",
                    isStartingSession = false
                )
            }
        }
    }

    fun onListeningStarted() {
        _uiState.value = _uiState.value.copy(
            isListening = true,
            errorMessage = null
        )
    }

    fun onPartialTranscript(text: String) {
        _uiState.value = _uiState.value.copy(
            transcript = text,
            draftInput = text
        )
    }

    fun onFinalTranscript(text: String) {
        _uiState.value = _uiState.value.copy(
            transcript = text,
            draftInput = text,
            isListening = false,
            errorMessage = null
        )
        submitTurn(text)
    }

    fun onDraftInputChanged(text: String) {
        _uiState.value = _uiState.value.copy(draftInput = text)
    }

    fun onListeningCancelled() {
        _uiState.value = _uiState.value.copy(
            isListening = false,
            errorMessage = "Speech input was canceled. Please try again."
        )
    }

    fun submitTypedInput() {
        val text = _uiState.value.draftInput.trim()
        if (text.isBlank()) return

        _uiState.value = _uiState.value.copy(
            transcript = text,
            isListening = false,
            errorMessage = null
        )
        submitTurn(text)
    }

    fun onListeningError(errorCode: Int) {
        val message = when (errorCode) {
            -1 -> "Microphone permission is required."
            SpeechRecognizer.ERROR_AUDIO -> "Microphone audio error. Please try again."
            SpeechRecognizer.ERROR_CLIENT -> "Speech input stopped. Tap Start Speaking and try again."
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission is required."
            SpeechRecognizer.ERROR_NETWORK,
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Speech service network error. Please try again."
            SpeechRecognizer.ERROR_NO_MATCH -> "I didn't catch that. Please say one short English sentence."
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Speech recognizer is busy. Please wait a moment and try again."
            SpeechRecognizer.ERROR_SERVER -> "Speech service is temporarily unavailable."
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech detected. Please try again."
            else -> "Speech recognition error: $errorCode"
        }
        _uiState.value = _uiState.value.copy(
            isListening = false,
            errorMessage = message,
            permissionDenied = errorCode == -1 || errorCode == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS
        )
    }

    private fun submitTurn(text: String) {
        val sessionId = _uiState.value.sessionId ?: return
        val nextTurnIndex = _uiState.value.turnIndex + 1
        recentTurns += TurnMessage("child", text)
        val childMessage = buildMessage(
            speaker = ConversationMessageUi.Speaker.CHILD,
            text = text
        )
        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages + childMessage,
            isSendingTurn = true,
            errorMessage = null
        )

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val response = repository.sendTurn(
                    sessionId = sessionId,
                    turnIndex = nextTurnIndex,
                    childText = text,
                    recentTurns = recentTurns.toList()
                )
                recentTurns += TurnMessage("agent", response.agentReplyText)
                val agentMessage = buildMessage(
                    speaker = ConversationMessageUi.Speaker.AGENT,
                    text = response.agentReplyText
                )
                _uiState.value = _uiState.value.copy(
                    agentMessage = response.agentReplyText,
                    promptHint = response.promptHint,
                    messages = _uiState.value.messages + agentMessage,
                    turnIndex = nextTurnIndex,
                    errorMessage = null,
                    isSendingTurn = false,
                    draftInput = ""
                )
            } catch (error: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = error.message ?: "Failed to send turn",
                    isSendingTurn = false
                )
            }
        }
    }

    private fun buildMessage(
        speaker: ConversationMessageUi.Speaker,
        text: String
    ): ConversationMessageUi {
        return ConversationMessageUi(
            id = "${speaker.name.lowercase()}-${System.currentTimeMillis()}-${text.hashCode()}",
            speaker = speaker,
            text = text
        )
    }
}
