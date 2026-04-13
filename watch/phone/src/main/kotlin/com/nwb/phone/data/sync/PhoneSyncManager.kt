package com.nwb.phone.data.sync

import android.content.Context
import android.util.Log
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import com.nwb.phone.data.db.WorkoutLogger
import com.nwb.phone.data.model.SyncPayload
import com.nwb.phone.data.model.WorkoutLog
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.tasks.await
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Phone-side sync manager. Receives workout logs from the watch
 * and pushes phone-logged workouts back to the watch.
 */
@Singleton
class PhoneSyncManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val logger: WorkoutLogger,
) : DataClient.OnDataChangedListener {

    companion object {
        private const val TAG = "PhoneSyncManager"
        const val PATH_WORKOUT_SYNC = "/nwb/workout_sync"
        const val PATH_PHONE_SYNC = "/nwb/phone_sync"
        const val KEY_PAYLOAD = "sync_payload"
        const val KEY_TIMESTAMP = "sync_timestamp"
    }

    private val json = Json { ignoreUnknownKeys = true }
    private val dataClient: DataClient by lazy { Wearable.getDataClient(context) }
    private val deviceId: String by lazy {
        android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID,
        ) ?: "unknown_phone"
    }

    private val _syncState = MutableStateFlow(SyncState.IDLE)
    val syncState: StateFlow<SyncState> = _syncState

    private val _lastSyncTime = MutableStateFlow<Long?>(null)
    val lastSyncTime: StateFlow<Long?> = _lastSyncTime

    private val _lastReceivedCount = MutableStateFlow(0)
    val lastReceivedCount: StateFlow<Int> = _lastReceivedCount

    enum class SyncState { IDLE, SYNCING, SUCCESS, ERROR }

    fun startListening() {
        dataClient.addListener(this)
    }

    fun stopListening() {
        dataClient.removeListener(this)
    }

    /**
     * Push phone-logged workouts to the watch.
     */
    suspend fun pushToWatch(): Result<Int> {
        _syncState.value = SyncState.SYNCING
        return try {
            val unsynced = logger.unsyncedToPhone()
            if (unsynced.isEmpty()) {
                _syncState.value = SyncState.SUCCESS
                _lastSyncTime.value = System.currentTimeMillis()
                return Result.success(0)
            }

            val payload = SyncPayload(
                deviceId = deviceId,
                workoutLogs = unsynced,
            )

            val request = PutDataMapRequest.create(PATH_PHONE_SYNC).apply {
                dataMap.putString(KEY_PAYLOAD, json.encodeToString(payload))
                dataMap.putLong(KEY_TIMESTAMP, System.currentTimeMillis())
            }
            request.setUrgent()

            dataClient.putDataItem(request.asPutDataRequest()).await()

            unsynced.forEach { logger.markSyncedToPhone(it.id) }

            _syncState.value = SyncState.SUCCESS
            _lastSyncTime.value = System.currentTimeMillis()
            Log.d(TAG, "Pushed ${unsynced.size} logs to watch")
            Result.success(unsynced.size)
        } catch (e: Exception) {
            Log.e(TAG, "Push to watch failed", e)
            _syncState.value = SyncState.ERROR
            Result.failure(e)
        }
    }

    override fun onDataChanged(events: DataEventBuffer) {
        events.forEach { event ->
            if (event.type == DataEvent.TYPE_CHANGED) {
                when (event.dataItem.uri.path) {
                    PATH_WORKOUT_SYNC -> handleWatchSync(event.dataItem)
                }
            }
        }
    }

    private fun handleWatchSync(item: com.google.android.gms.wearable.DataItem) {
        try {
            val dataMap = DataMapItem.fromDataItem(item).dataMap
            val payloadStr = dataMap.getString(KEY_PAYLOAD) ?: return
            val payload = json.decodeFromString<SyncPayload>(payloadStr)

            if (payload.deviceId == deviceId) return

            Log.d(TAG, "Received ${payload.workoutLogs.size} logs from watch")
            _lastReceivedCount.value = payload.workoutLogs.size

            kotlinx.coroutines.runBlocking {
                payload.workoutLogs.forEach { log ->
                    logger.importLog(log.copy(syncedToPhone = true))
                }
            }

            _lastSyncTime.value = System.currentTimeMillis()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to import watch data", e)
        }
    }
}
