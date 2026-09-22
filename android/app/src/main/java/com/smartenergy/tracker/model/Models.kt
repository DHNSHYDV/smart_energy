package com.smartenergy.tracker.model

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("message") val message: String?,
    @SerializedName("count") val count: Int? = null
)

data class Telemetry(
    @SerializedName("deviceId") val deviceId: String? = "ESP32-SIM-001",
    @SerializedName("timestamp") val timestamp: String? = null,
    @SerializedName("gridVoltage") val gridVoltage: Double = 230.0,
    @SerializedName("totalActivePower") val totalActivePower: Double = 0.0,
    @SerializedName("totalCurrent") val totalCurrent: Double = 0.0,
    @SerializedName("systemPowerFactor") val systemPowerFactor: Double = 0.98,
    @SerializedName("totalEnergyTodayKwh") val totalEnergyTodayKwh: Double = 0.0,
    @SerializedName("estimatedCost") val estimatedCost: Double = 0.0,
    @SerializedName("carbonKg") val carbonKg: Double = 0.0,
    @SerializedName("isPeakHour") val isPeakHour: Boolean = false,
    @SerializedName("tariffRate") val tariffRate: Double = 7.50,
    @SerializedName("speedMultiplier") val speedMultiplier: Double = 1.0,
    @SerializedName("appliances") val appliances: List<Appliance>? = null
)

data class Appliance(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("type") val type: String? = null,
    @SerializedName("location") val location: String? = "Main Board",
    @SerializedName("ratedPower") val ratedPower: Double = 0.0,
    @SerializedName("minPower") val minPower: Double = 0.0,
    @SerializedName("maxPower") val maxPower: Double = 0.0,
    @SerializedName("powerFactor") val powerFactor: Double = 0.95,
    @SerializedName("isOn") var isOn: Boolean = false,
    @SerializedName("isAnomaly") var isAnomaly: Boolean = false,
    @SerializedName("category") val category: String? = "General",
    @SerializedName("icon") val icon: String? = null,
    @SerializedName("runtimeSeconds") val runtimeSeconds: Long = 0,
    @SerializedName("continuousOnSeconds") val continuousOnSeconds: Long = 0,
    @SerializedName("reading") var reading: SensorReading? = null
)

data class SensorReading(
    @SerializedName("sensorType") val sensorType: String? = "CT Clamp PZEM-004T",
    @SerializedName("voltage") val voltage: Double = 230.0,
    @SerializedName("current") val current: Double = 0.0,
    @SerializedName("powerFactor") val powerFactor: Double = 0.95,
    @SerializedName("activePower") val activePower: Double = 0.0,
    @SerializedName("apparentPower") val apparentPower: Double = 0.0,
    @SerializedName("reactivePower") val reactivePower: Double = 0.0,
    @SerializedName("cumulativeEnergyKwh") val cumulativeEnergyKwh: Double = 0.0,
    @SerializedName("status") val status: String? = "NORMAL"
)

data class AlertItem(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("appliance_id") val applianceId: String? = null,
    @SerializedName("alert_type") val alertType: String? = "WARNING",
    @SerializedName("severity") val severity: String? = "warning",
    @SerializedName("message") val message: String? = "",
    @SerializedName("is_resolved") var isResolved: Int = 0,
    @SerializedName("timestamp") val timestamp: String? = null
) {
    val resolved: Boolean get() = isResolved == 1
}

data class SceneItem(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = "",
    @SerializedName("icon") val icon: String? = "leaf",
    @SerializedName("active") var active: Boolean = false
)

data class RuleItem(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("condition") val condition: String? = "",
    @SerializedName("action") val action: String? = "",
    @SerializedName("enabled") var enabled: Boolean = true
)

data class ForecastData(
    @SerializedName("model") val model: String? = "Diurnal Peak Predictor (Ridge-Polynomial)",
    @SerializedName("hourly") val hourly: List<ForecastHour>? = null,
    @SerializedName("totalExpectedKwh") val totalExpectedKwh: Double? = 0.0,
    @SerializedName("predictedCost") val predictedCost: Double? = 0.0,
    @SerializedName("peakHour") val peakHour: Int? = 19
)

data class ForecastHour(
    @SerializedName("hour") val hour: Int = 0,
    @SerializedName("predictedKw") val predictedKw: Double = 0.0,
    @SerializedName("cost") val cost: Double = 0.0,
    @SerializedName("isPeak") val isPeak: Boolean = false
)

data class LoadShiftingData(
    @SerializedName("currentPeakHour") val currentPeakHour: Boolean = false,
    @SerializedName("recommendations") val recommendations: List<ShiftRecommendation>? = null,
    @SerializedName("potentialSavings") val potentialSavings: Double? = 0.0
)

data class ShiftRecommendation(
    @SerializedName("applianceId") val applianceId: String,
    @SerializedName("applianceName") val applianceName: String,
    @SerializedName("currentCost") val currentCost: Double = 0.0,
    @SerializedName("shiftedCost") val shiftedCost: Double = 0.0,
    @SerializedName("savings") val savings: Double = 0.0,
    @SerializedName("suggestedHour") val suggestedHour: String = "23:00"
)

data class ToggleResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: Appliance?
)
