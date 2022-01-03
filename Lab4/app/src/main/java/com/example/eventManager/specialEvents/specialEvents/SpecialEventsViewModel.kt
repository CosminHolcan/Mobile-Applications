package com.example.eventManager.specialEvents.specialEvents

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

class SpecialEventListViewModel : ViewModel() {
    private val mutableSpecialEvents = MutableLiveData<List<SpecialEvent>>().apply { value = emptyList() }

    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val specialEvents: LiveData<List<SpecialEvent>> = mutableSpecialEvents
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException


    fun loadSpecialEvents() {
        viewModelScope.launch {
            Log.v(TAG, "loadSpecialEvents...");
            mutableLoading.value = true
            mutableException.value = null
            when (val result = SpecialEventsRepository.loadAll()) {
                is Result.Success -> {
                    Log.d(TAG, "loadSpecialEvents succeeded");
                    mutableSpecialEvents.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadSpecialEvents failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}