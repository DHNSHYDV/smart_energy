package com.smartenergy.tracker.ui;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.smartenergy.tracker.R;
import com.smartenergy.tracker.adapter.ApplianceAdapter;
import com.smartenergy.tracker.model.Appliance;
import com.smartenergy.tracker.model.Telemetry;
import com.smartenergy.tracker.network.ApiClient;
import com.smartenergy.tracker.network.SocketManager;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DashboardFragment extends Fragment {

    private TextView tvTotalPower, tvCurrentVoltage, tvTotalEnergy, tvEstimatedCost, tvCarbonFootprint;
    private LineChart realtimeLineChart;
    private RecyclerView rvQuickAppliances;
    private ApplianceAdapter adapter;
    private SwipeRefreshLayout swipeRefresh;

    private LineDataSet dataSet;
    private LineData lineData;
    private int sampleIndex = 0;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_dashboard, container, false);

        tvTotalPower = view.findViewById(R.id.tvTotalPower);
        tvCurrentVoltage = view.findViewById(R.id.tvCurrentVoltage);
        tvTotalEnergy = view.findViewById(R.id.tvTotalEnergy);
        tvEstimatedCost = view.findViewById(R.id.tvEstimatedCost);
        tvCarbonFootprint = view.findViewById(R.id.tvCarbonFootprint);
        realtimeLineChart = view.findViewById(R.id.realtimeLineChart);
        rvQuickAppliances = view.findViewById(R.id.rvQuickAppliances);
        swipeRefresh = view.findViewById(R.id.swipeRefresh);

        setupChart();
        setupRecyclerView();

        swipeRefresh.setOnRefreshListener(() -> {
            loadInitialData();
            SocketManager.getInstance().connect(requireContext());
            swipeRefresh.setRefreshing(false);
        });

        // Load initial data via REST immediately on view creation
        loadInitialData();

        return view;
    }

    private void setupChart() {
        realtimeLineChart.getDescription().setEnabled(false);
        realtimeLineChart.setTouchEnabled(false);
        realtimeLineChart.setDrawGridBackground(false);
        realtimeLineChart.setBackgroundColor(Color.TRANSPARENT);
        realtimeLineChart.getLegend().setEnabled(false);

        XAxis xAxis = realtimeLineChart.getXAxis();
        xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
        xAxis.setTextColor(Color.parseColor("#94A3B8"));
        xAxis.setDrawGridLines(false);

        YAxis leftAxis = realtimeLineChart.getAxisLeft();
        leftAxis.setTextColor(Color.parseColor("#94A3B8"));
        leftAxis.setDrawGridLines(true);
        leftAxis.setGridColor(Color.parseColor("#1E293B"));

        realtimeLineChart.getAxisRight().setEnabled(false);

        List<Entry> entries = new ArrayList<>();
        entries.add(new Entry(0, 0));

        dataSet = new LineDataSet(entries, "Power (Watts)");
        dataSet.setColor(Color.parseColor("#10B981"));
        dataSet.setLineWidth(2.5f);
        dataSet.setDrawCircles(false);
        dataSet.setDrawValues(false);
        dataSet.setMode(LineDataSet.Mode.CUBIC_BEZIER);
        dataSet.setDrawFilled(true);
        dataSet.setFillColor(Color.parseColor("#10B981"));
        dataSet.setFillAlpha(35);

        lineData = new LineData(dataSet);
        realtimeLineChart.setData(lineData);
        realtimeLineChart.invalidate();
    }

    private void setupRecyclerView() {
        adapter = new ApplianceAdapter(new ApplianceAdapter.OnApplianceActionListener() {
            @Override
            public void onToggle(String id, boolean state) {
                SocketManager.getInstance().toggleAppliance(id, state);
            }

            @Override
            public void onTestAnomaly(String id, boolean isAnomaly) {
                SocketManager.getInstance().injectAnomaly(id, isAnomaly);
            }
        });

        rvQuickAppliances.setLayoutManager(new LinearLayoutManager(getContext()));
        rvQuickAppliances.setAdapter(adapter);
    }

    private void loadInitialData() {
        if (!isAdded()) return;

        ApiClient.getService(requireContext()).getAppliances().enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (response.isSuccessful() && response.body() != null) {
                    try {
                        JsonArray arr = response.body().getAsJsonArray("data");
                        Type type = new TypeToken<List<Appliance>>() {}.getType();
                        List<Appliance> list = new Gson().fromJson(arr, type);
                        if (list != null && !list.isEmpty()) {
                            adapter.setAppliances(list);

                            // Calculate instant sum
                            double totalW = 0;
                            double totalKwh = 0;
                            for (Appliance a : list) {
                                if (a.getReading() != null && a.isOn()) {
                                    totalW += a.getReading().getActivePower();
                                    totalKwh += a.getReading().getCumulativeEnergyKwh();
                                }
                            }
                            tvTotalPower.setText(String.format(Locale.getDefault(), "%.0f W", totalW));
                            tvTotalEnergy.setText(String.format(Locale.getDefault(), "%.2f kWh", totalKwh));
                            tvEstimatedCost.setText(String.format(Locale.getDefault(), "₹%.2f", totalKwh * 8.0));
                            tvCarbonFootprint.setText(String.format(Locale.getDefault(), "%.2f kg", totalKwh * 0.82));
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                // If offline, will be handled by SocketEventListener or IP dialog
            }
        });
    }

    public void updateTelemetry(Telemetry telemetry) {
        if (!isAdded()) return;

        tvTotalPower.setText(String.format(Locale.getDefault(), "%.0f W", telemetry.getTotalActivePower()));
        tvCurrentVoltage.setText(String.format(Locale.getDefault(), "%.2f A @ %.1f V", telemetry.getTotalCurrent(), telemetry.getGridVoltage()));
        tvTotalEnergy.setText(String.format(Locale.getDefault(), "%.2f kWh", telemetry.getTotalEnergyTodayKwh()));
        tvEstimatedCost.setText(String.format(Locale.getDefault(), "₹%.2f", telemetry.getEstimatedCost()));
        tvCarbonFootprint.setText(String.format(Locale.getDefault(), "%.2f kg", telemetry.getCarbonKg()));

        if (telemetry.getAppliances() != null) {
            adapter.setAppliances(telemetry.getAppliances());
        }

        // Add real-time point to chart
        sampleIndex++;
        lineData.addEntry(new Entry(sampleIndex, (float) telemetry.getTotalActivePower()), 0);
        lineData.notifyDataChanged();
        realtimeLineChart.notifyDataSetChanged();
        realtimeLineChart.setVisibleXRangeMaximum(25);
        realtimeLineChart.moveViewToX(sampleIndex);
    }
}
