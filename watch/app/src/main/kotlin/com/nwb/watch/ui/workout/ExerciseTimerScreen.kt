package com.nwb.watch.ui.workout

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.nwb.watch.data.model.SetLog
import com.nwb.watch.ui.theme.NwbGreen
import com.nwb.watch.ui.theme.NwbSlate
import com.nwb.watch.ui.theme.NwbYellow
import com.nwb.watch.ui.theme.workoutColor
import kotlinx.coroutines.delay

/**
 * Countdown timer for timed exercises (planks, holds, carries, etc).
 * Shows a circular countdown with haptic ticks and auto-logs the set on completion.
 */
@Composable
fun ExerciseTimerScreen(
    exerciseName: String,
    setIndex: Int,
    totalSets: Int,
    targetSeconds: Int,
    workoutColorHex: String,
    onComplete: (SetLog) -> Unit,
    onCancel: () -> Unit,
) {
    var elapsed by remember { mutableIntStateOf(0) }
    var isRunning by remember { mutableStateOf(false) }
    var isComplete by remember { mutableStateOf(false) }

    val remaining = (targetSeconds - elapsed).coerceAtLeast(0)
    val progress = if (targetSeconds > 0) elapsed.toFloat() / targetSeconds else 0f
    val accent = workoutColor(workoutColorHex)

    // Countdown ticker
    LaunchedEffect(isRunning) {
        while (isRunning && elapsed < targetSeconds) {
            delay(1000)
            elapsed++
            if (elapsed >= targetSeconds) {
                isRunning = false
                isComplete = true
            }
        }
    }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        // Progress ring
        Canvas(modifier = Modifier.size(160.dp)) {
            val strokeWidth = 8.dp.toPx()
            val radius = (size.minDimension - strokeWidth) / 2
            val topLeft = Offset(
                (size.width - radius * 2) / 2,
                (size.height - radius * 2) / 2,
            )
            val arcSize = Size(radius * 2, radius * 2)

            // Background
            drawArc(
                color = NwbSlate.copy(alpha = 0.2f),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
            )

            // Progress (fills up as timer progresses)
            drawArc(
                color = if (isComplete) NwbGreen else accent,
                startAngle = -90f,
                sweepAngle = 360f * progress,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
            )
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "Set ${setIndex + 1}/$totalSets",
                fontSize = 9.sp,
                color = NwbSlate,
            )

            Text(
                text = formatTimer(remaining),
                fontSize = if (isComplete) 28.sp else 36.sp,
                fontWeight = FontWeight.Bold,
                color = when {
                    isComplete -> NwbGreen
                    remaining <= 5 -> NwbYellow
                    else -> MaterialTheme.colorScheme.onSurface
                },
            )

            if (isComplete) {
                Text(
                    text = "DONE",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = NwbGreen,
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (!isComplete) {
                Button(
                    onClick = { isRunning = !isRunning },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isRunning) NwbYellow else accent,
                    ),
                ) {
                    Text(
                        text = if (isRunning) "PAUSE" else "START",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                    )
                }
            } else {
                Button(
                    onClick = {
                        onComplete(
                            SetLog(
                                index = setIndex,
                                type = "duration",
                                durationSeconds = elapsed,
                                completed = true,
                            )
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NwbGreen),
                ) {
                    Text(
                        text = "\u2713 LOG",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                    )
                }
            }
        }
    }
}

private fun formatTimer(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return if (m > 0) "%d:%02d".format(m, s) else "%d".format(s)
}
