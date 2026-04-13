package com.nwb.watch.ui.workout

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.IconButton
import androidx.wear.compose.material3.IconButtonDefaults
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.nwb.watch.data.model.Exercise
import com.nwb.watch.data.model.SetLog
import com.nwb.watch.ui.theme.NwbGreen
import com.nwb.watch.ui.theme.NwbSlate
import com.nwb.watch.ui.theme.workoutColor

/**
 * Set logging screen with Hevy-style weight/rep input.
 * Shown when user is actively performing a set.
 *
 * Features:
 * - Weight input with +/- buttons (2.5kg increments)
 * - Rep counter with +/- buttons
 * - Duration timer for timed exercises
 * - "Log Set" button to save and start rest timer
 */
@Composable
fun SetLoggerScreen(
    exercise: Exercise,
    setIndex: Int,
    totalSets: Int,
    phaseIndex: Int,
    workoutColor: String,
    previousSet: SetLog?,
    onLogSet: (SetLog) -> Unit,
) {
    val (_, repsStr) = exercise.setsForPhase(phaseIndex)
    val isDuration = repsStr.contains("s")
    val defaultReps = repsStr.replace(Regex("[^0-9]"), "").toIntOrNull() ?: 8
    val defaultDuration = if (isDuration) defaultReps else 0

    var weight by remember { mutableFloatStateOf(previousSet?.weightKg ?: 0f) }
    var reps by remember { mutableIntStateOf(previousSet?.reps ?: defaultReps) }
    var duration by remember { mutableIntStateOf(previousSet?.durationSeconds ?: defaultDuration) }

    val accent = workoutColor(workoutColor)
    val listState = rememberScalingLazyListState()

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        state = listState,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Header
        item {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 4.dp),
            ) {
                Text(
                    text = "Set ${setIndex + 1} / $totalSets",
                    fontSize = 10.sp,
                    color = NwbSlate,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = exercise.name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = accent,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp),
                    maxLines = 1,
                )
            }
        }

        // Weight input (skip for bodyweight exercises)
        if (!isDuration) {
            item {
                InputRow(
                    label = "WEIGHT",
                    value = if (weight == 0f) "BW" else "%.1f".format(weight),
                    unit = if (weight > 0f) "kg" else "",
                    onDecrement = { weight = (weight - 2.5f).coerceAtLeast(0f) },
                    onIncrement = { weight += 2.5f },
                    accentColor = accent,
                )
            }
        }

        // Reps or duration input
        item {
            if (isDuration) {
                InputRow(
                    label = "DURATION",
                    value = "$duration",
                    unit = "s",
                    onDecrement = { duration = (duration - 5).coerceAtLeast(5) },
                    onIncrement = { duration += 5 },
                    accentColor = accent,
                )
            } else {
                InputRow(
                    label = "REPS",
                    value = "$reps",
                    unit = "",
                    onDecrement = { reps = (reps - 1).coerceAtLeast(1) },
                    onIncrement = { reps++ },
                    accentColor = accent,
                )
            }
        }

        // Previous set reference
        if (previousSet != null) {
            item {
                val prevText = when {
                    previousSet.durationSeconds != null -> "Prev: ${previousSet.durationSeconds}s"
                    previousSet.weightKg != null && previousSet.weightKg > 0f ->
                        "Prev: ${"%.1f".format(previousSet.weightKg)}kg × ${previousSet.reps}"
                    else -> "Prev: BW × ${previousSet.reps}"
                }
                Text(
                    text = prevText,
                    fontSize = 9.sp,
                    color = NwbSlate.copy(alpha = 0.7f),
                )
            }
        }

        // Log set button
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = {
                    val set = if (isDuration) {
                        SetLog(
                            index = setIndex,
                            type = "duration",
                            durationSeconds = duration,
                            completed = true,
                        )
                    } else {
                        SetLog(
                            index = setIndex,
                            type = if (weight > 0f) "weight_reps" else "bodyweight",
                            weightKg = if (weight > 0f) weight else null,
                            reps = reps,
                            completed = true,
                        )
                    }
                    onLogSet(set)
                },
                modifier = Modifier.fillMaxWidth(0.85f),
                colors = ButtonDefaults.buttonColors(containerColor = NwbGreen),
            ) {
                Text(
                    text = "\u2713 LOG SET",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@Composable
private fun InputRow(
    label: String,
    value: String,
    unit: String,
    onDecrement: () -> Unit,
    onIncrement: () -> Unit,
    accentColor: androidx.compose.ui.graphics.Color,
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
    ) {
        Text(
            text = label,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            color = NwbSlate,
        )
        Spacer(modifier = Modifier.height(2.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
        ) {
            // Decrement button
            IconButton(
                onClick = onDecrement,
                modifier = Modifier.size(36.dp),
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
                shape = CircleShape,
            ) {
                Text(
                    text = "\u2212",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = accentColor,
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Value display
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = value,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                if (unit.isNotEmpty()) {
                    Text(
                        text = unit,
                        fontSize = 12.sp,
                        color = NwbSlate,
                        modifier = Modifier.padding(bottom = 4.dp, start = 2.dp),
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Increment button
            IconButton(
                onClick = onIncrement,
                modifier = Modifier.size(36.dp),
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
                shape = CircleShape,
            ) {
                Text(
                    text = "+",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = accentColor,
                )
            }
        }
    }
}
