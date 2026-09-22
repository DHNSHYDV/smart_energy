package com.smartenergy.tracker.adapter;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.switchmaterial.SwitchMaterial;
import com.smartenergy.tracker.R;
import com.smartenergy.tracker.model.Appliance;
import com.smartenergy.tracker.model.SensorReading;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ApplianceAdapter extends RecyclerView.Adapter<ApplianceAdapter.ViewHolder> {

    public interface OnApplianceActionListener {
        void onToggle(String id, boolean state);
        void onTestAnomaly(String id, boolean isAnomaly);
    }

    private List<Appliance> appliances = new ArrayList<>();
    private final OnApplianceActionListener listener;

    public ApplianceAdapter(OnApplianceActionListener listener) {
        this.listener = listener;
    }

    public void setAppliances(List<Appliance> newAppliances) {
        this.appliances = new ArrayList<>(newAppliances);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_appliance, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Appliance app = appliances.get(position);

        holder.tvItemName.setText(app.getName());
        holder.tvItemLocation.setText(String.format(Locale.getDefault(), "%s | Rated %.0fW", app.getLocation(), app.getRatedPower()));

        // Temporarily clear listener to prevent feedback loop during scroll
        holder.switchRelay.setOnCheckedChangeListener(null);
        holder.switchRelay.setChecked(app.isOn());

        holder.switchRelay.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (listener != null) {
                listener.onToggle(app.getId(), isChecked);
            }
        });

        SensorReading reading = app.getReading();
        if (reading != null && app.isOn()) {
            holder.tvActivePower.setText(String.format(Locale.getDefault(), "%.0f W", reading.getActivePower()));
            holder.tvCurrent.setText(String.format(Locale.getDefault(), "%.2f A", reading.getCurrent()));
            holder.tvVoltage.setText(String.format(Locale.getDefault(), "%.1f V", reading.getVoltage()));
            holder.tvEnergyToday.setText(String.format(Locale.getDefault(), "%.2f kWh", reading.getCumulativeEnergyKwh()));
        } else {
            holder.tvActivePower.setText("0 W");
            holder.tvCurrent.setText("0.00 A");
            holder.tvVoltage.setText(reading != null ? String.format(Locale.getDefault(), "%.1f V", reading.getVoltage()) : "230.0 V");
            holder.tvEnergyToday.setText(reading != null ? String.format(Locale.getDefault(), "%.2f kWh", reading.getCumulativeEnergyKwh()) : "0.00 kWh");
        }

        if (app.isAnomaly()) {
            holder.tvAnomalyStatus.setText("⚠ ABNORMAL SURGE DETECTED");
            holder.tvAnomalyStatus.setTextColor(Color.parseColor("#F43F5E"));
            holder.btnTestAnomaly.setText("Clear Anomaly");
            holder.btnTestAnomaly.setTextColor(Color.parseColor("#F43F5E"));
        } else {
            holder.tvAnomalyStatus.setText("● Normal Operating Range");
            holder.tvAnomalyStatus.setTextColor(Color.parseColor("#10B981"));
            holder.btnTestAnomaly.setText("Test Anomaly");
            holder.btnTestAnomaly.setTextColor(Color.parseColor("#94A3B8"));
        }

        holder.btnTestAnomaly.setOnClickListener(v -> {
            if (listener != null) {
                listener.onTestAnomaly(app.getId(), !app.isAnomaly());
            }
        });
    }

    @Override
    public int getItemCount() {
        return appliances.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvItemName, tvItemLocation, tvActivePower, tvCurrent, tvVoltage, tvEnergyToday, tvAnomalyStatus;
        SwitchMaterial switchRelay;
        MaterialButton btnTestAnomaly;

        ViewHolder(View itemView) {
            super(itemView);
            tvItemName = itemView.findViewById(R.id.tvItemName);
            tvItemLocation = itemView.findViewById(R.id.tvItemLocation);
            tvActivePower = itemView.findViewById(R.id.tvActivePower);
            tvCurrent = itemView.findViewById(R.id.tvCurrent);
            tvVoltage = itemView.findViewById(R.id.tvVoltage);
            tvEnergyToday = itemView.findViewById(R.id.tvEnergyToday);
            tvAnomalyStatus = itemView.findViewById(R.id.tvAnomalyStatus);
            switchRelay = itemView.findViewById(R.id.switchRelay);
            btnTestAnomaly = itemView.findViewById(R.id.btnTestAnomaly);
        }
    }
}
