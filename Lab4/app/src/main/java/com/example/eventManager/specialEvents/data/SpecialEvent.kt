package com.example.eventManager.specialEvents.data

import java.util.*

data class SpecialEvent(
    var _id: String,
    var title: String,
    var numberOfPeople: Int,
    var date: Date,
    var isApproved: Boolean
) {
    override fun toString(): String = title
}