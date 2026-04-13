package com.nwb.phone.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(
    entities = [WorkoutLogEntity::class, PersonalRecordEntity::class],
    version = 1,
    exportSchema = false,
)
@TypeConverters(WorkoutLogConverters::class)
abstract class NwbDatabase : RoomDatabase() {
    abstract fun workoutLogDao(): WorkoutLogDao
    abstract fun personalRecordDao(): PersonalRecordDao

    companion object {
        fun create(context: Context): NwbDatabase =
            Room.databaseBuilder(context, NwbDatabase::class.java, "nwb_workout.db")
                .fallbackToDestructiveMigration()
                .build()
    }
}
