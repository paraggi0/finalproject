package com.bangor.system.utils;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

public class NetworkUtils {

    private static final String TAG = "NetworkUtils";

    // Configuration untuk backend yang berjalan di port 3001
    // ⚡ STATIC IP: 192.168.1.184:3001 untuk Production Network
    public static final String LOCALHOST_EMULATOR = "http://10.0.2.2:3001";
    public static final String STATIC_IP_SERVER = "http://192.168.1.184:3001"; // Static IP Server - PRIORITY
    public static final String LOCALHOST_DEVICE = "http://192.168.1.184:3001"; // Same static IP for device
    public static final String PRODUCTION_URL = "http://192.168.1.184:3001";

    public static boolean isNetworkAvailable(Context context) {
        ConnectivityManager connectivityManager =
            (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }

    public static String getBaseUrl() {
        // ⚡ STATIC IP: Prioritaskan 192.168.0.153:3001 untuk production network
        // Baik emulator maupun device fisik akan menggunakan static IP
        boolean isEmulator = android.os.Build.FINGERPRINT.contains("generic") ||
                           android.os.Build.MODEL.contains("Emulator") ||
                           android.os.Build.HARDWARE.contains("goldfish");

        // Gunakan static IP 192.168.1.184:3001 untuk semua testing
        String baseUrl = STATIC_IP_SERVER; // Always use static IP for production

        Log.d(TAG, "Using static IP base URL: " + baseUrl);
        return baseUrl;
    }

    // Method untuk set custom IP (berguna untuk testing dengan device fisik)
    public static String getCustomBaseUrl(String ipAddress) {
        return "http://" + ipAddress + ":3001";
    }
    
    // Method untuk testing dengan fallback IP
    public static String getBaseUrlWithFallback() {
        boolean isEmulator = android.os.Build.FINGERPRINT.contains("generic") ||
                           android.os.Build.MODEL.contains("Emulator") ||
                           android.os.Build.HARDWARE.contains("goldfish");

        if (isEmulator) {
            Log.d(TAG, "Using emulator URL: " + LOCALHOST_EMULATOR);
            return LOCALHOST_EMULATOR;
        } else {
            // Try static IP first, fallback to DHCP IP
            Log.d(TAG, "Primary URL (Static IP): " + STATIC_IP_SERVER);
            Log.d(TAG, "Fallback URL (Current IP): http://192.168.1.184:3001");
            return STATIC_IP_SERVER; // App will handle fallback in ApiService
        }
    }
    
    // Method untuk mendapatkan semua possible URLs untuk testing
    public static String[] getAllPossibleUrls() {
        boolean isEmulator = android.os.Build.FINGERPRINT.contains("generic") ||
                           android.os.Build.MODEL.contains("Emulator") ||
                           android.os.Build.HARDWARE.contains("goldfish");
        
        if (isEmulator) {
            return new String[]{LOCALHOST_EMULATOR};
        } else {
            return new String[]{STATIC_IP_SERVER, LOCALHOST_DEVICE};
        }
    }

    public static void logNetworkInfo(Context context) {
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();

        if (activeNetwork != null) {
            Log.d(TAG, "Network Type: " + activeNetwork.getTypeName());
            Log.d(TAG, "Is Connected: " + activeNetwork.isConnected());
            Log.d(TAG, "Is Available: " + activeNetwork.isAvailable());
        } else {
            Log.d(TAG, "No active network");
        }
    }
}