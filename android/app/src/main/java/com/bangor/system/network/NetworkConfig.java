package com.bangor.system.network;

import com.bangor.system.utils.NetworkUtils;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import java.util.concurrent.TimeUnit;

public class NetworkConfig {

    // Backend Configuration untuk VS Code setup
    public static String getBaseUrl() {
        return NetworkUtils.getBaseUrl();
    }

    // API Endpoints sesuai dengan backend yang sudah dibuat
    // Authentication endpoints
    public static final String AUTH_LOGIN = "/api/android/login";
    public static final String ANDROID_STATUS = "/api/android/status";
    
    // Production endpoints
    public static final String BOM_DROPDOWN = "/api/android/production/bom-dropdown";
    public static final String BOM_BY_CUSTOMER = "/api/android/production/bom-by-customer";
    public static final String BOM_DETAILS = "/api/android/production/bom-details";
    public static final String BOM_SEARCH = "/api/android/production/bom-search";
    public static final String BOM_STATS = "/api/android/production/bom-stats";
    public static final String MC_OUTPUT = "/api/android/production/mcoutput";
    public static final String MC_STATUS = "/api/android/production/mcstatus";
    public static final String TRANSFER_QC = "/api/android/production/transfer-qc";
    public static final String WIP_SECOND = "/api/android/production/wip-second";
    
    // QC endpoints
    public static final String QC_INCOMING = "/api/android/qc/incoming";
    public static final String QC_NG = "/api/android/qc/ng";
    public static final String QC_OUTGOING = "/api/android/qc/outgoing";
    public static final String QC_RETURN = "/api/android/qc/return";
    
    // Stock endpoints
    public static final String STOCK_WIP = "/api/android/stock/wip";
    public static final String STOCK_FG = "/api/android/stock/finish-goods";
    public static final String STOCK_SUMMARY = "/api/android/stock/summary";
    
    // Tables info
    public static final String TABLES_INFO = "/api/android/tables-info";
    
    // API Key untuk authentication
    public static final String API_KEY = "android-topline-2025";

    private static OkHttpClient httpClient;

    public static OkHttpClient getHttpClient() {
        if (httpClient == null) {
            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

            httpClient = new OkHttpClient.Builder()
                    .addInterceptor(loggingInterceptor)
                    .addInterceptor(chain -> {
                        // Tambahkan API key ke semua request
                        Request originalRequest = chain.request();
                        Request.Builder requestBuilder = originalRequest.newBuilder()
                                .header("x-api-key", API_KEY)
                                .header("Content-Type", "application/json")
                                .header("User-Agent", "ToplineManufacturing-Android/1.0");
                        
                        Request newRequest = requestBuilder.build();
                        return chain.proceed(newRequest);
                    })
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .retryOnConnectionFailure(true)
                    .build();
        }
        return httpClient;
    }
}
