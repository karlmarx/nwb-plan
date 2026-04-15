package com.nwb.watch.ui.settings

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
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
import androidx.wear.compose.material3.MaterialTheme
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
