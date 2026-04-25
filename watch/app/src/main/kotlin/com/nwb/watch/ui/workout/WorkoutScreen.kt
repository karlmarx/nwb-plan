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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.itemsIndexed
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.Card
import androidx.wear.compose.material3.CardDefaults
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.nwb.watch.data.model.Exercise
import com.nwb.watch.ui.WorkoutViewModel
import com.nwb.watch.ui.theme.NwbSlate
import com.nwb.watch.ui.theme.safetyColor
import com.nwb.watch.ui.theme.safetyLabel
import com.nwb.watch.ui.theme.workoutColor

@Composable
fun WorkoutScreen(
    viewModel: WorkoutViewModel,
    onExerciseTap: (Int) -> Unit,
    onEndWorkout: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    val listState = rememberScalingLazyListState()

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        state = listState,
    ) {
        // Progress header
        item {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            ) {
                // Progress dots
                Row(
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    state.exercises.forEachIndexed { index, _ ->
                        val color = when {
                            index < state.currentExerciseIndex -> workoutColor(state.workoutColor)
                            index == state.currentExerciseIndex -> workoutColor(state.workoutColor)
                            else -> NwbSlate.copy(alpha = 0.3f)
                        }
                        val alpha = if (index <= state.currentExerciseIndex) 1f else 0.3f
                        Box(
                            modifier = Modifier
                                .padding(horizontal = 2.dp)
                                .size(if (index == state.currentExerciseIndex) 10.dp else 6.dp)
                                .clip(CircleShape)
                                .background(color.copy(alpha = alpha))
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "${state.currentExerciseIndex + 1} / ${state.exercises.size}",
                    style = MaterialTheme.typography.bodySmall,
                    color = NwbSlate,
                )
            }
        }

        // Exercise cards
        itemsIndexed(state.exercises) { index, exercise ->
            ExerciseCard(
                exercise = exercise,
                phaseIndex = state.phaseIndex,
                isCurrent = index == state.currentExerciseIndex,
                isCompleted = index < state.currentExerciseIndex,
                workoutColor = state.workoutColor,
                onClick = { onExerciseTap(index) },
            )
        }

        // End workout button
        item {
            Spacer(modifier = Modifier.height(8.dp))
            androidx.wear.compose.material3.TextButton(
                onClick = {
                    viewModel.endWorkout()
                    onEndWorkout()
                },
            ) {
                Text(
                    text = "End Workout",
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 12.sp,
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun ExerciseCard(
    exercise: Exercise,
    phaseIndex: Int,
    isCurrent: Boolean,
    isCompleted: Boolean,
    workoutColor: String,
    onClick: () -> Unit,
) {
    val borderColor = when {
        isCurrent -> workoutColor(workoutColor)
        isCompleted -> workoutColor(workoutColor).copy(alpha = 0.3f)
        else -> NwbSlate.copy(alpha = 0.2f)
    }

    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 3.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCurrent) {
                MaterialTheme.colorScheme.surfaceContainer
            } else {
                MaterialTheme.colorScheme.surfaceContainer.copy(alpha = 0.5f)
            },
        ),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(modifier = Modifier.padding(8.dp)) {
            // Exercise name
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (isCompleted) {
                    Text(
                        text = "\u2713 ",
                        color = workoutColor(workoutColor),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                    )
                }
                Text(
                    text = exercise.name,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                    color = if (isCompleted) NwbSlate else MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
            }

            // Sets x Reps + Safety badge
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth().padding(top = 2.dp),
            ) {
                Text(
                    text = "${exercise.setsDisplay(phaseIndex)}  ·  ${exercise.restDisplay()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = NwbSlate,
                    fontSize = 11.sp,
                )

                Text(
                    text = safetyLabel(exercise.safety),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = safetyColor(exercise.safety),
                )
            }

            // Tempo if available
            if (exercise.tempo != null && isCurrent) {
                Text(
                    text = "Tempo: ${exercise.tempo}",
                    style = MaterialTheme.typography.bodySmall,
                    color = workoutColor(workoutColor).copy(alpha = 0.8f),
                    fontSize = 10.sp,
                    modifier = Modifier.padding(top = 2.dp),
                )
            }
        }
    }
}
