package com.jiajiaoagent.app.audio

import android.content.Context
import android.content.Intent
import android.speech.tts.TextToSpeech
import java.util.Locale

class TextToSpeechManager(
    context: Context
) {
    private val appContext = context.applicationContext
    private var textToSpeech: TextToSpeech? = null
    private var ready: Boolean = false
    private var pendingText: String? = null
    private var statusMessage: String? = "English voice is not ready yet."

    init {
        textToSpeech = TextToSpeech(appContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                ready = configureEnglishVoice(textToSpeech)
                if (ready) {
                    statusMessage = null
                    pendingText?.let { text ->
                        textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "agent_reply")
                        pendingText = null
                    }
                } else {
                    statusMessage = "English TTS is unavailable. Install or enable an English voice on this phone."
                }
            } else {
                statusMessage = "Text-to-speech initialization failed on this phone."
            }
        }
    }

    fun speak(text: String) {
        if (text.isBlank()) return
        if (!ready) {
            pendingText = text
            return
        }
        textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "agent_reply")
    }

    fun shutdown() {
        textToSpeech?.stop()
        textToSpeech?.shutdown()
        textToSpeech = null
        ready = false
    }

    fun isReady(): Boolean = ready
    fun statusMessage(): String? = statusMessage
    fun buildInstallTtsDataIntent(): Intent = Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA)

    private fun configureEnglishVoice(tts: TextToSpeech?): Boolean {
        if (tts == null) return false

        val preferredLocale = Locale.US
        val localeResult = tts.isLanguageAvailable(preferredLocale)
        val englishVoice = tts.voices?.firstOrNull { candidate ->
            candidate.locale.language == Locale.ENGLISH.language && !candidate.isNetworkConnectionRequired
        }

        when {
            localeResult >= TextToSpeech.LANG_AVAILABLE -> {
                tts.language = preferredLocale
            }
            englishVoice != null -> {
                tts.voice = englishVoice
                tts.language = englishVoice.locale
            }
            else -> return false
        }

        tts.setSpeechRate(0.95f)

        if (englishVoice != null) {
            tts.voice = englishVoice
        }

        return true
    }
}
