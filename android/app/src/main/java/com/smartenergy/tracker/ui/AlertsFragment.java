package com.smartenergy.tracker.ui;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.smartenergy.tracker.R;
import com.smartenergy.tracker.adapter.AlertAdapter;
import com.smartenergy.tracker.model.AlertItem;
import com.smartenergy.tracker.network.ApiClient;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AlertsFragment extends Fragment {

    private RecyclerView rvAlerts;
    private AlertAdapter adapter;
    private SwipeRefreshLayout swipeRefresh;
    private final List<AlertItem> alertList = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_alerts, container, false);

        rvAlerts = view.findViewById(R.id.rvAlerts);
        swipeRefresh = view.findViewById(R.id.swipeRefreshAlerts);

        adapter = new AlertAdapter(alertId -> resolveAlert(alertId));
        rvAlerts.setLayoutManager(new LinearLayoutManager(getContext()));
        rvAlerts.setAdapter(adapter);

        swipeRefresh.setOnRefreshListener(this::loadAlerts);

        loadAlerts();

        return view;
    }

    public void addAlert(AlertItem alert) {
        alertList.add(0, alert);
        if (adapter != null) {
            adapter.setAlerts(alertList);
        }
    }

    private void loadAlerts() {
        swipeRefresh.setRefreshing(true);
        ApiClient.getService(requireContext()).getAlerts(50).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                swipeRefresh.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null) {
                    try {
                        JsonArray dataArray = response.body().getAsJsonArray("data");
                        Type listType = new TypeToken<List<AlertItem>>() {}.getType();
                        List<AlertItem> fetched = new Gson().fromJson(dataArray, listType);
                        alertList.clear();
                        if (fetched != null) {
                            alertList.addAll(fetched);
                        }
                        adapter.setAlerts(alertList);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                swipeRefresh.setRefreshing(false);
            }
        });
    }

    private void resolveAlert(long alertId) {
        ApiClient.getService(requireContext()).resolveAlert(alertId).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(getContext(), "Alert acknowledged", Toast.LENGTH_SHORT).show();
                    loadAlerts();
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                Toast.makeText(getContext(), "Failed to resolve alert", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
