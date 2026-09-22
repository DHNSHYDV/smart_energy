package com.smartenergy.tracker.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.smartenergy.tracker.R
import com.smartenergy.tracker.databinding.ItemCircuitCardBinding
import com.smartenergy.tracker.model.Appliance
import java.util.Locale

class CircuitAdapter(
    private val onCircuitClick: (Appliance) -> Unit,
    private val onRelayToggle: (Appliance, Boolean) -> Unit
) : ListAdapter<Appliance, CircuitAdapter.CircuitViewHolder>(ApplianceDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CircuitViewHolder {
        val binding = ItemCircuitCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return CircuitViewHolder(binding)
    }

    override fun onBindViewHolder(holder: CircuitViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class CircuitViewHolder(private val binding: ItemCircuitCardBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(appliance: Appliance) {
            val ctx = itemView.context
            binding.tvCircuitName.text = appliance.name
            binding.tvCircuitLocation.text = "${appliance.location ?: "General"} · ${appliance.category ?: "Zone"}"

            val reading = appliance.reading
            val activeWatts = if (appliance.isOn) {
                reading?.activePower ?: appliance.ratedPower
            } else 0.0

            val currentAmps = if (appliance.isOn) {
                reading?.current ?: (activeWatts / 230.0)
            } else 0.0

            val pf = if (appliance.isOn) {
                reading?.powerFactor ?: appliance.powerFactor
            } else 1.0

            if (appliance.isOn) {
                binding.tvCircuitMetrics.text = String.format(
                    Locale.US,
                    "%,.0f W · %.2f A · PF %.2f",
                    activeWatts,
                    currentAmps,
                    pf
                )
                binding.tvCircuitMetrics.setTextColor(ContextCompat.getColor(ctx, R.color.card_purple_primary))
            } else {
                binding.tvCircuitMetrics.text = "OFFLINE · 0.00 W"
                binding.tvCircuitMetrics.setTextColor(ContextCompat.getColor(ctx, R.color.text_secondary))
            }

            // Pick icon based on name/category
            val nameLower = appliance.name.lowercase(Locale.US)
            when {
                nameLower.contains("ac") || nameLower.contains("air") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_ac)
                nameLower.contains("fridge") || nameLower.contains("refrigerator") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_ac)
                nameLower.contains("ev") || nameLower.contains("charger") || nameLower.contains("heater") || nameLower.contains("geyser") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_bolt)
                nameLower.contains("server") || nameLower.contains("work") || nameLower.contains("computer") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_briefcase)
                nameLower.contains("light") || nameLower.contains("lamp") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_leaf)
                else ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_bolt)
            }

            // Anomaly indicator
            binding.indicatorAnomaly.visibility = if (appliance.isAnomaly) View.VISIBLE else View.GONE

            // Avoid trigger on programmatic state binding
            binding.switchCircuit.setOnCheckedChangeListener(null)
            binding.switchCircuit.isChecked = appliance.isOn
            binding.switchCircuit.setOnCheckedChangeListener { _, isChecked ->
                onRelayToggle(appliance, isChecked)
            }

            binding.cardCircuitRoot.setOnClickListener {
                onCircuitClick(appliance)
            }
        }
    }

    class ApplianceDiffCallback : DiffUtil.ItemCallback<Appliance>() {
        override fun areItemsTheSame(oldItem: Appliance, newItem: Appliance): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Appliance, newItem: Appliance): Boolean {
            return oldItem.isOn == newItem.isOn &&
                    oldItem.isAnomaly == newItem.isAnomaly &&
                    oldItem.reading?.activePower == newItem.reading?.activePower &&
                    oldItem.reading?.current == newItem.reading?.current
        }
    }
}
