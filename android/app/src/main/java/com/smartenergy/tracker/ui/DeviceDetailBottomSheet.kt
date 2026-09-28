package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.smartenergy.tracker.R
import com.smartenergy.tracker.databinding.BottomSheetDeviceDetailBinding
import com.smartenergy.tracker.model.Appliance
import com.smartenergy.tracker.network.ApiClient
import com.smartenergy.tracker.network.EnergyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class DeviceDetailBottomSheet : BottomSheetDialogFragment() {
    private var _binding: BottomSheetDeviceDetailBinding? = null
    private val binding get() = _binding!!

    private var appliance: Appliance? = null

    companion object {
        fun newInstance(appliance: Appliance): DeviceDetailBottomSheet {
            val sheet = DeviceDetailBottomSheet()
            sheet.appliance = appliance
            return sheet
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetDeviceDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val app = appliance ?: return
        bindData(app)
        setupActions(app)
    }

    private fun bindData(app: Appliance) {
        val b = _binding ?: return
        val name = app.name ?: "Appliance"
        b.sheetApplianceName.text = name
        b.sheetApplianceLocation.text = "${app.location ?: "General"} · ${app.category ?: "Zone"}"

        val nameLower = name.lowercase(Locale.US)
        val iconType = app.icon?.lowercase(Locale.US) ?: ""
        when {
            iconType == "pc" || nameLower.contains("pc") || nameLower.contains("workstation") ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_pc)
            iconType == "fridge" || nameLower.contains("fridge") || nameLower.contains("refrigerator") ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_fridge)
            iconType == "bulb" || nameLower.contains("light") ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_bulb)
            iconType == "tv" || nameLower.contains("tv") ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_tv)
            iconType == "ac" || nameLower.contains("ac") || nameLower.contains("air") ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_ac)
            iconType == "heater" || nameLower.contains("heater") ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_heater)
            iconType == "ev" || nameLower.contains("ev") ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_ev)
            iconType == "microwave" || nameLower.contains("microwave") ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_microwave)
            else ->
                b.sheetApplianceIcon.setImageResource(R.drawable.ic_bolt)
        }

        val reading = app.reading
        val activeWatts = if (app.isOn) reading?.activePower ?: app.ratedPower else 0.0
        val currentAmps = if (app.isOn) reading?.current ?: (activeWatts / 230.0) else 0.0
        val pf = if (app.isOn) reading?.powerFactor ?: app.powerFactor else 1.0
        val kwh = reading?.cumulativeEnergyKwh ?: 0.0

        b.sheetValActivePower.text = String.format(Locale.US, "%,.0f W", activeWatts)
        b.sheetValCurrent.text = String.format(Locale.US, "%.2f A", currentAmps)
        b.sheetValPf.text = String.format(Locale.US, "%.2f", pf)
        b.sheetValEnergy.text = String.format(Locale.US, "%.2f kWh", kwh)

        b.sheetRelaySwitch.setOnCheckedChangeListener(null)
        b.sheetRelaySwitch.isChecked = app.isOn
        b.sheetRelaySwitch.setOnCheckedChangeListener { _, isChecked ->
            val ctx = context
            if (ctx != null) {
                EnergyRepository.getInstance(ctx).toggleAppliance(app.id, isChecked)
                app.isOn = isChecked
                bindData(app)
            }
        }
    }

    private fun setupActions(app: Appliance) {
        val b = _binding ?: return
        b.btnInjectSpike.setOnClickListener {
            val ctx = context ?: return@setOnClickListener
            viewLifecycleOwner.lifecycleScope.launch {
                try {
                    val api = ApiClient.getService(ctx.applicationContext)
                    val resp = withContext(Dispatchers.IO) {
                        api.injectAnomaly(app.id, mapOf("type" to "OVERCURRENT", "multiplier" to 2.5))
                    }
                    if (resp.isSuccessful) {
                        Toast.makeText(context, "Injected Overcurrent spike on ${app.name ?: "Appliance"}!", Toast.LENGTH_SHORT).show()
                        dismiss()
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "Failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        b.btnInjectBadPf.setOnClickListener {
            val ctx = context ?: return@setOnClickListener
            viewLifecycleOwner.lifecycleScope.launch {
                try {
                    val api = ApiClient.getService(ctx.applicationContext)
                    val resp = withContext(Dispatchers.IO) {
                        api.injectAnomaly(app.id, mapOf("type" to "BAD_POWER_FACTOR", "targetPf" to 0.62))
                    }
                    if (resp.isSuccessful) {
                        Toast.makeText(context, "Simulating PF degradation on ${app.name ?: "Appliance"}!", Toast.LENGTH_SHORT).show()
                        dismiss()
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "Failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
