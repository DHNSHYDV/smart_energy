package com.smartenergy.tracker.network;

import com.google.gson.JsonObject;
import com.smartenergy.tracker.model.AlertItem;
import com.smartenergy.tracker.model.Appliance;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    @GET("api/appliances")
    Call<JsonObject> getAppliances();

    @POST("api/appliances/{id}/toggle")
    Call<JsonObject> toggleAppliance(@Path("id") String id, @Body Map<String, Boolean> body);

    @POST("api/appliances/{id}/anomaly")
    Call<JsonObject> testAnomaly(@Path("id") String id, @Body Map<String, Boolean> body);

    @GET("api/alerts")
    Call<JsonObject> getAlerts(@Query("limit") int limit);

    @POST("api/alerts/{id}/resolve")
    Call<JsonObject> resolveAlert(@Path("id") long id);

    @GET("api/analytics/attribution")
    Call<JsonObject> getAttribution();

    @GET("api/analytics/historical")
    Call<JsonObject> getHistorical(@Query("range") String range);
}
