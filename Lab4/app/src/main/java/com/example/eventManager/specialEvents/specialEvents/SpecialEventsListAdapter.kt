package com.example.eventManager.specialEvents.specialEvents

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.eventManager.R
import com.example.eventManager.core.TAG
import com.example.eventManager.specialEvents.data.SpecialEvent
import com.example.eventManager.specialEvents.specialEvent.SpecialEventEditFragment
import java.util.*

class SpecialEventsListAdapter(
    private val fragment: Fragment,
) : RecyclerView.Adapter<SpecialEventsListAdapter.ViewHolder>() {

    var specialEvents = emptyList<SpecialEvent>()
        set(value) {
            field = value
            notifyDataSetChanged();
        }

    private var onSpecialEventClick: View.OnClickListener = View.OnClickListener { view ->
        val specialEvent = view.tag as SpecialEvent

        fragment.findNavController().navigate(R.id.SpecialEventEditFragment, Bundle().apply {
            putString(SpecialEventEditFragment.SPECIAL_EVENT_ID, specialEvent._id)
        })
    };

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_special_event, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")

        val specialEvent = specialEvents[position]
        holder.productView.text = specialEvent.title
        holder.priceView.text = specialEvent.numberOfPeople.toString()

        val calendar = Calendar.getInstance()
        calendar.time = specialEvent.date
        val dateString = calendar.get(Calendar.DAY_OF_MONTH).toString() + " " +
                calendar.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale.getDefault()) + " " +
                calendar.get(Calendar.YEAR).toString()

        holder.date.text = dateString

        holder.withCreditCardView.text = if (specialEvent.isApproved) "Approved" else "Not approved yet"

        holder.itemView.tag = specialEvent
        holder.itemView.setOnClickListener(onSpecialEventClick)
    }

    override fun getItemCount() = specialEvents.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val productView: TextView
        val priceView: TextView
        val withCreditCardView: TextView
        val date: TextView

        init {
            productView = view.findViewById(R.id.product)
            priceView = view.findViewById(R.id.price)
            withCreditCardView = view.findViewById(R.id.with_credit_card)
            date = view.findViewById(R.id.date)
        }
    }
}