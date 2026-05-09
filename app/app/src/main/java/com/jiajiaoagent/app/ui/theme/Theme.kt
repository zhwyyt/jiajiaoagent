package com.jiajiaoagent.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = PrimaryBlue,
    secondary = AccentGreen,
    surface = SurfaceGray
)

private val DarkColors = darkColorScheme(
    primary = PrimaryBlueDark,
    secondary = AccentGreen
)

@Composable
fun JiajiaoAgentTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = Typography,
        content = content
    )
}
