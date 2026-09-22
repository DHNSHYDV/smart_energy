package com.smartenergy.tracker.model;

import com.google.gson.annotations.SerializedName;

public class SensorReading {
    @SerializedName("sensorType")
    private String sensorType;

    @SerializedName("voltage")
    private double voltage;

    @SerializedName("current")
    private double current;

    @SerializedName("powerFactor")
    private double powerFactor;

    @SerializedName("activePower")
    private double activePower;

    @SerializedName("apparentPower")
    private double apparentPower;

    @SerializedName("reactivePower")
    private double reactivePower;

    @SerializedName("cumulativeEnergyKwh")
    private double cumulativeEnergyKwh;

    @SerializedName("status")
    private String status;

    public double getVoltage() { return voltage; }
    public double getCurrent() { return current; }
    public double getPowerFactor() { return powerFactor; }
    public double getActivePower() { return activePower; }
    public double getApparentPower() { return apparentPower; }
    public double getReactivePower() { return reactivePower; }
    public double getCumulativeEnergyKwh() { return cumulativeEnergyKwh; }
    public String getStatus() { return status; }
}
