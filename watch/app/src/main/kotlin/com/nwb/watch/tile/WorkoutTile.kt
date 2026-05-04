package com.nwb.watch.tile

import android.content.Context
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.protolayout.material.Text
import androidx.wear.protolayout.material.Typography
import androidx.wear.protolayout.material.layouts.PrimaryLayout
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import com.nwb.watch.data.ExerciseRepository
import com.nwb.watch.data.WorkoutScheduler
import com.nwb.watch.data.WorkoutState
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

/**
 * Wear OS Tile showing today's workout at a glance.
 * Swipe from the watch face to see current workout + tap to launch.
 *
 * Note: This is a simplified tile implementation. In production,
 * use SuspendingTileService from Horologist for coroutine support.
 */
@AndroidEntryPoint
class WorkoutTileService : androidx.wear.tiles.TileService() {

    @Inject lateinit var scheduler: WorkoutScheduler
    @Inject lateinit var repository: ExerciseRepository
    @Inject lateinit var workoutState: WorkoutState

    private val RESOURCES_VERSION = "1"

    override fun onTileRequest(
        requestParams: RequestBuilders.TileRequest
    ): ListenableFuture<TileBuilders.Tile> {
        val today = java.time.LocalDate.now()
        val epoch = runBlocking { workoutState.programStartEpoch.first() }
        val startDate = scheduler.programStartDate(epoch)
        val title = scheduler.todayWorkoutTitle(today)
        val phase = scheduler.currentPhase(today, startDate)
        val week = scheduler.currentWeek(today, startDate)
        val exerciseCount = scheduler.todayExercises(today, startDate).size

            val layout = PrimaryLayout.Builder(requestParams.deviceConfiguration)
                .setContent(
                    LayoutElementBuilders.Column.Builder()
                        .setWidth(expand())
                        .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                        .addContent(
                            Text.Builder(this@WorkoutTileService, title)
                                .setTypography(Typography.TYPOGRAPHY_TITLE3)
                                .setColor(argb(0xFF38BDF8.toInt()))
                                .build()
                        )
                        .addContent(
                            Text.Builder(
                                this@WorkoutTileService,
                                "${phase.name} · Week $week"
                            )
                                .setTypography(Typography.TYPOGRAPHY_CAPTION1)
                                .setColor(argb(0xFF64748B.toInt()))
                                .build()
                        )
                        .addContent(
                            Text.Builder(
                                this@WorkoutTileService,
                                "$exerciseCount exercises"
                            )
                                .setTypography(Typography.TYPOGRAPHY_BODY2)
                                .setColor(argb(0xFFE2E8F0.toInt()))
                                .build()
                        )
                        .build()
                )
                .setPrimaryLabelTextContent(
                    Text.Builder(this@WorkoutTileService, "NWB Workout")
                        .setTypography(Typography.TYPOGRAPHY_CAPTION1)
                        .setColor(argb(0xFF64748B.toInt()))
                        .build()
                )
                .build()

            val singleTileTimeline = TimelineBuilders.Timeline.Builder()
                .addTimelineEntry(
                    TimelineBuilders.TimelineEntry.Builder()
                        .setLayout(
                            LayoutElementBuilders.Layout.Builder()
                                .setRoot(layout)
                                .build()
                        )
                        .build()
                )
                .build()

        val tile = TileBuilders.Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setTileTimeline(singleTileTimeline)
            .setFreshnessIntervalMillis(3600000) // Refresh every hour
            .build()
        return Futures.immediateFuture(tile)
    }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest
    ): ListenableFuture<ResourceBuilders.Resources> {
        val resources = ResourceBuilders.Resources.Builder()
            .setVersion(RESOURCES_VERSION)
            .build()
        return Futures.immediateFuture(resources)
    }
}
