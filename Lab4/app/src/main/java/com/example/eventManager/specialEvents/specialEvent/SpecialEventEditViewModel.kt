package com.example.eventManager.specialEvents.specialEvent

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.eventManager.core.TAG
import com.example.eventManager.specialEvents.data.SpecialEvent
import com.example.eventManager.specialEvents.data.SpecialEventsRepository
import kotlinx.coroutines.launch
import com.example.eventManager.core.Result
import java.util.*

class SpecialEventEditViewModel : ViewModel() {
    private val mutableSpecialEvent = MutableLiveData<SpecialEvent>().apply { value = SpecialEvent("", "", 0, Date(),false) }

    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val specialEvent: LiveData<SpecialEvent> = mutableSpecialEvent

    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    fun loadSpecialEvent(specialEventId: String) {
        viewModelScope.launch {
            Log.i(TAG, "loadSpecialEvent...")
            mutableFetching.value = true
            mutableException.value = null
            when (val result = SpecialEventsRepository.load(specialEventId)) {
                is Result.Success -> {
                    Log.d(TAG, "loadSpecialEvent succeeded");
                    mutableSpecialEvent.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadSpecialEvent failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableFetching.value = false
        }
    }

    fun saveOrUpdateSpecialEvent(title: String, numberOfPeople: Int, date:Date, isApproved: Boolean) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateSpecialEvent...");

            val specialEvent = mutableSpecialEvent.value ?: return@launch
            specialEvent.title = title
            specialEvent.numberOfPeople = numberOfPeople
            specialEvent.isApproved = isApproved
            specialEvent.date = date

            mutableFetching.value = true
            mutableException.value = null

            val result: Result<SpecialEvent>
            if (specialEvent._id.isNotEmpty()) {
                result = SpecialEventsRepository.update(specialEvent)
            } else {
                var id = generateRandomString(10)
                specialEvent._id = id
                result = SpecialEventsRepository.save(specialEvent)
            }
            when (result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateSpecialEvent succeeded");
                    mutableSpecialEvent.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdateSpecialEvent failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }

    fun generateRandomString(length: Int) : String {
        val allowedChars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
        return (1..length)
            .map { allowedChars.random() }
            .joinToString("")
    }
}