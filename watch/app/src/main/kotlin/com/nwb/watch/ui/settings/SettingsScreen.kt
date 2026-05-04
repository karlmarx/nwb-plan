package com.nwb.watch.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.OutlinedButton
import androidx.wear.compose.material3.SwitchButton
import androidx.wear.compose.material3.Text
import com.nwb.watch.ui.WorkoutViewModel
import com.nwb.watch.ui.theme.NwbSlate

@Composable
fun SettingsScreen(
    viewModel: WorkoutViewModel,
) {
    val state by viewModel.uiState.collectAsState()
    val listState = rememberScalingLazyListState()

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        state = listState,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        item {
            Text(
                text = "Settings",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 8.dp, bottom = 4.dp),
            )
        }

        // Week picker — lets the user correct which week the program thinks they're in
        item {
            WeekPicker(
                currentWeek = state.weekNumber,
                onPick = { viewModel.setCurrentWeek(it) },
            )
        }

        // Voice coaching toggle
        item {
            SettingsToggle(
                label = "Voice Coaching",
                description = "TTS exercise cues",
                checked = state.ttsEnabled,
                onToggle = { viewModel.toggleTts() },
            )
        }

        // Haptic feedback toggle
        item {
            SettingsToggle(
                label = "Haptic Feedback",
                description = "Vibration cues",
                checked = state.hapticsEnabled,
                onToggle = { viewModel.toggleHaptics() },
            )
        }

        // Program info
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = "Program",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = NwbSlate,
                )
                Text(
                    text = "${state.phaseName} · Week ${state.weekNumber}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Text(
                    text = "${(state.programProgress * 100).toInt()}% complete",
                    style = MaterialTheme.typography.bodySmall,
                    color = NwbSlate,
                    fontSize = 11.sp,
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun WeekPicker(
    currentWeek: Int,
    onPick: (Int) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "I'm on Week",
            fontSize = 11.sp,
            color = NwbSlate,
            modifier = Modifier.padding(bottom = 4.dp),
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally),
        ) {
            (1..4).forEach { week ->
                WeekButton(week, currentWeek == week, onPick)
            }
        }
        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally),
        ) {
            (5..8).forEach { week ->
                WeekButton(week, currentWeek == week, onPick)
            }
        }
    }
}

@Composable
private fun WeekButton(
    week: Int,
    selected: Boolean,
    onPick: (Int) -> Unit,
) {
    if (selected) {
        Button(
            onClick = { onPick(week) },
            modifier = Modifier.size(width = 44.dp, height = 32.dp),
            colors = ButtonDefaults.buttonColors(),
        ) {
            Text(text = week.toString(), fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
    } else {
        OutlinedButton(
            onClick = { onPick(week) },
            modifier = Modifier.size(width = 44.dp, height = 32.dp),
        ) {
            Text(text = week.toString(), fontSize = 13.sp)
        }
    }
}

@Composable
private fun SettingsToggle(
    label: String,
    description: String,
    checked: Boolean,
    onToggle: () -> Unit,
) {
    SwitchButton(
        checked = checked,
        onCheckedChange = { onToggle() },
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 2.dp),
        label = {
            Text(text = label, fontSize = 13.sp)
        },
        secondaryLabel = {
            Text(text = description, fontSize = 10.sp, color = NwbSlate)
        },
    )
}
