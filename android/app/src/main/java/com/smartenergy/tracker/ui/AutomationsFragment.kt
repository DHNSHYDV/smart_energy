package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.smartenergy.tracker.databinding.FragmentAutomationsBinding
import com.smartenergy.tracker.network.ApiClient
import com.smartenergy.tracker.network.EnergyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class AutomationsFragment : Fragment() {
    private var _binding: FragmentAutomationsBinding? = null
    private val binding get() = _binding!!

    private lateinit var repo: EnergyRepository

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
        repo = EnergyRepository.getInstance(requireContext())

        setupListeners()
        loadLoadShifting()
    }

    private fun setupListeners() {
        binding.swipeRefreshAutomations.setOnRefreshListener {
            loadLoadShifting()
            binding.swipeRefreshAutomations.isRefreshing = false
        }

        binding.cardSceneNight.setOnClickListener {
            applyScene("night_mode", "🌙 Night Mode active (non-essentials turned off)")
        }

        binding.cardSceneEco.setOnClickListener {
            applyScene("eco_saver", "🌿 Eco Shift applied: Dispatched to lowest tariff tier")
        }

        binding.cardSceneWork.setOnClickListener {
            applyScene("work_mode", "💼 Work Mode active: IT & Office circuits prioritized")
        }

        binding.cardSceneViva.setOnClickListener {
            applyScene("viva_demo", "⚡ Full Load Demo: All 6 appliances running for evaluation")
        }
    }

    private fun applyScene(sceneId: String, successMsg: String) {
        viewLifecycleOwner.lifecycleScope.launch {
            val ok = repo.applyScene(sceneId)
            Toast.makeText(context, if (ok) successMsg else "Scene command dispatched", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadLoadShifting() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val api = ApiClient.getService(requireContext())
                val resp = withContext(Dispatchers.IO) { api.getLoadShifting() }
                if (resp.isSuccessful && resp.body()?.data != null) {
                    val shifting = resp.body()!!.data!!
                    shifting.potentialSavings?.let { savings ->
                        binding.tvShiftingSavingsBadge.text = String.format(Locale.US, "Save ₹%.2f/day", savings)
                    }
                }
            } catch (_: Exception) {}
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
