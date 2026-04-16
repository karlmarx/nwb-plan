package com.nwb.watch.coaching

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Parses tempo strings (e.g. "4-4-0", "3-1-2") and drives timed
 * haptic + voice beats for each phase of a rep.
 *
 * Tempo format: "eccentric-pause-concentric"
 *   - "4-4-0" = 4s down, 4s hold, explosive up
 *   - "3-1-2" = 3s down, 1s hold, 2s up
 */
@Singleton
class TempoTracker @Inject constructor(
    private val hapticEngine: HapticEngine,
    private val voiceCoach: VoiceCoach,
) {
    data class Tempo(
        val eccentric: Int,  // seconds
        val pause: Int,      // seconds
        val concentric: Int, // seconds
    ) {
        val totalSeconds: Int get() = eccentric + pause + concentric
    }

    private var activeJob: Job? = null

    /** Parse a tempo string like "4-4-0" or "4s up · 4s hold · 4s down". */
    fun parse(tempoString: String?): Tempo? {
        if (tempoString == null) return null

        // Try "X-Y-Z" format first
        val dashParts = tempoString.split("-")
        if (dashParts.size == 3) {
            val nums = dashParts.mapNotNull { it.trim().toIntOrNull() }
            if (nums.size == 3) return Tempo(nums[0], nums[1], nums[2])
        }

        // Try "Xs up · Xs hold · Xs down" format
        val numberPattern = Regex("""(\d+)""")
        val matches = numberPattern.findAll(tempoString).map { it.value.toInt() }.toList()
        if (matches.size >= 3) return Tempo(matches[2], matches[1], matches[0])
        if (matches.size == 2) return Tempo(matches[0], 0, matches[1])

        return null
    }

    /**
     * Start a tempo-guided rep with haptic beats and optional voice counting.
     * Returns when the rep timing is complete.
     */
    fun startRep(tempo: Tempo, scope: CoroutineScope, useVoice: Boolean = false) {
        activeJob?.cancel()
        activeJob = scope.launch {
            // Eccentric phase (lowering)
            if (tempo.eccentric > 0) {
                if (useVoice) voiceCoach.speak("Down", CoachPriority.LOW)
                for (i in 1..tempo.eccentric) {
                    hapticEngine.tempoBeat(120)
                    if (useVoice && i <= 4) {
                        voiceCoach.speak("$i", CoachPriority.LOW)
                    }
                    delay(1000)
                }
            }

            // Pause phase (isometric hold)
            if (tempo.pause > 0) {
                if (useVoice) voiceCoach.speak("Hold", CoachPriority.LOW)
                hapticEngine.doubleTap()
                for (i in 1..tempo.pause) {
                    delay(1000)
                    if (i < tempo.pause) hapticEngine.tick()
                }
            }

            // Concentric phase (lifting)
            if (tempo.concentric > 0) {
                if (useVoice) voiceCoach.speak("Up", CoachPriority.LOW)
                for (i in 1..tempo.concentric) {
                    hapticEngine.tempoBeat(180)
                    delay(1000)
                }
            } else {
                // Explosive concentric — strong single beat
                if (useVoice) voiceCoach.speak("Up", CoachPriority.HIGH)
                hapticEngine.strongPulse()
            }
        }
    }

    fun cancel() {
        activeJob?.cancel()
        activeJob = null
    }
}
