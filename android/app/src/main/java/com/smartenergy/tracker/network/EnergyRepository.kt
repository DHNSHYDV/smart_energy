package com.smartenergy.tracker.network

import android.content.Context
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.smartenergy.tracker.model.AlertItem
import com.smartenergy.tracker.model.Appliance
import com.smartenergy.tracker.model.Telemetry
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class EnergyRepository private constructor(private val context: Context) {
    private val socketManager = SocketManager.getInstance(context)
    private val scope = CoroutineScope(Dispatchers.IO)

    private val _telemetry = MutableLiveData<Telemetry>()
    val telemetry: LiveData<Telemetry> = _telemetry

    private val _appliances = MutableLiveData<List<Appliance>>()
    val appliances: LiveData<List<Appliance>> = _appliances

    private val _alerts = MutableLiveData<List<AlertItem>>()
    val alerts: LiveData<List<AlertItem>> = _alerts

    private val _isConnected = MutableLiveData<Boolean>(false)
    val isConnected: LiveData<Boolean> = _isConnected

    companion object {
        private const val TAG = "EnergyRepository"

        @Volatile
        private var INSTANCE: EnergyRepository? = null

        fun getInstance(context: Context): EnergyRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: EnergyRepository(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    init {
        setupSocketListeners()
    }

    private fun setupSocketListeners() {
        socketManager.onConnectionChanged = { connected ->
            _isConnected.postValue(connected)
            if (connected) {
                fetchInitialData()
            }
        }

        socketManager.onTelemetryReceived = { telem ->
            _telemetry.postValue(telem)
            telem.appliances?.let { appList ->
                _appliances.postValue(appList)
            }
        }

        socketManager.onApplianceChanged = { updatedApp ->
            val currentList = _appliances.value?.toMutableList() ?: mutableListOf()
            val index = currentList.indexOfFirst { it.id == updatedApp.id }
            if (index != -1) {
                currentList[index] = updatedApp
            } else {
                currentList.add(updatedApp)
            }
            _appliances.postValue(currentList)
        }

        socketManager.onAlertReceived = { newAlert ->
            val currentAlerts = _alerts.value?.toMutableList() ?: mutableListOf()
            currentAlerts.add(0, newAlert)
            _alerts.postValue(currentAlerts)
        }
    }

    fun start() {
        socketManager.connect()
        fetchInitialData()
    }

    fun stop() {
        socketManager.disconnect()
    }

    fun reconnect() {
        ApiClient.invalidate()
        socketManager.disconnect()
        socketManager.connect()
        fetchInitialData()
    }

    fun fetchInitialData() {
        scope.launch {
            try {
                val api = ApiClient.getService(context)
                val appResp = api.getAppliances()
                if (appResp.isSuccessful && appResp.body()?.data != null) {
                    _appliances.postValue(appResp.body()!!.data)
                }

                val alertResp = api.getAlerts()
                if (alertResp.isSuccessful && alertResp.body()?.data != null) {
                    _alerts.postValue(alertResp.body()!!.data)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error fetching initial data", e)
            }
        }
    }

    fun toggleAppliance(id: String, state: Boolean) {
        // Optimistic UI update
        val currentList = _appliances.value?.map { app ->
            if (app.id == id) app.copy(isOn = state) else app
        }
        currentList?.let { _appliances.postValue(it) }

        // Fast Socket.IO emission
        socketManager.toggleAppliance(id, state)

        // Fallback HTTP POST
        scope.launch {
            try {
                val api = ApiClient.getService(context)
                api.toggleAppliance(id, mapOf("state" to state))
            } catch (e: Exception) {
                Log.e(TAG, "HTTP toggle fallback error for $id", e)
            }
        }
    }

    suspend fun applyScene(sceneId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(context)
            val resp = api.applyScene(sceneId)
            fetchInitialData()
            resp.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "Failed to apply scene $sceneId", e)
            false
        }
    }

    suspend fun triggerScenario(scenario: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(context)
            val resp = api.triggerScenario(mapOf("scenario" to scenario))
            resp.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "Failed to trigger scenario $scenario", e)
            false
        }
    }

    suspend fun resetSimulation(): Boolean = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(context)
            val resp = api.resetSimulation()
            fetchInitialData()
            resp.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "Failed to reset simulation", e)
            false
        }
    }
}
