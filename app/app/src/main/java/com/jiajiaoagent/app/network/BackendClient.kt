package com.jiajiaoagent.app.network

import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class BackendClient(
    private val baseUrl: String = "http://100.101.3.116:8787"
) {
    suspend fun startSession(request: StartSessionRequest): StartSessionResponse {
        val payload = JSONObject()
            .put("childId", request.childId)
            .put("topicId", request.topicId)
            .put("currentLevel", request.currentLevel)

        val json = post("/api/sessions/start", payload)
        return StartSessionResponse(
            sessionId = json.getString("sessionId"),
            topicId = json.getString("topicId"),
            openingMessage = json.getString("openingMessage"),
            suggestedReplyMode = json.getString("suggestedReplyMode")
        )
    }

    suspend fun sendTurn(request: TurnRequest): TurnResponse {
        val recentTurns = JSONArray().apply {
            request.recentTurns.forEach { turn ->
                put(
                    JSONObject()
                        .put("speaker", turn.speaker)
                        .put("text", turn.text)
                )
            }
        }

        val payload = JSONObject()
            .put("sessionId", request.sessionId)
            .put("topicId", request.topicId)
            .put("turnIndex", request.turnIndex)
            .put("childUtteranceText", request.childUtteranceText)
            .put("recentTurns", recentTurns)

        val json = post("/api/sessions/turn", payload)
        val correction = json.getJSONObject("correction")

        return TurnResponse(
            sessionId = json.getString("sessionId"),
            agentReplyText = json.getString("agentReplyText"),
            shouldPlayTts = json.getBoolean("shouldPlayTts"),
            correction = CorrectionPayload(
                enabled = correction.getBoolean("enabled"),
                focus = correction.optString("focus").takeIf { it.isNotBlank() },
                mode = correction.getString("mode")
            ),
            promptHint = json.optString("promptHint").takeIf {
                it.isNotBlank() && !it.equals("null", ignoreCase = true)
            },
            isSessionComplete = json.getBoolean("isSessionComplete")
        )
    }

    private fun post(path: String, payload: JSONObject): JSONObject {
        val connection = URL("$baseUrl$path").openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.doOutput = true
        connection.setRequestProperty("Content-Type", "application/json")
        connection.connectTimeout = 10_000
        connection.readTimeout = 10_000

        OutputStreamWriter(connection.outputStream).use { writer ->
            writer.write(payload.toString())
        }

        val stream = if (connection.responseCode in 200..299) {
            connection.inputStream
        } else {
            connection.errorStream
        }

        val body = BufferedReader(InputStreamReader(stream)).use { reader ->
            buildString {
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    append(line)
                }
            }
        }

        if (connection.responseCode !in 200..299) {
            throw IllegalStateException("Backend request failed: ${connection.responseCode} $body")
        }

        return JSONObject(body)
    }
}
