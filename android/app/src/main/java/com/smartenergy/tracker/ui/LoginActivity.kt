package com.smartenergy.tracker.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.smartenergy.tracker.R
import com.smartenergy.tracker.auth.SupabaseAuthManager
import com.smartenergy.tracker.network.PreferencesManager
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class LoginActivity : AppCompatActivity() {

    private lateinit var tabLogin: TextView
    private lateinit var tabSignup: TextView
    private lateinit var loginFields: LinearLayout
    private lateinit var signupFields: LinearLayout
    private lateinit var tvBanner: TextView

    // Login fields
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnSignIn: TextView
    private lateinit var tvForgotPassword: TextView

    // Signup fields
    private lateinit var etName: EditText
    private lateinit var etDoorNo: EditText
    private lateinit var etAddress: EditText
    private lateinit var etSignupEmail: EditText
    private lateinit var etSignupPassword: EditText
    private lateinit var btnRegister: TextView

    private var isLoginTab = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        bindViews()
        setupListeners()
    }

    private fun bindViews() {
        findViewById<View>(R.id.btn_back)?.setOnClickListener {
            finish()
        }

        tabLogin = findViewById(R.id.tab_login)
        tabSignup = findViewById(R.id.tab_signup)
        loginFields = findViewById(R.id.login_fields)
        signupFields = findViewById(R.id.signup_fields)
        tvBanner = findViewById(R.id.tv_banner)

        etEmail = findViewById(R.id.et_email)
        etPassword = findViewById(R.id.et_password)
        btnSignIn = findViewById(R.id.btn_sign_in)
        tvForgotPassword = findViewById(R.id.tv_forgot_password)

        etName = findViewById(R.id.et_name)
        etDoorNo = findViewById(R.id.et_door_no)
        etAddress = findViewById(R.id.et_address)
        etSignupEmail = findViewById(R.id.et_signup_email)
        etSignupPassword = findViewById(R.id.et_signup_password)
        btnRegister = findViewById(R.id.btn_register)
        val btnGuestDemo = findViewById<TextView>(R.id.btn_guest_demo)
        btnGuestDemo.setOnClickListener {
            val prefs = PreferencesManager.getInstance(this)
            prefs.supabaseAccessToken = "demo_guest_access_token"
            prefs.supabaseUserEmail = "demo@grid-sense.io"
            startMainActivity()
        }
    }

    private fun setupListeners() {
        tabLogin.setOnClickListener { switchTab(true) }
        tabSignup.setOnClickListener { switchTab(false) }
        btnSignIn.setOnClickListener { handleSignIn() }
        btnRegister.setOnClickListener { handleSignUp() }

        etPassword.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) { handleSignIn(); true } else false
        }

        tvForgotPassword.setOnClickListener {
            val email = etEmail.text.toString().trim()
            if (email.isEmpty() || !email.contains("@")) {
                showBanner("Enter your email first, then tap Forgot Password.", isError = true)
                return@setOnClickListener
            }
            lifecycleScope.launch { sendPasswordResetEmail(email) }
        }
    }

    private fun switchTab(toLogin: Boolean) {
        isLoginTab = toLogin
        hideBanner()
        if (toLogin) {
            loginFields.visibility = View.VISIBLE
            signupFields.visibility = View.GONE
            tabLogin.setBackgroundResource(R.drawable.bg_active_nav_pill)
            tabLogin.setTextColor(android.graphics.Color.parseColor("#0A0A0F"))
            tabSignup.setBackgroundColor(android.graphics.Color.TRANSPARENT)
            tabSignup.setTextColor(android.graphics.Color.parseColor("#475569"))
        } else {
            loginFields.visibility = View.GONE
            signupFields.visibility = View.VISIBLE
            tabSignup.setBackgroundResource(R.drawable.bg_active_nav_pill)
            tabSignup.setTextColor(android.graphics.Color.parseColor("#0A0A0F"))
            tabLogin.setBackgroundColor(android.graphics.Color.TRANSPARENT)
            tabLogin.setTextColor(android.graphics.Color.parseColor("#475569"))
        }
    }

    private fun handleSignIn() {
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString()

        if (email.isEmpty() || !email.contains("@")) {
            showBanner("Please enter a valid email address.", isError = true); return
        }
        if (password.isEmpty()) {
            showBanner("Please enter your password.", isError = true); return
        }

        setLoading(true)
        lifecycleScope.launch {
            val result = SupabaseAuthManager.signIn(email, password)
            setLoading(false)
            if (result.success && result.accessToken != null) {
                SupabaseAuthManager.saveSession(this@LoginActivity, result)
                verifyWithBackend(result.accessToken)
            } else {
                showBanner(result.error ?: "Login failed. Check your credentials.", isError = true)
            }
        }
    }

    private fun handleSignUp() {
        val name = etName.text.toString().trim()
        val doorNo = etDoorNo.text.toString().trim()
        val address = etAddress.text.toString().trim()
        val email = etSignupEmail.text.toString().trim()
        val password = etSignupPassword.text.toString()

        if (name.isEmpty()) { showBanner("Full name is required.", isError = true); return }
        if (doorNo.isEmpty()) { showBanner("Door/flat number is required.", isError = true); return }
        if (address.isEmpty()) { showBanner("Address is required.", isError = true); return }
        if (email.isEmpty() || !email.contains("@")) { showBanner("Valid email required.", isError = true); return }
        if (password.length < 6) { showBanner("Password must be at least 6 characters.", isError = true); return }

        setLoading(true)
        lifecycleScope.launch {
            val result = SupabaseAuthManager.signUp(email, password, name, doorNo, address)
            setLoading(false)
            when {
                result.success && result.accessToken != null -> {
                    SupabaseAuthManager.saveSession(this@LoginActivity, result)
                    verifyWithBackend(result.accessToken)
                }
                result.success && result.error == "CONFIRM_EMAIL" -> {
                    showBanner("Account created! Check your email to confirm, then sign in.", isError = false)
                    switchTab(true)
                }
                else -> showBanner(result.error ?: "Registration failed.", isError = true)
            }
        }
    }

    private suspend fun verifyWithBackend(accessToken: String) {
        try {
            val prefs = PreferencesManager.getInstance(this)
            val url = URL("${prefs.serverUrl}/api/auth/verify")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Authorization", "Bearer $accessToken")
                connectTimeout = 10_000
                readTimeout = 10_000
                doOutput = true
            }
            conn.outputStream.write("{}".toByteArray())
            conn.responseCode // trigger request
        } catch (_: Exception) {
            // Supabase auth succeeded — let them in even if backend is unreachable
        }
        startMainActivity()
    }

    private suspend fun sendPasswordResetEmail(email: String) {
        showBanner("Sending reset link…", isError = false)
        try {
            val url = URL("https://zylkysxotwhdeyffbotn.supabase.co/auth/v1/recover")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("apikey", "sb_publishable_4wlluZJHZMhjrslaZy8FSA_Qn94nsa_")
                doOutput = true
                connectTimeout = 10_000
            }
            conn.outputStream.write(JSONObject().put("email", email).toString().toByteArray())
            conn.responseCode
            showBanner("Password reset email sent. Check your inbox.", isError = false)
        } catch (e: Exception) {
            showBanner("Failed to send reset email.", isError = true)
        }
    }

    private fun startMainActivity() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    private fun setLoading(loading: Boolean) {
        btnSignIn.isEnabled = !loading
        btnRegister.isEnabled = !loading
        btnSignIn.alpha = if (loading && isLoginTab) 0.6f else 1f
        btnRegister.alpha = if (loading && !isLoginTab) 0.6f else 1f
        btnSignIn.text = if (loading && isLoginTab) "Signing In…" else "Sign In"
        btnRegister.text = if (loading && !isLoginTab) "Creating Account…" else "Create Account"
    }

    private fun showBanner(message: String, isError: Boolean) {
        runOnUiThread {
            tvBanner.visibility = View.VISIBLE
            tvBanner.text = message
            tvBanner.setTextColor(
                if (isError) android.graphics.Color.parseColor("#F87171")
                else android.graphics.Color.parseColor("#34D399")
            )
        }
    }

    private fun hideBanner() {
        tvBanner.visibility = View.GONE
    }
}
