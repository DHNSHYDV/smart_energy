package com.smartenergy.tracker.model;

import com.google.gson.annotations.SerializedName;

public class AlertItem {
    @SerializedName("id")
    private long id;

    @SerializedName("appliance_id")
    private String applianceId;

    @SerializedName("alert_type")
    private String alertType;

    @SerializedName("severity")
    private String severity;

    @SerializedName("message")
    private String message;

    @SerializedName("is_resolved")
    private int isResolved;

    @SerializedName("timestamp")
    private String timestamp;

    public long getId() { return id; }
    public String getApplianceId() { return applianceId; }
    public String getAlertType() { return alertType; }
    public String getSeverity() { return severity; }
    public String getMessage() { return message; }
    public boolean isResolved() { return isResolved == 1; }
    public void setResolved(boolean resolved) { this.isResolved = resolved ? 1 : 0; }
    public String getTimestamp() { return timestamp; }
}
