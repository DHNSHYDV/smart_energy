package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.smartenergy.tracker.R
import com.smartenergy.tracker.databinding.FragmentAutomationsBinding
import com.smartenergy.tracker.network.EnergyRepository
import com.smartenergy.tracker.network.PreferencesManager
import kotlinx.coroutines.launch

class AutomationsFragment : Fragment() {
    private var _binding: FragmentAutomationsBinding? = null
    private val binding get() = _binding!!

    private lateinit var repo: EnergyRepository
    private var activeSceneId: String = "eco_saver"

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAutomationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val ctx = context ?: return
        repo = EnergyRepository.getInstance(ctx.applicationContext)

        setupListeners()
        updateScenePills()
        displayServerConfig()
    }

    private fun displayServerConfig() {
        val ctx = context ?: return
        val b = _binding ?: return
        val prefs = PreferencesManager.getInstance(ctx.applicationContext)
        b.tvSettingServerUrl.text = "Target: ${prefs.baseUrl}"
    }

    private fun setupListeners() {
        binding.swipeRefreshAutomations.setOnRefreshListener {
            displayServerConfig()
            binding.swipeRefreshAutomations.isRefreshing = false
        }

        binding.cardSceneNight.setOnClickListener {
            activeSceneId = "night_mode"
            updateScenePills()
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("night_mode")
            }
        }

        binding.cardSceneEco.setOnClickListener {
            activeSceneId = "eco_saver"
            updateScenePills()
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("eco_saver")
            }
        }

        binding.cardSceneWork.setOnClickListener {
            activeSceneId = "work_mode"
            updateScenePills()
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("work_mode")
            }
        }

        binding.cardSceneViva.setOnClickListener {
            activeSceneId = "viva_demo"
            updateScenePills()
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("viva_demo")
            }
        }


        binding.btnOpenServerConfig.setOnClickListener {
            ServerConfigDialog().show(parentFragmentManager, "ServerConfigDialog")
        }

        binding.btnOpenSimulationLab.setOnClickListener {
            SystemLabBottomSheet().show(parentFragmentManager, "SystemLabBottomSheet")
        }
    }

    private fun updateScenePills() {
        val ctx = context ?: return
        val b = _binding ?: return
        val activeColor = ContextCompat.getColor(ctx, R.color.emerald_500)
        val inactiveColor = ContextCompat.getColor(ctx, R.color.text_secondary)

        b.pillSceneNight.text = if (activeSceneId == "night_mode") "ACTIVE" else "INACTIVE"
        b.pillSceneNight.setTextColor(if (activeSceneId == "night_mode") activeColor else inactiveColor)

        b.pillSceneEco.text = if (activeSceneId == "eco_saver") "ACTIVE" else "INACTIVE"
        b.pillSceneEco.setTextColor(if (activeSceneId == "eco_saver") activeColor else inactiveColor)

        b.pillSceneWork.text = if (activeSceneId == "work_mode") "ACTIVE" else "INACTIVE"
        b.pillSceneWork.setTextColor(if (activeSceneId == "work_mode") activeColor else inactiveColor)

        b.pillSceneViva.text = if (activeSceneId == "viva_demo") "ACTIVE" else "INACTIVE"
        b.pillSceneViva.setTextColor(if (activeSceneId == "viva_demo") activeColor else inactiveColor)
    }

    override fun onResume() {
        super.onResume()
        displayServerConfig()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
