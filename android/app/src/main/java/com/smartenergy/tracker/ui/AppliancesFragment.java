package com.smartenergy.tracker.ui;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

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
import com.smartenergy.tracker.adapter.ApplianceAdapter;
import com.smartenergy.tracker.model.Appliance;
import com.smartenergy.tracker.network.ApiClient;
import com.smartenergy.tracker.network.SocketManager;

import java.lang.reflect.Type;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AppliancesFragment extends Fragment {

    private RecyclerView rvAppliances;
    private ApplianceAdapter adapter;
    private SwipeRefreshLayout swipeRefresh;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_appliances, container, false);

        rvAppliances = view.findViewById(R.id.rvAppliances);
        swipeRefresh = view.findViewById(R.id.swipeRefreshAppliances);

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

        rvAppliances.setLayoutManager(new LinearLayoutManager(getContext()));
        rvAppliances.setAdapter(adapter);

        swipeRefresh.setOnRefreshListener(this::loadAppliances);

        loadAppliances();

        return view;
    }

    private void loadAppliances() {
        if (!isAdded()) return;

        swipeRefresh.setRefreshing(true);
        ApiClient.getService(requireContext()).getAppliances().enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                swipeRefresh.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null) {
                    try {
                        JsonArray arr = response.body().getAsJsonArray("data");
                        Type type = new TypeToken<List<Appliance>>() {}.getType();
                        List<Appliance> list = new Gson().fromJson(arr, type);
                        if (list != null) {
                            adapter.setAppliances(list);
                        }
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

    public void updateAppliances(List<Appliance> appliances) {
        if (adapter != null && isAdded()) {
            adapter.setAppliances(appliances);
        }
    }
}
