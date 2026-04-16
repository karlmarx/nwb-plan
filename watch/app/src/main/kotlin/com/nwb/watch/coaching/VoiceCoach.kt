package com.nwb.watch.coaching

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Priority levels for TTS utterances.
 * Higher priority interrupts lower priority speech.
 */
enum class CoachPriority {
    /** Background info (exercise rationale, tips). */
    LOW,
    /** Standard cues (setup, execution instructions). */
    NORMAL,
    /** Navigation announcements (next exercise, rest timer). */
    HIGH,
    /** Safety warnings (NWB cues, caution alerts). Interrupts everything. */
    SAFETY,
}

/**
 * Wraps Android TextToSpeech for workout coaching.
 *
 * Queue cues by priority — safety interrupts everything, normal cues queue,
 * low priority cues are dropped if speech is busy.
 */
@Singleton
class VoiceCoach @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private var tts: TextToSpeech? = null
    private var isReady = false
    private var currentPriority = CoachPriority.LOW

    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking: StateFlow<Boolean> = _isSpeaking

    /** Speed as a float (1.0 = normal). Set from user preference (50-200%). */
    var speechRate: Float = 1.0f
        set(value) {
            field = value
            tts?.setSpeechRate(value)
        }

    /** Whether TTS is enabled (user toggle). */
    var enabled: Boolean = true

    fun initialize() {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale.US
                tts?.setSpeechRate(speechRate)
                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        _isSpeaking.value = true
                    }
                    override fun onDone(utteranceId: String?) {
                        _isSpeaking.value = false
                        currentPriority = CoachPriority.LOW
                    }
                    @Deprecated("Deprecated in API")
                    override fun onError(utteranceId: String?) {
                        _isSpeaking.value = false
                        currentPriority = CoachPriority.LOW
                    }
                })
                isReady = true
            }
        }
    }

    /**
     * Speak a coaching cue.
     *
     * @param text The text to speak.
     * @param priority Priority level. SAFETY interrupts everything.
     */
    fun speak(text: String, priority: CoachPriority = CoachPriority.NORMAL) {
        if (!enabled || !isReady) return

        val queueMode = when {
            priority == CoachPriority.SAFETY -> TextToSpeech.QUEUE_FLUSH
            priority.ordinal > currentPriority.ordinal -> TextToSpeech.QUEUE_FLUSH
            priority == CoachPriority.LOW && _isSpeaking.value -> return // Drop low priority
            else -> TextToSpeech.QUEUE_ADD
        }

        currentPriority = priority
        tts?.speak(text, queueMode, null, "nwb_${System.currentTimeMillis()}")
    }

    /** Announce exercise setup before first set. */
    fun announceExercise(name: String, setup: String) {
        speak(name, CoachPriority.HIGH)
        speak(setup, CoachPriority.NORMAL)
    }

    /** Speak NWB safety cues (highest priority). */
    fun announceSafety(nwbCues: String) {
        speak("Safety reminder.", CoachPriority.SAFETY)
        speak(nwbCues, CoachPriority.SAFETY)
    }

    /** Announce rest period and next exercise. */
    fun announceRest(restSeconds: Int, nextExerciseName: String?) {
        val restText = if (restSeconds >= 60) {
            "${restSeconds / 60} minute${if (restSeconds >= 120) "s" else ""} rest"
        } else {
            "$restSeconds seconds rest"
        }
        speak(restText, CoachPriority.HIGH)
        if (nextExerciseName != null) {
            speak("Next up: $nextExerciseName", CoachPriority.NORMAL)
        }
    }

    /** Announce set completion. */
    fun announceSetDone(completedSets: Int, totalSets: Int) {
        if (completedSets < totalSets) {
            speak("Set $completedSets of $totalSets done.", CoachPriority.HIGH)
        } else {
            speak("All sets complete.", CoachPriority.HIGH)
        }
    }

    /** Announce rest timer warnings. */
    fun announceRestWarning(secondsRemaining: Int) {
        when (secondsRemaining) {
            30 -> speak("30 seconds.", CoachPriority.NORMAL)
            10 -> speak("10 seconds.", CoachPriority.HIGH)
            0 -> speak("Time. Let's go.", CoachPriority.HIGH)
        }
    }

    /** Announce workout completion. */
    fun announceWorkoutComplete(workoutTitle: String) {
        speak("$workoutTitle complete. Nice work.", CoachPriority.HIGH)
    }

    fun stop() {
        tts?.stop()
        _isSpeaking.value = false
        currentPriority = CoachPriority.LOW
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isReady = false
        _isSpeaking.value = false
    }
}
