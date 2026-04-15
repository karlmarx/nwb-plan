package com.nwb.watch.coaching

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Haptic feedback patterns for workout coaching on Wear OS.
 *
 * Uses VibrationEffect API for precise patterns:
 * - Tempo beats for eccentric/concentric counting
 * - Rest timer warnings (escalating)
 * - Set completion confirmation
 * - Safety alerts for caution exercises
 */
@Singleton
class HapticEngine @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val vibrator: Vibrator by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val mgr = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            mgr.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    var enabled: Boolean = true

    /** Light tap — tempo beat, set marker. */
    fun tick() {
        if (!enabled) return
        vibrator.vibrate(
            VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE)
        )
    }

    /** Double tap — set start / exercise transition. */
    fun doubleTap() {
        if (!enabled) return
        vibrator.vibrate(
            VibrationEffect.createWaveform(
                longArrayOf(0, 50, 80, 50),
                intArrayOf(0, 180, 0, 180),
                -1
            )
        )
    }

    /** Strong pulse — rest timer done, time to go. */
    fun strongPulse() {
        if (!enabled) return
        vibrator.vibrate(
            VibrationEffect.createOneShot(200, 255)
        )
    }

    /** Gentle reminder — 30 seconds remaining in rest. */
    fun gentleReminder() {
        if (!enabled) return
        vibrator.vibrate(
            VibrationEffect.createOneShot(80, 100)
        )
    }

    /**
     * Escalating warning — 10 seconds remaining.
     * Three quick pulses getting stronger.
     */
    fun escalatingWarning() {
        if (!enabled) return
        vibrator.vibrate(
            VibrationEffect.createWaveform(
                longArrayOf(0, 60, 100, 80, 100, 100),
                intArrayOf(0, 80, 0, 140, 0, 220),
                -1
            )
        )
    }

    /**
     * Safety alert — caution exercise warning.
     * Long vibration to get attention.
     */
    fun safetyAlert() {
        if (!enabled) return
        vibrator.vibrate(
            VibrationEffect.createWaveform(
                longArrayOf(0, 300, 150, 300),
                intArrayOf(0, 255, 0, 255),
                -1
            )
        )
    }

    /** Workout complete — celebration pattern. */
    fun workoutComplete() {
        if (!enabled) return
        vibrator.vibrate(
            VibrationEffect.createWaveform(
                longArrayOf(0, 100, 80, 100, 80, 200),
                intArrayOf(0, 200, 0, 200, 0, 255),
                -1
            )
        )
    }

    /**
     * Tempo beat — single tick at a specific intensity.
     * Used by TempoTracker for eccentric/concentric counting.
     */
    fun tempoBeat(intensity: Int = 150) {
        if (!enabled) return
        vibrator.vibrate(
            VibrationEffect.createOneShot(50, intensity.coerceIn(1, 255))
        )
    }

    fun cancel() {
        vibrator.cancel()
    }
}
