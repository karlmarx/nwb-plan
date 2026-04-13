package com.nwb.watch.data.sync

import android.content.Context
import android.content.SharedPreferences
import com.nwb.watch.data.model.ExerciseLog
import com.nwb.watch.data.model.WorkoutLog
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

/**
 * HTTP client for the NWB Python backend API.
 *
 * - If the user is logged in (has a token), persists to the backend DB.
 * - If not logged in, all methods return null and the caller falls back to localStorage.
 *
 * No OkHttp dependency — uses stdlib HttpURLConnection (Wear OS has limited classpath).
 */
class ApiClient(context: Context) {

    companion object {
        private const val PREFS_NAME = "nwb_auth"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USERNAME = "github_username"
        private const val KEY_AVATAR = "github_avatar"
        // Default to local dev; override via settings
        private const val DEFAULT_API_URL = "https://me.93.fyi"
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    var apiUrl: String
        get() = prefs.getString("api_url", DEFAULT_API_URL) ?: DEFAULT_API_URL
        set(value) = prefs.edit().putString("api_url", value).apply()

    // ── Auth state ──

    val isLoggedIn: Boolean get() = prefs.getString(KEY_TOKEN, null) != null

    val token: String? get() = prefs.getString(KEY_TOKEN, null)

    val username: String? get() = prefs.getString(KEY_USERNAME, null)

    val avatarUrl: String? get() = prefs.getString(KEY_AVATAR, null)

    fun saveAuth(token: String, username: String, avatarUrl: String?) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_USERNAME, username)
            .putString(KEY_AVATAR, avatarUrl)
            .apply()
    }

    fun clearAuth() {
        prefs.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_USERNAME)
            .remove(KEY_AVATAR)
            .apply()
    }

    /** URL to open in a browser to start GitHub OAuth. */
    fun getLoginUrl(): String {
        // The "state" param tells the backend where to redirect after auth.
        // For the watch, we use a deep link that the phone companion will handle.
        return "$apiUrl/auth/github?redirect=nwb://auth"
    }

    // ── Workout API ──

    /**
     * Push a workout log to the backend. Returns true on success, false if not logged in or error.
     */
    suspend fun pushWorkout(log: WorkoutLog): Boolean {
        if (!isLoggedIn) return false
        val body = json.encodeToString(log)
        val resp = post("/workouts", body) ?: return false
        return resp.first in 200..201
    }

    /**
     * Fetch recent workout logs from the backend.
     * Returns null if not logged in.
     */
    suspend fun fetchWorkouts(limit: Int = 30): List<WorkoutLog>? {
        if (!isLoggedIn) return null
        val resp = get("/workouts?limit=$limit") ?: return null
        if (resp.first != 200) return null
        return try {
            json.decodeFromString<List<WorkoutLog>>(resp.second)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Trigger Hevy sync on the backend.
     * Returns number of workouts synced, or -1 on error.
     */
    suspend fun syncToHevy(): Int {
        if (!isLoggedIn) return -1
        val resp = post("/sync/hevy", "{}") ?: return -1
        if (resp.first != 200) return -1
        return try {
            val result = json.decodeFromString<SyncResult>(resp.second)
            result.synced
        } catch (e: Exception) {
            -1
        }
    }

    /** Store the user's Hevy API key on the backend. */
    suspend fun setHevyKey(key: String): Boolean {
        if (!isLoggedIn) return false
        val body = """{"hevy_api_key":"$key"}"""
        val resp = put("/auth/hevy-key", body) ?: return false
        return resp.first == 200
    }

    // ── HTTP helpers ──

    private suspend fun get(path: String): Pair<Int, String>? =
        request("GET", path, null)

    private suspend fun post(path: String, body: String): Pair<Int, String>? =
        request("POST", path, body)

    private suspend fun put(path: String, body: String): Pair<Int, String>? =
        request("PUT", path, body)

    private suspend fun request(
        method: String,
        path: String,
        body: String?,
    ): Pair<Int, String>? = withContext(Dispatchers.IO) {
        try {
            val url = URL("$apiUrl$path")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = method
            conn.setRequestProperty("Content-Type", "application/json")
            conn.connectTimeout = 10_000
            conn.readTimeout = 10_000

            token?.let { conn.setRequestProperty("Authorization", "Bearer $it") }

            if (body != null && method != "GET") {
                conn.doOutput = true
                OutputStreamWriter(conn.outputStream).use { it.write(body) }
            }

            val code = conn.responseCode
            val responseBody = try {
                conn.inputStream.bufferedReader().use { it.readText() }
            } catch (e: Exception) {
                conn.errorStream?.bufferedReader()?.use { it.readText() } ?: ""
            }

            Pair(code, responseBody)
        } catch (e: Exception) {
            null // Network error — caller falls back to local
        }
    }

    @Serializable
    private data class SyncResult(val synced: Int = 0, val total: Int = 0)
}
