package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartenergy.tracker.adapter.CircuitAdapter
import com.smartenergy.tracker.databinding.FragmentDevicesBinding
import com.smartenergy.tracker.network.EnergyRepository
import java.util.Locale

class DevicesFragment : Fragment() {
    private var _binding: FragmentDevicesBinding? = null
    private val binding get() = _binding!!

    private lateinit var circuitAdapter: CircuitAdapter
    private lateinit var repo: EnergyRepository

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDevicesBinding.inflate(inflater, container, false)
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

        binding.rvDeviceList.layoutManager = LinearLayoutManager(ctx)
        binding.rvDeviceList.adapter = circuitAdapter
    }

    private fun setupListeners() {
        binding.swipeRefreshDevices.setOnRefreshListener {
            repo.fetchInitialData()
            binding.swipeRefreshDevices.isRefreshing = false
        }
    }

    private fun observeData() {
        repo.appliances.observe(viewLifecycleOwner) { list ->
            val b = _binding ?: return@observe
            circuitAdapter.submitList(list)
            b.tvStatTotalDevices.text = "${list.size}"
            val active = list.count { it.isOn }
            b.tvStatActiveDevices.text = "$active"

            val totalW = list.filter { it.isOn }.sumOf { it.reading?.activePower ?: it.ratedPower }
            b.tvStatTotalWatts.text = String.format(Locale.US, "%,.0f W", totalW)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
