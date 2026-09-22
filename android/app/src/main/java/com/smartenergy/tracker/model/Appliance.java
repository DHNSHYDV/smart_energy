package com.smartenergy.tracker.model;

import com.google.gson.annotations.SerializedName;

public class Appliance {
    @SerializedName("id")
    private String id;

    @SerializedName("name")
    private String name;

    @SerializedName("type")
    private String type;

    @SerializedName("location")
    private String location;

    @SerializedName("ratedPower")
    private double ratedPower;

    @SerializedName("powerFactor")
    private double powerFactor;

    @SerializedName("isOn")
    private boolean isOn;

    @SerializedName("isAnomaly")
    private boolean isAnomaly;

    @SerializedName("reading")
    private SensorReading reading;

    public String getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getLocation() { return location; }
    public double getRatedPower() { return ratedPower; }
    public double getPowerFactor() { return powerFactor; }
    public boolean isOn() { return isOn; }
    public void setOn(boolean on) { isOn = on; }
    public boolean isAnomaly() { return isAnomaly; }
    public void setAnomaly(boolean anomaly) { isAnomaly = anomaly; }
    public SensorReading getReading() { return reading; }
    public void setReading(SensorReading reading) { this.reading = reading; }
}
