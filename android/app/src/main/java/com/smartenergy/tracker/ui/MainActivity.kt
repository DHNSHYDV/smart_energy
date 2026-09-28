package com.smartenergy.tracker.ui

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.smartenergy.tracker.R
import com.smartenergy.tracker.databinding.ActivityMainBinding
import com.smartenergy.tracker.network.EnergyRepository
import com.smartenergy.tracker.network.PreferencesManager

class MainActivity : AppCompatActivity() {
    private var _binding: ActivityMainBinding? = null
    private val binding get() = _binding!!

    private lateinit var repo: EnergyRepository

    val homeFragment by lazy { HomeFragment() }
    val devicesFragment by lazy { DevicesFragment() }
    val analyticsFragment by lazy { AnalyticsFragment() }
    val automationsFragment by lazy { AutomationsFragment() }

    private var activeTabId: Int = R.id.nav_home
    private val handler = Handler(Looper.getMainLooper())
    private var hideToastRunnable: Runnable? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = PreferencesManager.getInstance(this)
        if (!prefs.isLoggedIn) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        _binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        repo = EnergyRepository.getInstance(this)
        repo.start()

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, homeFragment)
                .commitAllowingStateLoss()
            updateDockUi(R.id.nav_home)
        }

        setupDockNavigation()
        setupToastObserver()

        UpdateManager.checkForUpdates(this, silent = true)
    }

    private fun setupDockNavigation() {
        binding.navHome.setOnClickListener { switchTab(R.id.nav_home, homeFragment) }
        binding.navDevices.setOnClickListener { switchTab(R.id.nav_devices, devicesFragment) }
        binding.navAnalytics.setOnClickListener { switchTab(R.id.nav_analytics, analyticsFragment) }
        binding.navAutomations.setOnClickListener { switchTab(R.id.nav_automations, automationsFragment) }
    }

    fun navigateToTab(tabId: Int) {
        val fragment = when (tabId) {
            R.id.nav_home -> homeFragment
            R.id.nav_devices -> devicesFragment
            R.id.nav_analytics -> analyticsFragment
            R.id.nav_automations -> automationsFragment
            else -> homeFragment
        }
        switchTab(tabId, fragment)
    }

    private fun switchTab(tabId: Int, fragment: Fragment) {
        if (activeTabId == tabId) return
        activeTabId = tabId

        supportFragmentManager.beginTransaction()
            .setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
            .replace(R.id.fragment_container, fragment)
            .commitAllowingStateLoss()

        updateDockUi(tabId)
    }

    private fun updateDockUi(selectedTabId: Int) {
        val b = _binding ?: return
        val tabs = listOf(
            Triple(b.navHome, b.ivNavHome, b.tvNavHome),
            Triple(b.navDevices, b.ivNavDevices, b.tvNavDevices),
            Triple(b.navAnalytics, b.ivNavAnalytics, b.tvNavAnalytics),
            Triple(b.navAutomations, b.ivNavAutomations, b.tvNavAutomations)
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

    private fun setupToastObserver() {
        repo.toastEvent.observe(this) { message ->
            if (!message.isNullOrEmpty()) {
                showFloatingNotice(message)
            }
        }
    }

    private fun showFloatingNotice(message: String) {
        hideToastRunnable?.let { handler.removeCallbacks(it) }

        val b = _binding ?: return
        b.tvFloatingToastText.text = message
        b.floatingToastCard.apply {
            alpha = 0f
            translationY = 40f
            visibility = View.VISIBLE
            animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(220)
                .start()
        }

        val runnable = Runnable {
            _binding?.floatingToastCard?.animate()
                ?.alpha(0f)
                ?.translationY(30f)
                ?.setDuration(200)
                ?.withEndAction {
                    _binding?.floatingToastCard?.visibility = View.GONE
                }
                ?.start()
        }
        hideToastRunnable = runnable
        handler.postDelayed(runnable, 2600)
    }

    override fun onDestroy() {
        super.onDestroy()
        hideToastRunnable?.let { handler.removeCallbacks(it) }
        repo.stop()
        _binding = null
    }
}
