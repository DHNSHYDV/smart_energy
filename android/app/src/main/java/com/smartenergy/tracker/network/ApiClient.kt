package com.smartenergy.tracker.network

import android.content.Context
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    @Volatile
    private var retrofit: Retrofit? = null

    @Volatile
    private var currentBaseUrl: String? = null

    @Synchronized
    fun getService(context: Context): ApiService {
        val prefs = PreferencesManager.getInstance(context)
        val targetUrl = prefs.baseUrl

        if (retrofit == null || currentBaseUrl != targetUrl) {
            currentBaseUrl = targetUrl
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val authInterceptor = Interceptor { chain ->
                val token = PreferencesManager.getInstance(context).supabaseAccessToken
                val request = if (!token.isNullOrEmpty()) {
                    chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .build()
                } else {
                    chain.request()
                }
                chain.proceed(request)
            }

            val okHttpClient = OkHttpClient.Builder()
                .connectTimeout(5, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .addInterceptor(authInterceptor)
                .addInterceptor(logging)
                .build()

            retrofit = try {
                Retrofit.Builder()
                    .baseUrl(targetUrl)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
            } catch (e: Exception) {
                val fallbackUrl = PreferencesManager.DEFAULT_RAILWAY_URL + "/"
                currentBaseUrl = fallbackUrl
                Retrofit.Builder()
                    .baseUrl(fallbackUrl)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
            }
        }

        return retrofit!!.create(ApiService::class.java)
    }

    @Synchronized
    fun invalidate() {
        retrofit = null
        currentBaseUrl = null
    }
}
