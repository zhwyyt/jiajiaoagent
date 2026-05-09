package com.jiajiaoagent.app.ui.screens

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.jiajiaoagent.app.audio.SpeechRecognizerManager
import com.jiajiaoagent.app.audio.TextToSpeechManager
import com.jiajiaoagent.app.ui.state.ConversationMessageUi
import com.jiajiaoagent.app.ui.viewmodel.ConversationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConversationScreen(
    viewModel: ConversationViewModel = viewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val speechRecognizerManager = remember { SpeechRecognizerManager(context) }
    val ttsManager = remember { TextToSpeechManager(context) }
    val listState = rememberLazyListState()
    val speechInputLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val spokenText = result.data
            ?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            ?.firstOrNull()
            .orEmpty()

        if (spokenText.isNotBlank()) {
            viewModel.onFinalTranscript(spokenText)
        } else {
            viewModel.onListeningCancelled()
        }
    }
    val launchSpeechInput: () -> Unit = {
        if (!speechRecognizerManager.isRecognitionAvailable()) {
            viewModel.onListeningError(SpeechRecognizer.ERROR_CLIENT)
        } else {
            viewModel.onListeningStarted()
            speechInputLauncher.launch(speechRecognizerManager.buildIntent())
        }
    }
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            launchSpeechInput()
        } else {
            viewModel.onListeningError(-1)
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            ttsManager.shutdown()
        }
    }

    LaunchedEffect(uiState.agentMessage) {
        ttsManager.speak(uiState.agentMessage)
    }

    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.lastIndex)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Conversation") })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Topic", style = MaterialTheme.typography.labelLarge)
                    Text(uiState.topicTitle, style = MaterialTheme.typography.headlineSmall)
                }
            }
            Button(
                onClick = { viewModel.startSession() },
                modifier = Modifier.fillMaxWidth(),
                enabled = !uiState.hasSessionStarted && !uiState.isStartingSession
            ) {
                Text(
                    when {
                        uiState.hasSessionStarted -> "Session Started"
                        uiState.isStartingSession -> "Starting..."
                        else -> "Start Session"
                    }
                )
            }
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("Chat", style = MaterialTheme.typography.labelLarge)
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f, fill = true),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        if (uiState.messages.isEmpty()) {
                            item {
                                Text(
                                    text = "Start a session and the tutor will begin the conversation.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        items(uiState.messages, key = { it.id }) { message ->
                            ConversationBubble(message = message)
                        }

                        if (uiState.isSendingTurn) {
                            item {
                                Box(modifier = Modifier.fillMaxWidth()) {
                                    CircularProgressIndicator(
                                        modifier = Modifier
                                            .align(Alignment.CenterStart)
                                            .padding(top = 4.dp)
                                    )
                                }
                            }
                        }
                    }

                    uiState.promptHint?.let { hint ->
                        AssistChip(
                            onClick = { },
                            label = { Text(hint) }
                        )
                    }
                    if (uiState.messages.isNotEmpty()) {
                        Button(
                            onClick = { ttsManager.speak(uiState.agentMessage) },
                            enabled = uiState.agentMessage.isNotBlank(),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(if (ttsManager.isReady()) "Replay Tutor Voice" else "Retry Tutor Voice")
                        }
                    }
                    if (!ttsManager.isReady()) {
                        ttsManager.statusMessage()?.let { status ->
                            Text(
                                text = status,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Button(
                            onClick = {
                                try {
                                    context.startActivity(ttsManager.buildInstallTtsDataIntent())
                                } catch (_: Exception) {
                                    context.startActivity(Intent(Settings.ACTION_SETTINGS))
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Install English Voice")
                        }
                    }
                }
            }
            uiState.errorMessage?.let { error ->
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            if (uiState.permissionDenied) {
                Button(
                    onClick = {
                        val intent = Intent(
                            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.fromParts("package", context.packageName, null)
                        )
                        context.startActivity(intent)
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Open App Settings")
                }
            }
            OutlinedTextField(
                value = uiState.draftInput,
                onValueChange = { viewModel.onDraftInputChanged(it) },
                modifier = Modifier.fillMaxWidth(),
                enabled = uiState.hasSessionStarted && !uiState.isSendingTurn,
                label = { Text("Type if microphone is unavailable") }
            )
            Button(
                onClick = { viewModel.submitTypedInput() },
                modifier = Modifier.fillMaxWidth(),
                enabled = uiState.hasSessionStarted && !uiState.isSendingTurn && uiState.draftInput.isNotBlank()
            ) {
                Text("Send Text")
            }
            Button(
                onClick = {
                    val permissionGranted = ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.RECORD_AUDIO
                    ) == PackageManager.PERMISSION_GRANTED

                    if (!permissionGranted) {
                        permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                        return@Button
                    }

                    if (!uiState.hasSessionStarted || uiState.isSendingTurn) {
                        return@Button
                    }

                    launchSpeechInput()
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = uiState.hasSessionStarted && !uiState.isSendingTurn
            ) {
                Text(if (uiState.isListening) "Listening..." else "Start Speaking")
            }
        }
    }
}

@Composable
private fun ConversationBubble(message: ConversationMessageUi) {
    val isAgent = message.speaker == ConversationMessageUi.Speaker.AGENT
    val bubbleColors = if (isAgent) {
        CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    } else {
        CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        )
    }

    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = if (isAgent) Alignment.CenterStart else Alignment.CenterEnd
    ) {
        Card(
            modifier = Modifier.widthIn(max = 280.dp),
            colors = bubbleColors,
            shape = RoundedCornerShape(8.dp)
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = if (isAgent) "Tutor" else "You",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(text = message.text, style = MaterialTheme.typography.bodyLarge)
            }
        }
    }
}
