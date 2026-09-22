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

import com.smartenergy.tracker.R;
import com.smartenergy.tracker.adapter.ApplianceAdapter;
import com.smartenergy.tracker.model.Appliance;
import com.smartenergy.tracker.network.SocketManager;

import java.util.List;

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

        swipeRefresh.setOnRefreshListener(() -> {
            swipeRefresh.setRefreshing(false);
        });

        return view;
    }

    public void updateAppliances(List<Appliance> appliances) {
        if (adapter != null && isAdded()) {
            adapter.setAppliances(appliances);
        }
    }
}
