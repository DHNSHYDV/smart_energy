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
        val ctx = context ?: return
        repo = EnergyRepository.getInstance(ctx.applicationContext)

        setupRecyclerView()
        setupListeners()
        observeData()
    }

    private fun setupRecyclerView() {
        val ctx = context ?: return
        circuitAdapter = CircuitAdapter(
            onCircuitClick = { appliance ->
                DeviceDetailBottomSheet.newInstance(appliance)
                    .show(parentFragmentManager, "DeviceDetailBottomSheet")
            },
            onRelayToggle = { appliance, newState ->
                repo.toggleAppliance(appliance.id, newState)
            }
        )

        binding.rvCircuits.layoutManager = LinearLayoutManager(ctx)
        binding.rvCircuits.adapter = circuitAdapter
    }

    private fun setupListeners() {
        binding.swipeRefresh.setOnRefreshListener {
            repo.fetchInitialData()
            binding.swipeRefresh.isRefreshing = false
        }

        binding.btnMenu.setOnClickListener {
            ServerConfigDialog().show(parentFragmentManager, "ServerConfigDialog")
        }

        binding.btnBell.setOnClickListener {
            val alerts = repo.alerts.value
            if (!alerts.isNullOrEmpty()) {
                val latest = alerts.first()
                Toast.makeText(context, "Alert: ${latest.message}", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(context, "All electrical parameters nominal. No anomalies.", Toast.LENGTH_SHORT).show()
            }
        }

        val openProfileDialog = {
            val ctx = context
            if (ctx != null) {
                val residentLabels = arrayOf(
                    "👤 Dhanush Yadav (Flat 402, Block B · ~148 kWh/mo)",
                    "👤 Priya Sharma (Villa 12, Whitefield · ~76 kWh/mo)",
                    "🔑 Sign In / Register New Account"
                )
                androidx.appcompat.app.AlertDialog.Builder(ctx)
                    .setTitle("Resident Profile")
                    .setItems(residentLabels) { _, which ->
                        when (which) {
                            0 -> repo.switchResident("usr_dhanush")
                            1 -> repo.switchResident("usr_priya")
                            2 -> {
                                startActivity(android.content.Intent(ctx, LoginActivity::class.java))
                            }
                        }
                    }
                    .setNegativeButton("Cancel", null)
                    .show()
            }
        }

        binding.btnSwitchProfile.setOnClickListener { openProfileDialog() }
        binding.tvProfileInitials.setOnClickListener { openProfileDialog() }
        binding.tvGreetingTitle.setOnClickListener { openProfileDialog() }
        binding.btnProfile.setOnClickListener { openProfileDialog() }


        binding.btnViewAllDevices.setOnClickListener {
            (activity as? MainActivity)?.navigateToTab(R.id.nav_devices)
        }

        binding.actionNightMode.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("night_mode")
            }
        }

        binding.actionEcoShift.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("eco_saver")
            }
        }

        binding.actionWorkMode.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("work_mode")
            }
        }

    }

    private fun observeData() {
        repo.isConnected.observe(viewLifecycleOwner) { connected ->
            val ctx = context ?: return@observe
            val b = _binding ?: return@observe
            if (connected) {
                b.tvOnlineBadge.text = "● ONLINE 50.0Hz"
                b.tvOnlineBadge.setTextColor(ContextCompat.getColor(ctx, R.color.emerald_400))
            } else {
                b.tvOnlineBadge.text = "● SIMULATION 50.0Hz"
                b.tvOnlineBadge.setTextColor(ContextCompat.getColor(ctx, R.color.emerald_400))
            }
        }

        repo.telemetry.observe(viewLifecycleOwner) { telem ->
            val b = _binding ?: return@observe
            telem.resident?.let { res ->
                val name = res.name ?: "Dhanush"
                val firstName = name.split(" ").firstOrNull() ?: name
                b.tvGreetingTitle.text = "Hello, $firstName"
                b.tvGreetingSubtitle.text = "${res.doorNo ?: "Flat 402"} · ${res.consumerId ?: "BESCOM-BLR"}"
                val initials = name.split(" ")
                    .filter { it.isNotEmpty() }
                    .take(2)
                    .map { it.first().uppercase() }
                    .joinToString("")
                if (initials.isNotEmpty()) {
                    b.tvProfileInitials.text = initials
                }
            }

            b.tvTotalPowerValue.text = String.format(Locale.US, "%,.0f", telem.totalActivePower)
            b.tvCardBottomMetrics.text = String.format(
                Locale.US,
                "%.1f V · %.2f PF · %.1f Hz",
                telem.gridVoltage,
                telem.systemPowerFactor,
                telem.frequency
            )

            val monthly = telem.monthlyUsage
            b.tvCardBillingSummary.text = String.format(
                Locale.US,
                "This Month: %.1f kWh · ₹%.0f est.",
                monthly.kwh,
                monthly.estimatedBill
            )

            b.tvMonthlyKwh.text = String.format(Locale.US, "%.1f kWh", monthly.kwh)
            b.tvMonthlyBillEst.text = String.format(Locale.US, "Estimated Bill: ₹%.0f", monthly.estimatedBill)
            b.tvDailyAverageKwh.text = String.format(Locale.US, "%.2f kWh", monthly.dailyAverageKwh)
            val compSign = if (monthly.comparisonPct >= 0) "↑ +" else "↓ -"
            b.tvMonthComparisonBadge.text = String.format(Locale.US, "%s%.1f%% vs last mo", compSign, Math.abs(monthly.comparisonPct))

            b.tvQuickTotalDevices.text = "${telem.totalDevicesCount}"
            b.tvQuickActiveDevices.text = "${telem.activeDevicesCount}"
            b.tvQuickCurrentLoad.text = String.format(Locale.US, "%,.0f W", telem.totalActivePower)

            if (telem.totalActivePower > 2500) {
                b.tvEnergyInsightText.text = "High demand alert: Aggregate load is ${String.format(Locale.US, "%,.0f W", telem.totalActivePower)}. Running non-essential appliances during peak hours increases demand charges."
            } else {
                b.tvEnergyInsightText.text = "Peak usage is expected between 18:00–22:00. Shifting your Water Heater & EV charging to off-peak hours could reduce your estimated monthly bill."
            }
        }

        repo.appliances.observe(viewLifecycleOwner) { list ->
            val activeDevices = list.filter { it.isOn }.take(3)
            val displayList = if (activeDevices.isNotEmpty()) activeDevices else list.take(2)
            circuitAdapter.submitList(displayList)
        }

        repo.alerts.observe(viewLifecycleOwner) { alerts ->
            val b = _binding ?: return@observe
            val hasUnresolved = alerts.any { !it.resolved }
            b.indicatorBellAlert.visibility = if (hasUnresolved) View.VISIBLE else View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
