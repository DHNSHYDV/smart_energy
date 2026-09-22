package com.smartenergy.tracker.ui

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import com.smartenergy.tracker.databinding.DialogServerIpBinding
import com.smartenergy.tracker.network.ApiClient
import com.smartenergy.tracker.network.EnergyRepository
import com.smartenergy.tracker.network.PreferencesManager

class ServerConfigDialog : DialogFragment() {
    private var _binding: DialogServerIpBinding? = null
    private val binding get() = _binding!!

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        _binding = DialogServerIpBinding.inflate(LayoutInflater.from(context))
        val prefs = PreferencesManager.getInstance(requireContext())

        binding.etServerIp.setText("${prefs.serverIp}:${prefs.serverPort}")

        binding.btnCancelIp.setOnClickListener { dismiss() }

        binding.btnSaveIp.setOnClickListener {
            val input = binding.etServerIp.text.toString().trim()
            if (input.isNotEmpty()) {
                val parts = input.split(":")
                val ip = parts[0]
                val port = if (parts.size > 1) parts[1].toIntOrNull() ?: 5000 else 5000

                prefs.serverIp = ip
                prefs.serverPort = port
                ApiClient.invalidate()
                EnergyRepository.getInstance(requireContext()).reconnect()

                Toast.makeText(context, "Target set to $ip:$port", Toast.LENGTH_SHORT).show()
                dismiss()
            }
        }

        return AlertDialog.Builder(requireContext())
            .setView(binding.root)
            .create()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
