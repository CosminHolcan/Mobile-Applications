package com.example.eventManager.specialEvents.specialEvents

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.eventManager.MainActivity
import com.example.eventManager.R
import com.example.eventManager.auth.data.AuthRepository
import com.example.eventManager.core.TAG
import com.example.eventManager.databinding.FragmentSpecialEventListBinding

/**
 * A simple [Fragment] subclass as the default destination in the navigation.
 */
class SpecialEventListFragment : Fragment() {

    private lateinit var specialEventsListAdapter: SpecialEventsListAdapter
    private lateinit var specialEventModel: SpecialEventListViewModel

    private var _binding: FragmentSpecialEventListBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    val CHANNEL_ID = "CHANNEL_ID"
    var onStart = true

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        Log.i(TAG, "onCreateView")
        _binding = FragmentSpecialEventListBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Log.i(TAG, "onViewCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return;
        }
        setupSpecialEventsList()
        binding.fab.setOnClickListener {
            Log.v(TAG, "Add new special event")
            findNavController().navigate(R.id.SpecialEventEditFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }

    private fun setupSpecialEventsList() {
        specialEventsListAdapter = SpecialEventsListAdapter(this)
        binding.specialEventsList.adapter = specialEventsListAdapter
        specialEventModel = ViewModelProvider(this).get(SpecialEventListViewModel::class.java)

        specialEventModel.specialEvents.observe(viewLifecycleOwner, { value ->
            Log.i(TAG, "update special events")
            specialEventsListAdapter.specialEvents = value
        })

        specialEventModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        })

        specialEventModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })

        specialEventModel.refresh()
    }

    private fun createNotification() {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent: PendingIntent = PendingIntent.getActivity(activity, 0, intent, 0)
        val builder = context?.let {
            NotificationCompat.Builder(it, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle("Welcome!")
                .setContentText("Bine ai venit!")
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                //.setContentIntent(pendingIntent)
                .setAutoCancel(true)
        }
        with(NotificationManagerCompat.from(requireContext())) {
            if (builder != null) {
                notify(1, builder.build())
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "My channel name"
            val descriptionText = "My channel description"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager =
                activity?.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}