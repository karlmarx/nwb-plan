package com.nwb.watch.data

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Syncs watch state with the PWA via the Vercel Blob-backed /api/sync endpoint.
 *
 * Pull: GET → merge remote into DataStore (if remote ts > local ts).
 * Push: read DataStore → PUT as JSON.
 */
@Singleton
class SyncClient @Inject constructor(
    private val workoutState: WorkoutState,
) {
    companion object {
        private const val TAG = "SyncClient"
    }

    /** Pull remote state into DataStore. Returns true if local state was updated. */
    suspend fun pull(): Boolean = withContext(Dispatchers.IO) {
        val (url, secret) = credentials() ?: return@withContext false
        try {
            val conn = (URL("$url/api/sync").openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                setRequestProperty("Authorization", "Bearer $secret")
                connectTimeout = 10_000
                readTimeout = 10_000
            }
            val code = conn.responseCode
            if (code == 204) return@withContext false // no remote state yet
            if (code != 200) {
                Log.w(TAG, "pull: HTTP $code")
                return@withContext false
            }
            val body = conn.inputStream.bufferedReader().readText()
            conn.disconnect()

            val json = JSONObject(body)
            val remoteTs = json.optLong("ts", 0)
            val localTs = workoutState.syncTs.first()
            if (remoteTs <= localTs) return@withContext false

            // Apply remote state
            applyRemote(json)
            workoutState.setSyncTs(remoteTs)
            Log.i(TAG, "pull: applied remote state (ts=$remoteTs)")
            true
        } catch (e: Exception) {
            Log.e(TAG, "pull failed", e)
            false
        }
    }

    /** Push current DataStore state to remote (pull-merge-push to preserve PWA-only fields). */
    suspend fun push(): Unit = withContext(Dispatchers.IO) {
        val (url, secret) = credentials() ?: return@withContext
        try {
            // Pull current remote so we don't clobber PWA-only fields
            val remote = fetchRemote(url, secret)
            val json = buildPayload(remote)
            val conn = (URL("$url/api/sync").openConnection() as HttpURLConnection).apply {
                requestMethod = "PUT"
                setRequestProperty("Authorization", "Bearer $secret")
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 10_000
                readTimeout = 10_000
            }
            conn.outputStream.bufferedWriter().use { it.write(json.toString()) }
            val code = conn.responseCode
            conn.disconnect()
            if (code in 200..299) {
                workoutState.setSyncTs(json.getLong("ts"))
                Log.i(TAG, "push: success")
            } else {
                Log.w(TAG, "push: HTTP $code")
            }
        } catch (e: Exception) {
            Log.e(TAG, "push failed", e)
        }
    }

    /** Fetch the current remote state (GET), or null if none exists. */
    private fun fetchRemote(url: String, secret: String): JSONObject? {
        val conn = (URL("$url/api/sync").openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            setRequestProperty("Authorization", "Bearer $secret")
            connectTimeout = 10_000
            readTimeout = 10_000
        }
        return try {
            val code = conn.responseCode
            if (code == 200) {
                val body = conn.inputStream.bufferedReader().readText()
                JSONObject(body)
            } else null
        } catch (_: Exception) {
            null
        } finally {
            conn.disconnect()
        }
    }

    // ─── Internals ────────────────────────────────────────────────

    private data class Credentials(val url: String, val secret: String)

    private suspend fun credentials(): Credentials? {
        val secret = workoutState.syncSecret.first() ?: return null
        val url = workoutState.syncUrl.first() ?: return null
        if (secret.isBlank() || url.isBlank()) return null
        return Credentials(url.trimEnd('/'), secret)
    }

    private suspend fun applyRemote(json: JSONObject) {
        // Swaps
        json.optJSONObject("swaps")?.let {
            workoutState.setSwapsJson(it.toString())
        }
        // Supplements
        json.optJSONObject("supplements")?.let { supp ->
            workoutState.setSupplementLeftLeg(supp.optBoolean("leftLeg", true))
            workoutState.setSupplementCore(supp.optBoolean("core", true))
        }
        // Program start
        if (json.has("programStartEpoch") && !json.isNull("programStartEpoch")) {
            workoutState.setProgramStartEpoch(json.getLong("programStartEpoch"))
        }
        // Settings
        if (json.has("ttsEnabled")) {
            workoutState.setTtsEnabled(json.getBoolean("ttsEnabled"))
        }
        if (json.has("hapticsEnabled")) {
            workoutState.setHapticsEnabled(json.getBoolean("hapticsEnabled"))
        }
        // Active workout
        json.optJSONObject("activeWorkout")?.let { aw ->
            val key = aw.optString("key", "")
            if (key.isNotBlank()) {
                workoutState.startWorkout(key)
                val idx = aw.optInt("exerciseIndex", 0)
                if (idx > 0) workoutState.advanceExercise(idx)
            }
        }
        if (json.isNull("activeWorkout")) {
            // Remote says no active workout — end ours if running
            val localActive = workoutState.activeWorkoutKey.first()
            if (localActive != null) workoutState.endWorkout()
        }
    }

    /** Build payload, preserving PWA-only fields from [remote] base. */
    private suspend fun buildPayload(remote: JSONObject?): JSONObject {
        val ts = System.currentTimeMillis()
        val swaps = try {
            JSONObject(workoutState.swapsJson.first())
        } catch (_: Exception) {
            JSONObject()
        }
        val activeKey = workoutState.activeWorkoutKey.first()
        val activeWorkout = if (activeKey != null) {
            JSONObject().apply {
                put("key", activeKey)
                put("exerciseIndex", workoutState.activeExerciseIndex.first())
                put("completedSets", workoutState.completedSets.first())
            }
        } else {
            JSONObject.NULL
        }

        // Start from remote (preserves equipment, machines, nearby, etc.)
        val base = remote ?: JSONObject()
        return base.apply {
            put("v", 1)
            put("ts", ts)
            put("swaps", swaps)
            put("supplements", JSONObject().apply {
                put("leftLeg", workoutState.supplementLeftLeg.first())
                put("core", workoutState.supplementCore.first())
            })
            put("programStartEpoch", workoutState.programStartEpoch.first() ?: JSONObject.NULL)
            put("activeWorkout", activeWorkout)
            put("ttsEnabled", workoutState.ttsEnabled.first())
            put("hapticsEnabled", workoutState.hapticsEnabled.first())
        }
    }
}
