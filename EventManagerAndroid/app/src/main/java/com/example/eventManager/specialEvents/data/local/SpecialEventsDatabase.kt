package com.example.eventManager.specialEvents.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.eventManager.specialEvents.data.SpecialEvent
import kotlinx.coroutines.CoroutineScope

@Database(entities = [SpecialEvent::class], version = 1)
@TypeConverters(Converters::class)
abstract class SpecialEventsDatabase : RoomDatabase() {

    abstract fun specialEventDao(): SpecialEventDao

    companion object {
        @Volatile
        private var INSTANCE: SpecialEventsDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): SpecialEventsDatabase {
            val inst = INSTANCE
            if (inst != null) {
                return inst
            }
            val instance =
                Room.databaseBuilder(
                    context.applicationContext,
                    SpecialEventsDatabase::class.java,
                    "specialEvents_db"
                )
                    //.addCallback(WordDatabaseCallback(scope))
                    .build()
            INSTANCE = instance
            return instance
        }
    }

}