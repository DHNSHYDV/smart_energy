package com.smartenergy.tracker.ui

import android.app.Dialog
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
        val ctx = requireContext()
        _binding = DialogServerIpBinding.inflate(LayoutInflater.from(ctx))
        val prefs = PreferencesManager.getInstance(ctx.applicationContext)

        binding.etServerIp.setText(prefs.serverUrl)

        binding.btnPresetRailway.setOnClickListener {
            binding.etServerIp.setText(PreferencesManager.DEFAULT_RAILWAY_URL)
        }

        binding.btnPresetLocal.setOnClickListener {
            binding.etServerIp.setText(PreferencesManager.DEFAULT_LOCAL_URL)
        }

        binding.btnCancelIp.setOnClickListener { dismiss() }

        binding.btnCheckOtaUpdate.setOnClickListener {
            dismiss()
            activity?.let { act ->
                UpdateManager.checkForUpdates(act, silent = false)
            }
        }

        binding.btnSaveIp.setOnClickListener {
            val input = binding.etServerIp.text.toString().trim()
            if (input.isNotEmpty()) {
                prefs.serverUrl = input
                ApiClient.invalidate()
                val safeCtx = context ?: return@setOnClickListener
                EnergyRepository.getInstance(safeCtx.applicationContext).reconnect()

                Toast.makeText(safeCtx, "Target set: ${prefs.serverUrl}", Toast.LENGTH_SHORT).show()
                dismiss()
            }
        }

        return AlertDialog.Builder(ctx)
            .setView(binding.root)
            .create()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
