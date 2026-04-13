package com.nwb.watch.ui.workout

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TextButton
import com.nwb.watch.ui.WorkoutViewModel
import com.nwb.watch.ui.theme.NwbSlate
import com.nwb.watch.ui.theme.workoutColor

@Composable
fun RestTimerScreen(
    viewModel: WorkoutViewModel,
    onTimerDone: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    val remaining by viewModel.restTimerSeconds.collectAsState()
    val isRunning by viewModel.isRestTimerRunning.collectAsState()

    // Navigate back when timer completes
    if (!isRunning && remaining == 0) {
        // Timer finished — caller handles navigation
    }

    val exercise = state.exercises.getOrNull(state.currentExerciseIndex)
    val totalRest = exercise?.rest ?: 120
    val progress = if (totalRest > 0) remaining.toFloat() / totalRest.toFloat() else 0f

    val accentColor = workoutColor(state.workoutColor)

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        // Circular progress arc
        Canvas(
            modifier = Modifier.size(160.dp),
        ) {
            val strokeWidth = 8.dp.toPx()
            val radius = (size.minDimension - strokeWidth) / 2
            val topLeft = Offset(
                (size.width - radius * 2) / 2,
                (size.height - radius * 2) / 2,
            )

            // Background arc
            drawArc(
                color = NwbSlate.copy(alpha = 0.2f),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = Size(radius * 2, radius * 2),
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
            )

            // Progress arc
            drawArc(
                color = accentColor,
                startAngle = -90f,
                sweepAngle = 360f * progress,
                useCenter = false,
                topLeft = topLeft,
                size = Size(radius * 2, radius * 2),
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
            )
        }

        // Timer text
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = "REST",
                fontSize = 10.sp,
                color = NwbSlate,
                fontWeight = FontWeight.Bold,
            )

            Text(
                text = formatTime(remaining),
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                color = when {
                    remaining <= 10 -> MaterialTheme.colorScheme.error
                    remaining <= 30 -> com.nwb.watch.ui.theme.NwbYellow
                    else -> MaterialTheme.colorScheme.onSurface
                },
            )

            // Next exercise name
            val nextIndex = state.currentExerciseIndex + 1
            val nextExercise = state.exercises.getOrNull(nextIndex)
            if (nextExercise != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Next: ${nextExercise.name}",
                    fontSize = 10.sp,
                    color = NwbSlate,
                    modifier = Modifier.padding(horizontal = 24.dp),
                    maxLines = 1,
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            TextButton(
                onClick = {
                    viewModel.skipRest()
                    onTimerDone()
                },
            ) {
                Text(
                    text = "Skip",
                    fontSize = 12.sp,
                    color = accentColor,
                )
            }
        }
    }
}

private fun formatTime(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return "%d:%02d".format(m, s)
}
