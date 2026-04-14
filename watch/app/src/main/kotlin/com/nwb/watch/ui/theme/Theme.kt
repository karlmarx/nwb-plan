package com.nwb.watch.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Typography

// Colors matching the main PWA dark theme
val NwbBlue = Color(0xFF38BDF8)    // Push workouts
val NwbPurple = Color(0xFFA78BFA)  // Pull workouts
val NwbGreen = Color(0xFF10B981)   // Legs workouts
val NwbSlate = Color(0xFF64748B)   // Recovery
val NwbOrange = Color(0xFFF97316)  // Peak phase accent
val NwbRed = Color(0xFFEF4444)     // Danger / caution
val NwbYellow = Color(0xFFFBBF24)  // Caution

val NwbDarkBg = Color(0xFF0F172A)
val NwbDarkSurface = Color(0xFF1E293B)
val NwbDarkOnSurface = Color(0xFFE2E8F0)

private val NwbColorScheme = ColorScheme(
    primary = NwbBlue,
    onPrimary = Color.Black,
    secondary = NwbPurple,
    onSecondary = Color.Black,
    tertiary = NwbGreen,
    onTertiary = Color.Black,
    background = NwbDarkBg,
    onBackground = NwbDarkOnSurface,
    surface = NwbDarkSurface,
    onSurface = NwbDarkOnSurface,
    error = NwbRed,
    onError = Color.White,
)

@Composable
fun NwbWatchTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = NwbColorScheme,
        typography = Typography(),
        content = content,
    )
}

/** Map workout color hex strings to Compose Colors. */
fun workoutColor(hex: String): Color = try {
    Color(android.graphics.Color.parseColor(hex))
} catch (_: Exception) {
    NwbBlue
}

/** Map safety level to color. */
fun safetyColor(safety: String): Color = when (safety) {
    "safe" -> NwbGreen
    "caution" -> NwbYellow
    "danger" -> NwbRed
    else -> NwbSlate
}

/** Map safety level to label. */
fun safetyLabel(safety: String): String = when (safety) {
    "safe" -> "NWB-SAFE"
    "caution" -> "CAUTION"
    "danger" -> "DANGER"
    else -> safety.uppercase()
}
