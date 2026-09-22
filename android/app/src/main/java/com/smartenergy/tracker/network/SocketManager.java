package com.smartenergy.tracker.network;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.google.gson.Gson;
import com.smartenergy.tracker.model.AlertItem;
import com.smartenergy.tracker.model.Appliance;
import com.smartenergy.tracker.model.Telemetry;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;

public class SocketManager {
    private static final String TAG = "SocketManager";
    private static SocketManager instance;
    private Socket socket;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Gson gson = new Gson();
    private boolean isConnected = false;

    public interface SocketEventListener {
        void onConnected();
        void onDisconnected();
        void onTelemetryUpdate(Telemetry telemetry);
        void onApplianceStateChanged(Appliance appliance);
        void onAlertReceived(AlertItem alert);
    }

    private SocketEventListener listener;

    private SocketManager() {}

    public static synchronized SocketManager getInstance() {
        if (instance == null) {
            instance = new SocketManager();
        }
        return instance;
    }

    public void setListener(SocketEventListener listener) {
        this.listener = listener;
    }

    public void connect(Context context) {
        disconnect();

        PreferencesManager prefs = new PreferencesManager(context);
        String serverUrl = prefs.getBaseUrl();

        try {
            IO.Options options = new IO.Options();
            options.reconnection = true;
            options.reconnectionAttempts = 30;
            options.reconnectionDelay = 1000;
            options.timeout = 10000;

            socket = IO.socket(serverUrl, options);

            socket.on(Socket.EVENT_CONNECT, args -> {
                Log.d(TAG, "Socket.IO Connected to " + serverUrl);
                isConnected = true;
                if (listener != null) {
                    mainHandler.post(() -> listener.onConnected());
                }
            });

            socket.on(Socket.EVENT_DISCONNECT, args -> {
                Log.d(TAG, "Socket.IO Disconnected");
                isConnected = false;
                if (listener != null) {
                    mainHandler.post(() -> listener.onDisconnected());
                }
            });

            socket.on(Socket.EVENT_CONNECT_ERROR, args -> {
                Log.e(TAG, "Socket.IO Connect Error: " + (args.length > 0 ? args[0] : "unknown"));
                isConnected = false;
                if (listener != null) {
                    mainHandler.post(() -> listener.onDisconnected());
                }
            });

            // Initial snapshot on connect
            socket.on("init:snapshot", args -> {
                if (args.length > 0 && listener != null) {
                    try {
                        String jsonString = args[0].toString();
                        Telemetry telemetry = gson.fromJson(jsonString, Telemetry.class);
                        mainHandler.post(() -> listener.onTelemetryUpdate(telemetry));
                    } catch (Exception e) {
                        Log.e(TAG, "Snapshot parse error: " + e.getMessage());
                    }
                }
            });

            // Continuous telemetry stream (1 Hz)
            socket.on("telemetry:update", args -> {
                if (args.length > 0 && listener != null) {
                    try {
                        String jsonString = args[0].toString();
                        Telemetry telemetry = gson.fromJson(jsonString, Telemetry.class);
                        mainHandler.post(() -> listener.onTelemetryUpdate(telemetry));
                    } catch (Exception e) {
                        Log.e(TAG, "Telemetry parse error: " + e.getMessage());
                    }
                }
            });

            socket.on("appliance:state_changed", args -> {
                if (args.length > 0 && listener != null) {
                    try {
                        String jsonString = args[0].toString();
                        Appliance appliance = gson.fromJson(jsonString, Appliance.class);
                        mainHandler.post(() -> listener.onApplianceStateChanged(appliance));
                    } catch (Exception e) {
                        Log.e(TAG, "Appliance change parse error: " + e.getMessage());
                    }
                }
            });

            socket.on("alert:new", args -> {
                if (args.length > 0 && listener != null) {
                    try {
                        String jsonString = args[0].toString();
                        AlertItem alert = gson.fromJson(jsonString, AlertItem.class);
                        mainHandler.post(() -> listener.onAlertReceived(alert));
                    } catch (Exception e) {
                        Log.e(TAG, "Alert parse error: " + e.getMessage());
                    }
                }
            });

            socket.connect();

        } catch (URISyntaxException e) {
            Log.e(TAG, "Socket connection error: " + e.getMessage());
        }
    }

    public void disconnect() {
        if (socket != null) {
            socket.disconnect();
            socket.off();
            socket = null;
            isConnected = false;
        }
    }

    public boolean isConnected() {
        return isConnected;
    }

    public void toggleAppliance(String id, boolean targetState) {
        if (socket != null && isConnected) {
            try {
                JSONObject obj = new JSONObject();
                obj.put("id", id);
                obj.put("state", targetState);
                socket.emit("appliance:toggle", obj);
            } catch (JSONException e) {
                Log.e(TAG, "Error emitting toggle: " + e.getMessage());
            }
        }
    }

    public void injectAnomaly(String id, boolean isAnomaly) {
        if (socket != null && isConnected) {
            try {
                JSONObject obj = new JSONObject();
                obj.put("id", id);
                obj.put("isAnomaly", isAnomaly);
                socket.emit("simulation:inject_anomaly", obj);
            } catch (JSONException e) {
                Log.e(TAG, "Error emitting anomaly: " + e.getMessage());
            }
        }
    }
}
