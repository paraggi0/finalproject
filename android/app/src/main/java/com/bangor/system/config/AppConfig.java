package com.bangor.system.config;

public class AppConfig {
    // Backend Configuration - PUBLIC STATIC IP
    public static final String BACKEND_BASE_URL = "http://192.168.0.153:3001/api";
    public static final String API_KEY = "android-topline-2025";
    
    // Connection Settings
    public static final int CONNECTION_TIMEOUT = 30; // seconds
    public static final int READ_TIMEOUT = 30; // seconds
    public static final int WRITE_TIMEOUT = 30; // seconds
    
    // Debug Settings
    public static final boolean DEBUG_MODE = true;
    public static final boolean ENABLE_LOGGING = true;
    
    // Production Settings - PUBLIC STATIC IP
    public static final String PRODUCTION_SERVER = "http://192.168.0.153:3001";
    public static final String DEVELOPMENT_SERVER = "http://10.0.2.2:3001";
    
    // API Endpoints
    public static class Endpoints {
        public static final String ANDROID_STATUS = "/android/status";
        public static final String BOM_DROPDOWN = "/android/bom/dropdown";
        public static final String LOGIN = "/android/login";
        public static final String MACHINE_OUTPUT = "/android/machine/output";
        public static final String QC_TRANSFER = "/android/qc/transfer";
        public static final String STOCK_INFO = "/android/stock/info";
    }
    
    // Default Values
    public static class Defaults {
        public static final String DEFAULT_CUSTOMER = "";
        public static final String DEFAULT_PART_NUMBER = "";
        public static final String DEFAULT_MODEL = "";
        public static final int DEFAULT_QUANTITY = 0;
    }
}
