package com.smartenergy.tracker.ui

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import androidx.fragment.app.Fragment
import com.smartenergy.tracker.R
import com.smartenergy.tracker.network.PreferencesManager

class LiveSpaceFragment : Fragment() {

    private var webView: WebView? = null
    private var progressBar: ProgressBar? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_livespace, container, false)
        webView = view.findViewById(R.id.webView3D)
        progressBar = view.findViewById(R.id.progressBar3D)
        setupWebView()
        return view
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val wv = webView ?: return
        val settings = wv.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.allowFileAccess = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        wv.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        wv.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress >= 80) {
                    progressBar?.visibility = View.GONE
                }
            }
        }

        wv.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar?.visibility = View.GONE
            }
        }

        val ctx = context ?: return
        val baseUrl = PreferencesManager.getInstance(ctx.applicationContext).baseUrl.trimEnd('/')
        val liveSpaceUrl = "$baseUrl/#/live-space"
        wv.loadUrl(liveSpaceUrl)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        webView?.destroy()
        webView = null
        progressBar = null
    }
}
