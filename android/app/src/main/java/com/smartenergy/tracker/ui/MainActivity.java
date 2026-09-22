package com.smartenergy.tracker.ui;

import android.app.AlertDialog;
import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.smartenergy.tracker.R;
import com.smartenergy.tracker.model.AlertItem;
import com.smartenergy.tracker.model.Appliance;
import com.smartenergy.tracker.model.Telemetry;
import com.smartenergy.tracker.network.ApiClient;
import com.smartenergy.tracker.network.PreferencesManager;
import com.smartenergy.tracker.network.SocketManager;

public class MainActivity extends AppCompatActivity implements SocketManager.SocketEventListener {

    private TextView tvGatewayStatus;
    private BottomNavigationView bottomNav;

    private DashboardFragment dashboardFragment;
    private AppliancesFragment appliancesFragment;
    private AlertsFragment alertsFragment;
    private PreferencesManager prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = new PreferencesManager(this);

        tvGatewayStatus = findViewById(R.id.tvGatewayStatus);
        bottomNav = findViewById(R.id.bottom_navigation);

        findViewById(R.id.btnSetServerIp).setOnClickListener(v -> showServerIpDialog());

        dashboardFragment = new DashboardFragment();
        appliancesFragment = new AppliancesFragment();
        alertsFragment = new AlertsFragment();

        loadFragment(dashboardFragment);

        bottomNav.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_dashboard) {
                loadFragment(dashboardFragment);
                return true;
            } else if (itemId == R.id.nav_appliances) {
                loadFragment(appliancesFragment);
                return true;
            } else if (itemId == R.id.nav_alerts) {
                loadFragment(alertsFragment);
                return true;
            }
            return false;
        });

        // Initialize Socket.IO connection to Laptop Simulation Server
        SocketManager.getInstance().setListener(this);
        SocketManager.getInstance().connect(this);
    }

    private void loadFragment(Fragment fragment) {
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
    }

    private void showServerIpDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_server_ip, null);
        EditText etServerIp = dialogView.findViewById(R.id.etServerIp);
        Button btnCancel = dialogView.findViewById(R.id.btnCancelIp);
        Button btnSave = dialogView.findViewById(R.id.btnSaveIp);

        etServerIp.setText(prefs.getServerIp());

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSave.setOnClickListener(v -> {
            String ip = etServerIp.getText().toString().trim();
            if (!ip.isEmpty()) {
                prefs.setServerIp(ip);
                ApiClient.reset();
                Toast.makeText(this, "Connecting to: " + ip, Toast.LENGTH_SHORT).show();
                SocketManager.getInstance().connect(this);
                dialog.dismiss();
            }
        });

        dialog.show();
    }

    @Override
    public void onConnected() {
        tvGatewayStatus.setText("● ESP32-SIM-001 (ONLINE)");
        tvGatewayStatus.setTextColor(Color.parseColor("#10B981"));
    }

    @Override
    public void onDisconnected() {
        tvGatewayStatus.setText("○ ESP32-SIM-001 (OFFLINE - Check IP)");
        tvGatewayStatus.setTextColor(Color.parseColor("#F43F5E"));
    }

    @Override
    public void onTelemetryUpdate(Telemetry telemetry) {
        if (dashboardFragment != null) {
            dashboardFragment.updateTelemetry(telemetry);
        }
        if (appliancesFragment != null && telemetry.getAppliances() != null) {
            appliancesFragment.updateAppliances(telemetry.getAppliances());
        }
    }

    @Override
    public void onApplianceStateChanged(Appliance appliance) {
        // Will refresh automatically on next telemetry tick (1 second)
    }

    @Override
    public void onAlertReceived(AlertItem alert) {
        Toast.makeText(this, "⚠ " + alert.getSeverity() + ": " + alert.getMessage(), Toast.LENGTH_LONG).show();
        if (alertsFragment != null) {
            alertsFragment.addAlert(alert);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        SocketManager.getInstance().disconnect();
    }
}
