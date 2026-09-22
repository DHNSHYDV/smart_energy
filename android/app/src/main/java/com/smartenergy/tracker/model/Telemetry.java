package com.smartenergy.tracker.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Telemetry {
    @SerializedName("deviceId")
    private String deviceId;

    @SerializedName("gridVoltage")
    private double gridVoltage;

    @SerializedName("totalActivePower")
    private double totalActivePower;

    @SerializedName("totalCurrent")
    private double totalCurrent;

    @SerializedName("systemPowerFactor")
    private double systemPowerFactor;

    @SerializedName("totalEnergyTodayKwh")
    private double totalEnergyTodayKwh;

    @SerializedName("estimatedCost")
    private double estimatedCost;

    @SerializedName("carbonKg")
    private double carbonKg;

    @SerializedName("isPeakHour")
    private boolean isPeakHour;

    @SerializedName("tariffRate")
    private double tariffRate;

    @SerializedName("appliances")
    private List<Appliance> appliances;

    public String getDeviceId() { return deviceId; }
    public double getGridVoltage() { return gridVoltage; }
    public double getTotalActivePower() { return totalActivePower; }
    public double getTotalCurrent() { return totalCurrent; }
    public double getSystemPowerFactor() { return systemPowerFactor; }
    public double getTotalEnergyTodayKwh() { return totalEnergyTodayKwh; }
    public double getEstimatedCost() { return estimatedCost; }
    public double getCarbonKg() { return carbonKg; }
    public boolean isPeakHour() { return isPeakHour; }
    public double getTariffRate() { return tariffRate; }
    public List<Appliance> getAppliances() { return appliances; }
}
