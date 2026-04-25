package com.nwb.watch.di

import android.content.Context
import com.nwb.watch.coaching.HapticEngine
import com.nwb.watch.coaching.TempoTracker
import com.nwb.watch.coaching.VoiceCoach
import com.nwb.watch.data.ExerciseRepository
import com.nwb.watch.data.SyncClient
import com.nwb.watch.data.WorkoutScheduler
import com.nwb.watch.data.WorkoutState
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

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
    fun provideWorkoutState(
        @ApplicationContext context: Context,
    ): WorkoutState = WorkoutState(context)

    @Provides
    @Singleton
    fun provideSyncClient(
        workoutState: WorkoutState,
    ): SyncClient = SyncClient(workoutState)

    @Provides
    @Singleton
    fun provideVoiceCoach(
        @ApplicationContext context: Context,
    ): VoiceCoach = VoiceCoach(context)

    @Provides
    @Singleton
    fun provideHapticEngine(
        @ApplicationContext context: Context,
    ): HapticEngine = HapticEngine(context)

    @Provides
    @Singleton
    fun provideTempoTracker(
        hapticEngine: HapticEngine,
        voiceCoach: VoiceCoach,
    ): TempoTracker = TempoTracker(hapticEngine, voiceCoach)
}
