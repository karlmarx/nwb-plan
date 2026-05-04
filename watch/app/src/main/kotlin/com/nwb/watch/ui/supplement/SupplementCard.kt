package com.nwb.watch.ui.supplement

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Card
import androidx.wear.compose.material3.CardDefaults
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TextButton
import com.nwb.watch.ui.theme.NwbGreen
import com.nwb.watch.ui.theme.NwbSlate

/**
 * Compact supplement card shown between exercises.
 * Used for left leg maintenance, core supplements, and nearby supersets.
 */
@Composable
fun SupplementCard(
    title: String,
    sets: String,
    instruction: String,
    safety: String,
    category: String, // "left_leg", "core", "nearby"
    onDismiss: () -> Unit,
    onReadAloud: (() -> Unit)? = null,
) {
    val accentColor = when (category) {
        "left_leg" -> NwbGreen
        "core" -> com.nwb.watch.ui.theme.NwbPurple
        "nearby" -> com.nwb.watch.ui.theme.NwbBlue
        else -> NwbSlate
    }

    val categoryLabel = when (category) {
        "left_leg" -> "LEFT LEG"
        "core" -> "CORE"
        "nearby" -> "SUPERSET"
        else -> ""
    }

    Card(
        onClick = {},
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 3.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainer,
        ),
        shape = RoundedCornerShape(10.dp),
    ) {
        Column(modifier = Modifier.padding(8.dp)) {
            // Category badge
            Text(
                text = categoryLabel,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = accentColor,
            )

            // Title + sets
            Row(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = title,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f),
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = sets,
                    fontSize = 11.sp,
                    color = NwbSlate,
                )
            }

            // Instruction
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = instruction,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                lineHeight = 13.sp,
            )

            // Safety note
            Text(
                text = safety,
                fontSize = 9.sp,
                color = NwbGreen.copy(alpha = 0.8f),
                lineHeight = 12.sp,
                modifier = Modifier.padding(top = 2.dp),
            )

            // Action buttons
            Row(modifier = Modifier.padding(top = 4.dp)) {
                TextButton(onClick = onDismiss) {
                    Text("Skip", fontSize = 10.sp, color = NwbSlate)
                }
                if (onReadAloud != null) {
                    Spacer(modifier = Modifier.width(8.dp))
                    TextButton(onClick = onReadAloud) {
                        Text("\uD83D\uDD0A", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
