package com.nwb.phone.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkoutLogDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(log: WorkoutLogEntity)

    @Update
    suspend fun update(log: WorkoutLogEntity)

    @Query("SELECT * FROM workout_logs ORDER BY startedAt DESC")
    fun allLogs(): Flow<List<WorkoutLogEntity>>

    @Query("SELECT * FROM workout_logs ORDER BY startedAt DESC LIMIT :limit")
    fun recentLogs(limit: Int = 20): Flow<List<WorkoutLogEntity>>

    @Query("SELECT * FROM workout_logs WHERE id = :id")
    suspend fun getById(id: String): WorkoutLogEntity?

    @Query("SELECT * FROM workout_logs WHERE workoutKey = :key ORDER BY startedAt DESC")
    fun logsByWorkout(key: String): Flow<List<WorkoutLogEntity>>

    @Query("SELECT * FROM workout_logs WHERE syncedToPhone = 0")
    suspend fun unsyncedToPhone(): List<WorkoutLogEntity>

    @Query("SELECT * FROM workout_logs WHERE syncedToHevy = 0 AND completedAt IS NOT NULL")
    suspend fun unsyncedToHevy(): List<WorkoutLogEntity>

    @Query("UPDATE workout_logs SET syncedToPhone = 1 WHERE id = :id")
    suspend fun markSyncedToPhone(id: String)

    @Query("UPDATE workout_logs SET syncedToHevy = 1 WHERE id = :id")
    suspend fun markSyncedToHevy(id: String)

    @Query("DELETE FROM workout_logs WHERE id = :id")
    suspend fun delete(id: String)

    @Query("SELECT COUNT(*) FROM workout_logs WHERE completedAt IS NOT NULL")
    fun completedCount(): Flow<Int>
}

@Dao
interface PersonalRecordDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: PersonalRecordEntity)

    @Query("SELECT * FROM personal_records WHERE exerciseId = :exerciseId")
    suspend fun forExercise(exerciseId: String): List<PersonalRecordEntity>

    @Query("SELECT * FROM personal_records ORDER BY achievedAt DESC")
    fun allRecords(): Flow<List<PersonalRecordEntity>>

    @Query("SELECT * FROM personal_records WHERE exerciseId = :exerciseId AND type = :type")
    suspend fun getRecord(exerciseId: String, type: String): PersonalRecordEntity?
}
