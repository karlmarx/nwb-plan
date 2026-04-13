package com.nwb.watch.ui.workout

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.nwb.watch.data.sync.SyncManager
import com.nwb.watch.ui.theme.NwbBlue
import com.nwb.watch.ui.theme.NwbGreen
import com.nwb.watch.ui.theme.NwbRed
import com.nwb.watch.ui.theme.NwbSlate
import com.nwb.watch.ui.theme.NwbYellow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Sync screen on the watch — shows sync status and a manual sync button.
 */
@Composable
fun SyncScreen(
    syncManager: SyncManager,
    onSync: () -> Unit,
) {
    val syncState by syncManager.syncState.collectAsState()
    val lastSync by syncManager.lastSyncTime.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        // Sync icon
        Text(
            text = when (syncState) {
                SyncManager.SyncState.SYNCING -> "\u21BB"
                SyncManager.SyncState.SUCCESS -> "\u2713"
                SyncManager.SyncState.ERROR -> "\u2717"
                else -> "\u21C5"
            },
            fontSize = 32.sp,
            color = when (syncState) {
                SyncManager.SyncState.SYNCING -> NwbYellow
                SyncManager.SyncState.SUCCESS -> NwbGreen
                SyncManager.SyncState.ERROR -> NwbRed
                else -> NwbBlue
            },
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Status text
        Text(
            text = when (syncState) {
                SyncManager.SyncState.SYNCING -> "Syncing..."
                SyncManager.SyncState.SUCCESS -> "Synced"
                SyncManager.SyncState.ERROR -> "Sync failed"
                else -> "Watch \u2194 Phone"
            },
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface,
        )

        // Last sync time
        if (lastSync != null) {
            val fmt = SimpleDateFormat("h:mm a", Locale.getDefault())
            Text(
                text = "Last: ${fmt.format(Date(lastSync!!))}",
                fontSize = 10.sp,
                color = NwbSlate,
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Sync button
        Button(
            onClick = onSync,
            modifier = Modifier.fillMaxWidth(0.8f),
            enabled = syncState != SyncManager.SyncState.SYNCING,
            colors = ButtonDefaults.buttonColors(containerColor = NwbBlue),
        ) {
            Text(
                text = "SYNC NOW",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Pushes workout logs\nto your phone",
            fontSize = 9.sp,
            color = NwbSlate,
            textAlign = TextAlign.Center,
            lineHeight = 12.sp,
        )
    }
}
