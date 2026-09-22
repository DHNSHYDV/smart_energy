package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.smartenergy.tracker.R
import com.smartenergy.tracker.databinding.ActivityMainBinding
import com.smartenergy.tracker.network.EnergyRepository

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var repo: EnergyRepository

    private val homeFragment = HomeFragment()
    private val devicesFragment = DevicesFragment()
    private val analyticsFragment = AnalyticsFragment()
    private val automationsFragment = AutomationsFragment()

    private var activeTabId: Int = R.id.nav_home

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        repo = EnergyRepository.getInstance(this)
        repo.start()

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, homeFragment)
                .commit()
            updateDockUi(R.id.nav_home)
        }

        setupDockNavigation()
    }

    private fun setupDockNavigation() {
        binding.navHome.setOnClickListener { switchTab(R.id.nav_home, homeFragment) }
        binding.navDevices.setOnClickListener { switchTab(R.id.nav_devices, devicesFragment) }
        binding.navAnalytics.setOnClickListener { switchTab(R.id.nav_analytics, analyticsFragment) }
        binding.navAutomations.setOnClickListener { switchTab(R.id.nav_automations, automationsFragment) }
    }

    private fun switchTab(tabId: Int, fragment: Fragment) {
        if (activeTabId == tabId) return
        activeTabId = tabId

        supportFragmentManager.beginTransaction()
            .setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
            .replace(R.id.fragment_container, fragment)
            .commit()

        updateDockUi(tabId)
    }

    private fun updateDockUi(selectedTabId: Int) {
        val tabs = listOf(
            Triple(binding.navHome, binding.ivNavHome, binding.tvNavHome),
            Triple(binding.navDevices, binding.ivNavDevices, binding.tvNavDevices),
            Triple(binding.navAnalytics, binding.ivNavAnalytics, binding.tvNavAnalytics),
            Triple(binding.navAutomations, binding.ivNavAutomations, binding.tvNavAutomations)
        )

        for ((container, iv, tv) in tabs) {
            val isSelected = container.id == selectedTabId
            if (isSelected) {
                container.setBackgroundResource(R.drawable.bg_active_nav_pill)
                iv.setColorFilter(ContextCompat.getColor(this, R.color.active_nav_text))
                tv.visibility = View.VISIBLE
            } else {
                container.background = null
                iv.setColorFilter(ContextCompat.getColor(this, R.color.inactive_nav_text))
                tv.visibility = View.GONE
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        repo.stop()
    }
}
