package com.smartenergy.tracker.network;

import android.content.Context;
import android.content.SharedPreferences;

public class PreferencesManager {
    private static final String PREF_NAME = "SmartEnergyPrefs";
    private static final String KEY_SERVER_IP = "server_ip";
    private static final String DEFAULT_IP = "192.168.1.42:5000";

    private final SharedPreferences prefs;

    public PreferencesManager(Context context) {
        this.prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public String getServerIp() {
        return prefs.getString(KEY_SERVER_IP, DEFAULT_IP);
    }

    public void setServerIp(String ip) {
        prefs.edit().putString(KEY_SERVER_IP, ip.trim()).apply();
    }

    public String getBaseUrl() {
        String ip = getServerIp();
        if (!ip.startsWith("http://") && !ip.startsWith("https://")) {
            ip = "http://" + ip;
        }
        if (!ip.endsWith("/")) {
            ip = ip + "/";
        }
        return ip;
    }
}
