package com.nwb.watch

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.lifecycle.LifecycleService

/**
 * Foreground service that keeps the workout session alive when the
 * watch screen dims or the user checks the time.
 *
 * Wear OS aggressively kills background apps — this service prevents
 * the workout state from being lost mid-session.
 */
class WorkoutService : LifecycleService() {

    companion object {
        const val CHANNEL_ID = "nwb_workout"
        const val NOTIFICATION_ID = 1
        const val ACTION_START = "com.nwb.watch.START_WORKOUT"
        const val ACTION_STOP = "com.nwb.watch.STOP_WORKOUT"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)

        when (intent?.action) {
            ACTION_STOP -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
        }

        val notification = buildNotification("Workout in progress")
        startForeground(NOTIFICATION_ID, notification)

        return START_STICKY
    }

    override fun onBind(intent: Intent): IBinder? {
        super.onBind(intent)
        return null
    }

    fun updateNotification(exerciseName: String, setsProgress: String) {
        val notification = buildNotification("$exerciseName · $setsProgress")
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun buildNotification(text: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("NWB Workout")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setCategory(NotificationCompat.CATEGORY_WORKOUT)
            .build()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Workout Session",
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = "Active workout session tracking"
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }
}
