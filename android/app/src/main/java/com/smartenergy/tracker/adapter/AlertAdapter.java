package com.smartenergy.tracker.adapter;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.smartenergy.tracker.R;
import com.smartenergy.tracker.model.AlertItem;

import java.util.ArrayList;
import java.util.List;

public class AlertAdapter extends RecyclerView.Adapter<AlertAdapter.ViewHolder> {

    public interface OnAlertResolveListener {
        void onResolve(long alertId);
    }

    private List<AlertItem> alerts = new ArrayList<>();
    private final OnAlertResolveListener listener;

    public AlertAdapter(OnAlertResolveListener listener) {
        this.listener = listener;
    }

    public void setAlerts(List<AlertItem> newAlerts) {
        this.alerts = new ArrayList<>(newAlerts);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_alert, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        AlertItem item = alerts.get(position);

        holder.tvAlertSeverity.setText(item.getSeverity());
        holder.tvAlertApplianceId.setText(item.getApplianceId());
        holder.tvAlertMessage.setText(item.getMessage());
        holder.tvAlertTime.setText(item.getTimestamp());

        if ("CRITICAL".equalsIgnoreCase(item.getSeverity())) {
            holder.tvAlertSeverity.setTextColor(Color.parseColor("#F43F5E"));
        } else if ("WARNING".equalsIgnoreCase(item.getSeverity())) {
            holder.tvAlertSeverity.setTextColor(Color.parseColor("#F59E0B"));
        } else {
            holder.tvAlertSeverity.setTextColor(Color.parseColor("#06B6D4"));
        }

        if (item.isResolved()) {
            holder.btnResolveAlert.setVisibility(View.GONE);
            holder.itemView.setAlpha(0.6f);
        } else {
            holder.btnResolveAlert.setVisibility(View.VISIBLE);
            holder.itemView.setAlpha(1.0f);
            holder.btnResolveAlert.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onResolve(item.getId());
                }
            });
        }
    }

    @Override
    public int getItemCount() {
        return alerts.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvAlertSeverity, tvAlertApplianceId, tvAlertMessage, tvAlertTime;
        Button btnResolveAlert;

        ViewHolder(View itemView) {
            super(itemView);
            tvAlertSeverity = itemView.findViewById(R.id.tvAlertSeverity);
            tvAlertApplianceId = itemView.findViewById(R.id.tvAlertApplianceId);
            tvAlertMessage = itemView.findViewById(R.id.tvAlertMessage);
            tvAlertTime = itemView.findViewById(R.id.tvAlertTime);
            btnResolveAlert = itemView.findViewById(R.id.btnResolveAlert);
        }
    }
}
