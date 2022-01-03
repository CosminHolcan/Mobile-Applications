package com.example.eventManager.specialEvents.specialEvent

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.eventManager.core.TAG
import com.example.eventManager.databinding.FragmentSpecialEventEditBinding
import java.util.*
import java.util.Calendar.*


/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class SpecialEventEditFragment : Fragment() {

    companion object {
        const val SPECIAL_EVENT_ID = "SPECIAL_EVENT_ID"
    }

    private lateinit var viewModel: SpecialEventEditViewModel
    private var specialEventId: String? = null

    private var _binding: FragmentSpecialEventEditBinding? = null

    private val binding get() = _binding!!


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        Log.i(TAG, "onCreateView")
        arguments?.let {
            if (it.containsKey(SPECIAL_EVENT_ID)) {
                specialEventId = it.getString(SPECIAL_EVENT_ID).toString()
            }
        }

        _binding = FragmentSpecialEventEditBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Log.i(TAG, "onViewCreated")
        setupViewModel()
        binding.fab.setOnClickListener {
            Log.v(TAG, "Save special event")

            val product = binding.specialEventTitle.text.toString()
            val price = Integer.parseInt(binding.specialEventNumberOfPeople.text.toString())


            val day: Int = binding.specialEventDate.dayOfMonth
            val month: Int = binding.specialEventDate.month
            val year: Int = binding.specialEventDate.year

            val calendar: Calendar = Calendar.getInstance()
            calendar.set(year, month, day)
            val date = calendar.time


            val withCreditCard = binding.specialEventIsApproved.isChecked

            viewModel.saveOrUpdateSpecialEvent(product, price, date, withCreditCard)
        }

    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }


    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(SpecialEventEditViewModel::class.java)

        viewModel.specialEvent.observe(viewLifecycleOwner, { specialEvent ->
            Log.v(TAG, "update items")
            binding.specialEventTitle.setText(specialEvent.title)
            binding.specialEventNumberOfPeople.setText(specialEvent.numberOfPeople.toString())
            binding.specialEventIsApproved.isChecked = specialEvent.isApproved


            val calendar = Calendar.getInstance()
            calendar.time = specialEvent.date

            binding.specialEventDate.updateDate(calendar.get(YEAR), calendar.get(MONTH), calendar.get(
                DAY_OF_MONTH))

        })

        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            binding.progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })

        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        })

        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigateUp()
            }
        })
        val id = specialEventId
        if (id != null) {
            viewModel.loadSpecialEvent(id)
        }
    }
}