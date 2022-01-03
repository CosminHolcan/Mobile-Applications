package com.example.eventManager.specialEvents.data

import android.util.Log
import com.example.eventManager.core.TAG
import com.example.eventManager.core.Result
import com.example.eventManager.specialEvents.data.remote.SpecialEventsApi

object SpecialEventsRepository {
    private var cachedSpecialEvents: MutableList<SpecialEvent>? = null;

    suspend fun loadAll(): Result<List<SpecialEvent>> {
        if (cachedSpecialEvents != null) {
            Log.v(TAG, "loadAll - return cached special events")
            return Result.Success(cachedSpecialEvents as List<SpecialEvent>);
        }
        try {
            Log.v(TAG, "loadAll - started")
            val specialEvents = SpecialEventsApi.service.find()
            Log.v(TAG, "loadAll - succeeded")
            cachedSpecialEvents = mutableListOf()
            cachedSpecialEvents?.addAll(specialEvents)
            return Result.Success(cachedSpecialEvents as List<SpecialEvent>)
        } catch (e: Exception) {
            Log.w(TAG, "loadAll - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun load(specialEventId: String): Result<SpecialEvent> {
        val specialEvent = cachedSpecialEvents?.find { it._id == specialEventId }
        if (specialEvent != null) {
            Log.v(TAG, "load - return cached specialEvent")
            return Result.Success(specialEvent)
        }
        try {
            Log.v(TAG, "load - started")
            val readSpecialEvent = SpecialEventsApi.service.read(specialEventId)
            Log.v(TAG, "load - succeeded")
            return Result.Success(readSpecialEvent)
        } catch (e: Exception) {
            Log.w(TAG, "load - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun save(specialEvent: SpecialEvent): Result<SpecialEvent> {
        try {
            Log.v(TAG, "save - started")
            val createdSpecialEvent = SpecialEventsApi.service.create(specialEvent)
            Log.v(TAG, "save - succeeded")
            cachedSpecialEvents?.add(createdSpecialEvent)
            return Result.Success(createdSpecialEvent)
        } catch (e: Exception) {
            Log.w(TAG, "save - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun update(specialEvent: SpecialEvent): Result<SpecialEvent> {
        try {
            Log.v(TAG, "update - started")
            val updatedSpecialEvent = SpecialEventsApi.service.update(specialEvent._id, specialEvent)
            val index = cachedSpecialEvents?.indexOfFirst { it._id == specialEvent._id }
            if (index != null) {
                cachedSpecialEvents?.set(index, updatedSpecialEvent)
            }
            Log.v(TAG, "update - succeeded")
            return Result.Success(updatedSpecialEvent)
        } catch (e: Exception) {
            Log.v(TAG, "update - failed")
            return Result.Error(e)
        }
    }
}