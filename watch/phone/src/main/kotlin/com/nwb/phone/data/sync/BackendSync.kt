package com.nwb.phone.data.sync

import android.content.Context
import android.util.Log
import com.nwb.phone.data.db.WorkoutLogger
import com.nwb.phone.data.model.WorkoutLog
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Thin layer that pushes completed workouts to the Python backend
 * when the user is logged in via GitHub.
 *
 * Strategy:
 * - Room DB is ALWAYS the source of truth (works offline, no auth needed)
 * - After each workout completion, if logged in, push to backend
 * - "Sync" button on demand pushes all un-synced logs
 * - If not logged in, everything still works via Room (localStorage equivalent)
 */
@Singleton
class BackendSync @Inject constructor(
    @ApplicationContext context: Context,
    private val logger: WorkoutLogger,
) {
    companion object {
        private const val TAG = "BackendSync"
    }

    val apiClient = ApiClient(context)

    val isLoggedIn: Boolean get() = apiClient.isLoggedIn

    /**
     * Push a single completed workout to the backend.
     * No-op if not logged in. Never throws — logs errors silently.
     */
    suspend fun pushIfLoggedIn(log: WorkoutLog) {
        if (!apiClient.isLoggedIn) return
        withContext(Dispatchers.IO) {
            try {
                apiClient.pushWorkout(log)
                Log.d(TAG, "Pushed workout ${log.id} to backend")
            } catch (e: Exception) {
                Log.w(TAG, "Backend push failed (will retry on next sync): ${e.message}")
            }
        }
    }

    /**
     * Push all un-synced workouts to the backend.
     * Returns count pushed, or -1 if not logged in.
     */
    suspend fun syncAll(): Int {
        if (!apiClient.isLoggedIn) return -1
        val unsynced = logger.unsyncedToPhone() // Reuse existing "unsynced" query
        var pushed = 0
        for (log in unsynced) {
            if (apiClient.pushWorkout(log)) {
                logger.markSyncedToPhone(log.id)
                pushed++
            }
        }
        Log.d(TAG, "Synced $pushed/${unsynced.size} workouts to backend")
        return pushed
    }

    /**
     * Trigger Hevy sync via the backend (backend has the Hevy API key).
     * Returns count synced to Hevy, or -1 if not logged in / no key.
     */
    suspend fun syncToHevy(): Int {
        return apiClient.syncToHevy()
    }

    /** Store the Hevy API key on the backend. */
    suspend fun setHevyKey(key: String): Boolean {
        return apiClient.setHevyKey(key)
    }

    /** Get the GitHub OAuth login URL. */
    fun getLoginUrl(): String = apiClient.getLoginUrl()

    /** Save auth token after OAuth callback. */
    fun saveAuth(token: String, username: String, avatarUrl: String?) {
        apiClient.saveAuth(token, username, avatarUrl)
    }

    /** Log out — clears token. Room data stays. */
    fun logout() {
        apiClient.clearAuth()
    }
}
