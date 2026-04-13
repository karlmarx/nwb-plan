package com.nwb.phone.ui.history

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nwb.phone.data.model.PersonalRecord
import com.nwb.phone.data.model.WorkoutLog
import com.nwb.phone.ui.theme.*
import com.nwb.phone.ui.workout.PhoneWorkoutViewModel
import java.text.SimpleDateFormat
import java.util.*

/**
 * Workout history screen showing completed workouts, PRs, and sync status.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(viewModel: PhoneWorkoutViewModel) {
    val workouts by viewModel.recentWorkouts.collectAsState()
    val prs by viewModel.personalRecords.collectAsState()
    val count by viewModel.completedCount.collectAsState()
    val syncState by viewModel.syncManager.syncState.collectAsState()
    val lastSync by viewModel.syncManager.lastSyncTime.collectAsState()
    val hevySyncState by viewModel.hevySync.syncState.collectAsState()

    var selectedTab by remember { mutableIntStateOf(0) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Stats header
        Surface(
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 2.dp,
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Workout History",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row {
                    StatChip("$count", "Workouts", NwbBlue)
                    Spacer(modifier = Modifier.width(12.dp))
                    StatChip("${prs.size}", "PRs", NwbGreen)
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Sync buttons
                Row {
                    OutlinedButton(
                        onClick = { viewModel.syncWithWatch() },
                        modifier = Modifier.weight(1f),
                    ) {
                        Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = when (syncState) {
                                com.nwb.phone.data.sync.PhoneSyncManager.SyncState.SYNCING -> "Syncing..."
                                com.nwb.phone.data.sync.PhoneSyncManager.SyncState.SUCCESS -> "Synced"
                                else -> "Sync Watch"
                            },
                            fontSize = 12.sp,
                        )
                    }
                }

                if (lastSync != null) {
                    val fmt = SimpleDateFormat("MMM d, h:mm a", Locale.getDefault())
                    Text(
                        text = "Last sync: ${fmt.format(Date(lastSync!!))}",
                        fontSize = 10.sp,
                        color = NwbSlate,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
            }
        }

        // Tabs
        TabRow(selectedTabIndex = selectedTab) {
            Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }) {
                Text("Workouts", modifier = Modifier.padding(12.dp))
            }
            Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }) {
                Text("PRs", modifier = Modifier.padding(12.dp))
            }
        }

        when (selectedTab) {
            0 -> WorkoutHistoryList(workouts)
            1 -> PersonalRecordsList(prs)
        }
    }
}

@Composable
private fun StatChip(value: String, label: String, color: androidx.compose.ui.graphics.Color) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .background(color.copy(alpha = 0.1f), RoundedCornerShape(20.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp),
    ) {
        Text(text = value, fontWeight = FontWeight.Bold, color = color, fontSize = 16.sp)
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = label, color = NwbSlate, fontSize = 12.sp)
    }
}

@Composable
private fun WorkoutHistoryList(workouts: List<WorkoutLog>) {
    if (workouts.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.FitnessCenter, contentDescription = null, modifier = Modifier.size(48.dp), tint = NwbSlate)
                Spacer(modifier = Modifier.height(8.dp))
                Text("No workouts logged yet", color = NwbSlate)
            }
        }
        return
    }

    val fmt = SimpleDateFormat("EEE, MMM d · h:mm a", Locale.getDefault())

    LazyColumn(contentPadding = PaddingValues(12.dp)) {
        items(workouts) { log ->
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(
                            text = log.workoutTitle,
                            fontWeight = FontWeight.Bold,
                            color = NwbBlue,
                        )
                        if (log.syncedToHevy) {
                            Text("HEVY", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = NwbGreen)
                        }
                    }

                    Text(
                        text = fmt.format(Date(log.startedAt)),
                        fontSize = 12.sp,
                        color = NwbSlate,
                    )

                    Row(modifier = Modifier.padding(top = 4.dp)) {
                        val exerciseCount = log.exercises.size
                        val setCount = log.exercises.sumOf { it.sets.count { s -> s.completed } }
                        val totalVolume = log.exercises.sumOf { ex ->
                            ex.sets.filter { it.completed && it.weightKg != null && it.reps != null }
                                .sumOf { (it.weightKg!!.toDouble()) * (it.reps ?: 0) }
                        }
                        val duration = log.durationSeconds?.let { "${it / 60}m" } ?: "-"

                        Text("$exerciseCount ex · $setCount sets", fontSize = 11.sp, color = NwbSlate)
                        if (totalVolume > 0) {
                            Text(" · ${"%.0f".format(totalVolume)}kg vol", fontSize = 11.sp, color = NwbSlate)
                        }
                        Text(" · $duration", fontSize = 11.sp, color = NwbSlate)
                        Text(
                            text = " · ${log.source}",
                            fontSize = 9.sp,
                            color = if (log.source == "watch") NwbPurple else NwbBlue,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PersonalRecordsList(records: List<PersonalRecord>) {
    if (records.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.EmojiEvents, contentDescription = null, modifier = Modifier.size(48.dp), tint = NwbSlate)
                Spacer(modifier = Modifier.height(8.dp))
                Text("No PRs yet — start logging!", color = NwbSlate)
            }
        }
        return
    }

    val fmt = SimpleDateFormat("MMM d", Locale.getDefault())
    val grouped = records.groupBy { it.exerciseName }

    LazyColumn(contentPadding = PaddingValues(12.dp)) {
        grouped.forEach { (exerciseName, exRecords) ->
            item {
                Text(
                    text = exerciseName,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
                )
            }
            items(exRecords) { pr ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 4.dp, vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(
                        text = when (pr.type) {
                            "max_weight" -> "\uD83C\uDFCB Max Weight"
                            "max_reps" -> "\uD83D\uDD01 Max Reps"
                            "max_volume" -> "\uD83D\uDCCA Max Volume"
                            else -> pr.type
                        },
                        fontSize = 13.sp,
                    )
                    Text(
                        text = when (pr.type) {
                            "max_weight" -> "${"%.1f".format(pr.value)} kg"
                            "max_reps" -> "${pr.value.toInt()} reps"
                            "max_volume" -> "${"%.0f".format(pr.value)} kg"
                            else -> "${pr.value}"
                        },
                        fontWeight = FontWeight.Bold,
                        color = NwbGreen,
                        fontSize = 13.sp,
                    )
                    Text(
                        text = fmt.format(Date(pr.achievedAt)),
                        fontSize = 11.sp,
                        color = NwbSlate,
                    )
                }
            }
        }
    }
}
