package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartenergy.tracker.R
import com.smartenergy.tracker.adapter.CircuitAdapter
import com.smartenergy.tracker.databinding.FragmentHomeBinding
import com.smartenergy.tracker.network.EnergyRepository
import kotlinx.coroutines.launch
import java.util.Locale

class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private lateinit var circuitAdapter: CircuitAdapter
    private lateinit var repo: EnergyRepository

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        repo = EnergyRepository.getInstance(requireContext())

        setupRecyclerView()
        setupListeners()
        observeData()
    }

    private fun setupRecyclerView() {
        circuitAdapter = CircuitAdapter(
            onCircuitClick = { appliance ->
                DeviceDetailBottomSheet.newInstance(appliance)
                    .show(parentFragmentManager, "DeviceDetailBottomSheet")
            },
            onRelayToggle = { appliance, newState ->
                repo.toggleAppliance(appliance.id, newState)
            }
        )

        binding.rvCircuits.layoutManager = LinearLayoutManager(requireContext())
        binding.rvCircuits.adapter = circuitAdapter
    }

    private fun setupListeners() {
        binding.swipeRefresh.setOnRefreshListener {
            repo.fetchInitialData()
            binding.swipeRefresh.isRefreshing = false
        }

        // Top bar buttons
        binding.btnMenu.setOnClickListener {
            ServerConfigDialog().show(parentFragmentManager, "ServerConfigDialog")
        }

        binding.btnBell.setOnClickListener {
            val alerts = repo.alerts.value
            if (!alerts.isNullOrEmpty()) {
                val latest = alerts.first()
                Toast.makeText(context, "Alert: ${latest.message}", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(context, "No active electrical anomalies detected.", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnProfile.setOnClickListener {
            Toast.makeText(context, "GridSense Enterprise EMS • Dhanush (Admin)", Toast.LENGTH_SHORT).show()
        }

        // Front Card Sandbox Pill
        binding.btnVivaSandbox.setOnClickListener {
            SystemLabBottomSheet().show(parentFragmentManager, "SystemLabBottomSheet")
        }

        // Quick Actions 1-4
        binding.actionNightMode.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val ok = repo.applyScene("night_mode")
                val msg = if (ok) "🌙 Night Mode activated (non-essential loads shed)" else "Scene executed"
                Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
            }
        }

        binding.actionEcoShift.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val ok = repo.applyScene("eco_saver")
                val msg = if (ok) "🌿 Eco Shift applied: High loads shifted to off-peak tariff" else "Eco shift applied"
                Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
            }
        }

        binding.actionWorkMode.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val ok = repo.applyScene("work_mode")
                val msg = if (ok) "💼 Work Mode activated (IT & Office circuits prioritized)" else "Work mode set"
                Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
            }
        }

        binding.actionSandbox.setOnClickListener {
            SystemLabBottomSheet().show(parentFragmentManager, "SystemLabBottomSheet")
        }
    }

    private fun observeData() {
        repo.isConnected.observe(viewLifecycleOwner) { connected ->
            if (connected) {
                binding.tvOnlineBadge.text = "● ONLINE 50.0Hz"
                binding.tvOnlineBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.emerald_400))
            } else {
                binding.tvOnlineBadge.text = "○ CONNECTING..."
                binding.tvOnlineBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.amber_500))
            }
        }

        repo.telemetry.observe(viewLifecycleOwner) { telem ->
            binding.tvTotalPowerValue.text = String.format(Locale.US, "%,.0f", telem.totalActivePower)
            binding.tvCardBottomMetrics.text = String.format(
                Locale.US,
                "₹%.2f / day · PF %.2f · %.1fV",
                telem.estimatedCost,
                telem.systemPowerFactor,
                telem.gridVoltage
            )

            telem.deviceId?.let { id ->
                binding.tvBackGatewayChip.text = "● $id"
            }
        }

        repo.appliances.observe(viewLifecycleOwner) { list ->
            circuitAdapter.submitList(list)
            val activeCount = list.count { it.isOn }
            binding.tvCircuitCountChip.text = "$activeCount Active"
        }

        repo.alerts.observe(viewLifecycleOwner) { alerts ->
            val hasUnresolved = alerts.any { !it.resolved }
            binding.indicatorBellAlert.visibility = if (hasUnresolved) View.VISIBLE else View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
