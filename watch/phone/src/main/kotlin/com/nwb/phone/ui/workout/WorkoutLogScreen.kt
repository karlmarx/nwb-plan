package com.nwb.phone.ui.workout

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nwb.phone.data.model.Exercise
import com.nwb.phone.data.model.SetLog
import com.nwb.phone.ui.theme.*

/**
 * Full-screen workout logging UI for the phone app.
 * Hevy-style exercise list with inline set logging:
 * - Weight input (+/- buttons, direct edit)
 * - Rep counter (+/- buttons)
 * - Timed exercise countdown
 * - Rest timer between sets
 * - Per-exercise notes
 */
@Composable
fun WorkoutLogScreen(
    viewModel: PhoneWorkoutViewModel,
    onFinish: () -> Unit,
) {
    val state by viewModel.state.collectAsState()
    val restSeconds by viewModel.restSeconds.collectAsState()
    val restRunning by viewModel.restRunning.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        // Header
        Surface(
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 2.dp,
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = state.workoutTitle,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = workoutColor(state.workoutColor),
                )
                Text(
                    text = "${state.phaseName} · Week ${state.weekNumber} · ${state.exercises.size} exercises",
                    style = MaterialTheme.typography.bodySmall,
                    color = NwbSlate,
                )

                // Rest timer bar (shown when active)
                if (restRunning) {
                    Spacer(modifier = Modifier.height(8.dp))
                    RestTimerBar(
                        seconds = restSeconds,
                        onSkip = { viewModel.skipRest() },
                        accentColor = workoutColor(state.workoutColor),
                    )
                }
            }
        }

        // Exercise list
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(vertical = 8.dp),
        ) {
            itemsIndexed(state.exercises) { index, exercise ->
                val loggedSets = viewModel.setsForExercise(index)
                val isCurrent = index == state.currentExerciseIndex

                ExerciseLogCard(
                    exercise = exercise,
                    phaseIndex = state.phaseIndex,
                    loggedSets = loggedSets,
                    isCurrent = isCurrent,
                    workoutColor = state.workoutColor,
                    onLogSet = { set -> viewModel.logSet(index, set) },
                    onStartRest = { secs -> viewModel.startRestTimer(secs) },
                    onStartTimer = { secs -> viewModel.startExerciseTimer(secs) },
                    onTap = { viewModel.goToExercise(index) },
                )
            }

            // Finish button
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = {
                        viewModel.finishWorkout()
                        onFinish()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = NwbGreen),
                ) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("FINISH WORKOUT", fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
private fun ExerciseLogCard(
    exercise: Exercise,
    phaseIndex: Int,
    loggedSets: List<SetLog>,
    isCurrent: Boolean,
    workoutColor: String,
    onLogSet: (SetLog) -> Unit,
    onStartRest: (Int) -> Unit,
    onStartTimer: (Int) -> Unit,
    onTap: () -> Unit,
) {
    val (totalSetsStr, repsStr) = exercise.setsForPhase(phaseIndex)
    val totalSets = totalSetsStr.toIntOrNull() ?: 4
    val isDuration = repsStr.contains("s")
    val defaultReps = repsStr.replace(Regex("[^0-9]"), "").toIntOrNull() ?: 8
    val accent = workoutColor(workoutColor)

    var expanded by remember { mutableStateOf(isCurrent) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCurrent) {
                MaterialTheme.colorScheme.surfaceVariant
            } else {
                MaterialTheme.colorScheme.surface
            },
        ),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(
            modifier = Modifier
                .clickable {
                    onTap()
                    expanded = !expanded
                }
                .padding(12.dp),
        ) {
            // Exercise header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(),
            ) {
                // Completion indicator
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(
                            if (loggedSets.size >= totalSets) NwbGreen.copy(alpha = 0.2f)
                            else accent.copy(alpha = 0.1f)
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "${loggedSets.size}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (loggedSets.size >= totalSets) NwbGreen else accent,
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = exercise.name,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Medium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        text = "${exercise.setsDisplay(phaseIndex)} · Rest ${exercise.restDisplay()}",
                        style = MaterialTheme.typography.bodySmall,
                        color = NwbSlate,
                    )
                }

                // Safety badge
                Text(
                    text = when (exercise.safety) {
                        "safe" -> "SAFE"
                        "caution" -> "CAUTION"
                        else -> exercise.safety.uppercase()
                    },
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = safetyColor(exercise.safety),
                )
            }

            // Expanded: set logging table
            if (expanded) {
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = NwbSlate.copy(alpha = 0.2f))
                Spacer(modifier = Modifier.height(8.dp))

                // Set headers
                Row(modifier = Modifier.fillMaxWidth()) {
                    Text("SET", Modifier.width(40.dp), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = NwbSlate)
                    Text("PREV", Modifier.width(70.dp), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = NwbSlate)
                    if (!isDuration) {
                        Text("KG", Modifier.weight(1f), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = NwbSlate)
                        Text("REPS", Modifier.weight(1f), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = NwbSlate)
                    } else {
                        Text("TIME", Modifier.weight(1f), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = NwbSlate)
                    }
                    Spacer(modifier = Modifier.width(48.dp))
                }

                // Set rows
                for (setIdx in 0 until totalSets) {
                    val existingSet = loggedSets.getOrNull(setIdx)
                    SetInputRow(
                        setIndex = setIdx,
                        isDuration = isDuration,
                        defaultReps = defaultReps,
                        previousSet = if (setIdx > 0) loggedSets.getOrNull(setIdx - 1) else null,
                        loggedSet = existingSet,
                        accent = accent,
                        onLog = { set ->
                            onLogSet(set)
                            onStartRest(exercise.rest)
                        },
                        onStartTimer = onStartTimer,
                    )
                }

                // NWB cues (collapsed)
                if (exercise.safety == "caution" || exercise.nwbCues.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "\u26A0 ${exercise.nwbCues}",
                        fontSize = 11.sp,
                        color = NwbYellow.copy(alpha = 0.8f),
                        lineHeight = 14.sp,
                    )
                }
            }
        }
    }
}

@Composable
private fun SetInputRow(
    setIndex: Int,
    isDuration: Boolean,
    defaultReps: Int,
    previousSet: SetLog?,
    loggedSet: SetLog?,
    accent: androidx.compose.ui.graphics.Color,
    onLog: (SetLog) -> Unit,
    onStartTimer: (Int) -> Unit,
) {
    var weight by remember { mutableFloatStateOf(loggedSet?.weightKg ?: previousSet?.weightKg ?: 0f) }
    var reps by remember { mutableIntStateOf(loggedSet?.reps ?: previousSet?.reps ?: defaultReps) }
    var duration by remember { mutableIntStateOf(loggedSet?.durationSeconds ?: defaultReps) }
    val isLogged = loggedSet?.completed == true

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp)
            .background(
                if (isLogged) NwbGreen.copy(alpha = 0.05f)
                else androidx.compose.ui.graphics.Color.Transparent,
                RoundedCornerShape(6.dp),
            )
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Set number
        Text(
            text = "${setIndex + 1}",
            modifier = Modifier.width(40.dp),
            fontWeight = FontWeight.Bold,
            color = if (isLogged) NwbGreen else MaterialTheme.colorScheme.onSurface,
        )

        // Previous
        Text(
            text = previousSet?.let {
                if (it.durationSeconds != null) "${it.durationSeconds}s"
                else "${it.weightKg ?: "BW"} × ${it.reps}"
            } ?: "-",
            modifier = Modifier.width(70.dp),
            fontSize = 12.sp,
            color = NwbSlate,
        )

        if (!isDuration) {
            // Weight +/-
            CompactInput(
                value = if (weight > 0) "%.1f".format(weight) else "BW",
                onDec = { weight = (weight - 2.5f).coerceAtLeast(0f) },
                onInc = { weight += 2.5f },
                modifier = Modifier.weight(1f),
            )

            // Reps +/-
            CompactInput(
                value = "$reps",
                onDec = { reps = (reps - 1).coerceAtLeast(1) },
                onInc = { reps++ },
                modifier = Modifier.weight(1f),
            )
        } else {
            // Duration
            CompactInput(
                value = "${duration}s",
                onDec = { duration = (duration - 5).coerceAtLeast(5) },
                onInc = { duration += 5 },
                modifier = Modifier.weight(1f),
            )
        }

        // Log button
        if (!isLogged) {
            IconButton(
                onClick = {
                    val set = if (isDuration) {
                        SetLog(setIndex, "duration", durationSeconds = duration, completed = true)
                    } else {
                        SetLog(
                            setIndex,
                            if (weight > 0) "weight_reps" else "bodyweight",
                            weightKg = if (weight > 0) weight else null,
                            reps = reps,
                            completed = true,
                        )
                    }
                    onLog(set)
                },
                modifier = Modifier.size(36.dp),
            ) {
                Icon(Icons.Default.Check, contentDescription = "Log set", tint = accent)
            }
        } else {
            Icon(
                Icons.Default.Check,
                contentDescription = "Done",
                tint = NwbGreen,
                modifier = Modifier.size(36.dp).padding(6.dp),
            )
        }
    }
}

@Composable
private fun CompactInput(
    value: String,
    onDec: () -> Unit,
    onInc: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        IconButton(onClick = onDec, modifier = Modifier.size(28.dp)) {
            Icon(Icons.Default.Remove, contentDescription = "Decrease", modifier = Modifier.size(16.dp))
        }
        Text(
            text = value,
            fontWeight = FontWeight.Medium,
            fontSize = 14.sp,
            modifier = Modifier.widthIn(min = 36.dp),
        )
        IconButton(onClick = onInc, modifier = Modifier.size(28.dp)) {
            Icon(Icons.Default.Add, contentDescription = "Increase", modifier = Modifier.size(16.dp))
        }
    }
}

@Composable
private fun RestTimerBar(
    seconds: Int,
    onSkip: () -> Unit,
    accentColor: androidx.compose.ui.graphics.Color,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(accentColor.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(Icons.Default.Timer, contentDescription = null, tint = accentColor, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "Rest: ${seconds / 60}:%02d".format(seconds % 60),
            fontWeight = FontWeight.Bold,
            color = when {
                seconds <= 10 -> NwbRed
                seconds <= 30 -> NwbYellow
                else -> accentColor
            },
            modifier = Modifier.weight(1f),
        )
        TextButton(onClick = onSkip) {
            Text("Skip", color = accentColor)
        }
    }
}
