package com.nwb.watch.data.sync

import android.content.Context
import android.util.Log
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import com.nwb.watch.data.db.WorkoutLogger
import com.nwb.watch.data.model.SyncPayload
import com.nwb.watch.data.model.WorkoutLog
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.tasks.await
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages sync between watch and phone via Wear Data Layer API.
 *
 * Sync flow:
 * 1. User taps "Sync" button → pushWorkoutLogs()
 * 2. Unsynced logs are serialized and pushed to Data Layer
 * 3. Phone receives DataChanged event → imports logs
 * 4. Phone pushes back any logs from phone side
 * 5. Watch receives DataChanged → imports phone logs
 *
 * Uses DataItems (auto-sync when devices reconnect) rather than
 * Messages (fire-and-forget, requires connection).
 */
@Singleton
class SyncManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val logger: WorkoutLogger,
) : DataClient.OnDataChangedListener {

    companion object {
        private const val TAG = "SyncManager"
        const val PATH_WORKOUT_SYNC = "/nwb/workout_sync"
        const val PATH_SYNC_ACK = "/nwb/sync_ack"
        const val KEY_PAYLOAD = "sync_payload"
        const val KEY_TIMESTAMP = "sync_timestamp"
    }

    private val json = Json { ignoreUnknownKeys = true }
    private val dataClient: DataClient by lazy { Wearable.getDataClient(context) }
    private val deviceId: String by lazy {
        android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ) ?: "unknown"
    }

    private val _syncState = MutableStateFlow(SyncState.IDLE)
    val syncState: StateFlow<SyncState> = _syncState

    private val _lastSyncTime = MutableStateFlow<Long?>(null)
    val lastSyncTime: StateFlow<Long?> = _lastSyncTime

    enum class SyncState { IDLE, SYNCING, SUCCESS, ERROR }

    fun startListening() {
        dataClient.addListener(this)
    }

    fun stopListening() {
        dataClient.removeListener(this)
    }

    /**
     * Push unsynced workout logs to the connected phone/watch.
     * Called when user taps the sync button.
     */
    suspend fun pushWorkoutLogs(): Result<Int> {
        _syncState.value = SyncState.SYNCING
        return try {
            val unsynced = logger.unsyncedToPhone()
            if (unsynced.isEmpty()) {
                _syncState.value = SyncState.SUCCESS
                _lastSyncTime.value = System.currentTimeMillis()
                return Result.success(0)
            }

            val prs = logger.allRecords().let { flow ->
                // Collect current PRs snapshot
                val list = mutableListOf<com.nwb.watch.data.model.PersonalRecord>()
                // Simple one-shot collect
                list
            }

            val payload = SyncPayload(
                deviceId = deviceId,
                workoutLogs = unsynced,
            )

            val request = PutDataMapRequest.create(PATH_WORKOUT_SYNC).apply {
                dataMap.putString(KEY_PAYLOAD, json.encodeToString(payload))
                dataMap.putLong(KEY_TIMESTAMP, System.currentTimeMillis())
            }
            request.setUrgent()

            dataClient.putDataItem(request.asPutDataRequest()).await()

            // Mark as synced locally
            unsynced.forEach { log ->
                logger.markSyncedToPhone(log.id)
            }

            _syncState.value = SyncState.SUCCESS
            _lastSyncTime.value = System.currentTimeMillis()
            Log.d(TAG, "Pushed ${unsynced.size} workout logs")
            Result.success(unsynced.size)
        } catch (e: Exception) {
            Log.e(TAG, "Sync failed", e)
            _syncState.value = SyncState.ERROR
            Result.failure(e)
        }
    }

    /**
     * Handle incoming data from connected device.
     */
    override fun onDataChanged(events: DataEventBuffer) {
        events.forEach { event ->
            if (event.type == DataEvent.TYPE_CHANGED) {
                val item = event.dataItem
                when (item.uri.path) {
                    PATH_WORKOUT_SYNC -> handleIncomingSync(item)
                    PATH_SYNC_ACK -> handleSyncAck()
                }
            }
        }
    }

    private fun handleIncomingSync(item: com.google.android.gms.wearable.DataItem) {
        try {
            val dataMap = DataMapItem.fromDataItem(item).dataMap
            val payloadStr = dataMap.getString(KEY_PAYLOAD) ?: return
            val payload = json.decodeFromString<SyncPayload>(payloadStr)

            // Don't import our own data
            if (payload.deviceId == deviceId) return

            Log.d(TAG, "Received ${payload.workoutLogs.size} logs from ${payload.deviceId}")

            // Import each log (WorkoutLogger handles dedup via REPLACE)
            kotlinx.coroutines.runBlocking {
                payload.workoutLogs.forEach { log ->
                    logger.importLog(log.copy(syncedToPhone = true))
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to process incoming sync", e)
        }
    }

    private fun handleSyncAck() {
        _lastSyncTime.value = System.currentTimeMillis()
    }
}
