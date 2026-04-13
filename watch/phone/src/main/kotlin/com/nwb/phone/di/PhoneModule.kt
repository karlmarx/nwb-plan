package com.nwb.phone.di

import android.content.Context
import com.nwb.phone.data.ExerciseRepository
import com.nwb.phone.data.WorkoutScheduler
import com.nwb.phone.data.db.NwbDatabase
import com.nwb.phone.data.db.PersonalRecordDao
import com.nwb.phone.data.db.WorkoutLogDao
import com.nwb.phone.data.db.WorkoutLogger
import com.nwb.phone.data.sync.HevySyncService
import com.nwb.phone.data.sync.PhoneSyncManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object PhoneModule {

    @Provides
    @Singleton
    fun provideExerciseRepository(
        @ApplicationContext context: Context,
    ): ExerciseRepository = ExerciseRepository(context)

    @Provides
    @Singleton
    fun provideWorkoutScheduler(
        repository: ExerciseRepository,
    ): WorkoutScheduler = WorkoutScheduler(repository)

    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context,
    ): NwbDatabase = NwbDatabase.create(context)

    @Provides
    fun provideWorkoutLogDao(db: NwbDatabase): WorkoutLogDao = db.workoutLogDao()

    @Provides
    fun providePersonalRecordDao(db: NwbDatabase): PersonalRecordDao = db.personalRecordDao()

    @Provides
    @Singleton
    fun provideWorkoutLogger(
        logDao: WorkoutLogDao,
        prDao: PersonalRecordDao,
    ): WorkoutLogger = WorkoutLogger(logDao, prDao)

    @Provides
    @Singleton
    fun providePhoneSyncManager(
        @ApplicationContext context: Context,
        logger: WorkoutLogger,
    ): PhoneSyncManager = PhoneSyncManager(context, logger)

    @Provides
    @Singleton
    fun provideHevySyncService(
        logger: WorkoutLogger,
    ): HevySyncService = HevySyncService(logger)
}
