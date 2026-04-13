package com.nwb.phone.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val NwbBlue = Color(0xFF38BDF8)
val NwbPurple = Color(0xFFA78BFA)
val NwbGreen = Color(0xFF10B981)
val NwbSlate = Color(0xFF64748B)
val NwbOrange = Color(0xFFF97316)
val NwbRed = Color(0xFFEF4444)
val NwbYellow = Color(0xFFFBBF24)
val NwbDarkBg = Color(0xFF0F172A)
val NwbDarkSurface = Color(0xFF1E293B)
val NwbDarkCard = Color(0xFF273548)

private val NwbDarkColorScheme = darkColorScheme(
    primary = NwbBlue,
    onPrimary = Color.Black,
    secondary = NwbPurple,
    onSecondary = Color.Black,
    tertiary = NwbGreen,
    onTertiary = Color.Black,
    background = NwbDarkBg,
    onBackground = Color(0xFFE2E8F0),
    surface = NwbDarkSurface,
    onSurface = Color(0xFFE2E8F0),
    surfaceVariant = NwbDarkCard,
    onSurfaceVariant = Color(0xFFCBD5E1),
    error = NwbRed,
    onError = Color.White,
)

@Composable
fun NwbPhoneTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = NwbDarkColorScheme,
        content = content,
    )
}

fun workoutColor(hex: String): Color = try {
    Color(android.graphics.Color.parseColor(hex))
} catch (_: Exception) { NwbBlue }

fun safetyColor(safety: String): Color = when (safety) {
    "safe" -> NwbGreen; "caution" -> NwbYellow; "danger" -> NwbRed; else -> NwbSlate
}
