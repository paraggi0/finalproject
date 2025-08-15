package com.bangor.system.network;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class ApiService {

    // --- Konfigurasi Utama ---
    // Menggunakan NetworkConfig untuk base URL yang dinamis
    private static final String API_KEY = "android-topline-2025";
    public static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    // --- Akhir Konfigurasi ---

    private static ApiService instance;
    private final OkHttpClient client;
    private String authToken;

    // Callback interface untuk menangani respons dari API
    public interface ApiCallback {
        void onSuccess(String responseBody);
        void onError(String message);
    }

    // Constructor pribadi untuk Singleton Pattern
    private ApiService() {
        // Menggunakan Interceptor untuk menambahkan header secara otomatis ke semua request
        OkHttpClient.Builder httpClientBuilder = new OkHttpClient.Builder();
        httpClientBuilder.addInterceptor(new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
                Request original = chain.request();
                Request.Builder requestBuilder = original.newBuilder()
                        .header("x-api-key", API_KEY); // Selalu tambahkan API Key

                // Jika sudah punya auth token (setelah login), tambahkan juga
                if (authToken != null && !authToken.isEmpty()) {
                    requestBuilder.header("Authorization", "Bearer " + authToken);
                }

                Request request = requestBuilder.build();
                return chain.proceed(request);
            }
        });
        this.client = httpClientBuilder.build();
    }

    // Metode untuk mendapatkan satu-satunya instance dari ApiService
    public static synchronized ApiService getInstance() {
        if (instance == null) {
            instance = new ApiService();
        }
        return instance;
    }

    /**
     * Menyimpan auth token setelah login berhasil.
     * @param token Token yang diterima dari server.
     */
    public void setAuthToken(String token) {
        this.authToken = token;
    }

    /**
     * Menghapus auth token (untuk logout).
     */
    public void clearAuthToken() {
        this.authToken = null;
    }

    /**
     * Melakukan proses login ke server.
     * @param username Username pengguna.
     * @param password Password pengguna.
     * @param callback Callback untuk menangani hasil.
     */
    public void login(String username, String password, final ApiCallback callback) {
        // Endpoint spesifik untuk login menggunakan NetworkConfig
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.AUTH_LOGIN;

        // Membuat body request dalam format JSON
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("username", username);
            jsonBody.put("password", password);
        } catch (JSONException e) {
            callback.onError("Gagal membuat JSON request: " + e.getMessage());
            return;
        }

        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);

        // Membuat request POST
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        // Menjalankan request secara asynchronous
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Kesalahan jaringan: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                final String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseBody);
                } else {
                    // Mencoba parsing pesan error dari server jika ada
                    String errorMessage = "Login gagal (Kode: " + response.code() + ")";
                    try {
                        JSONObject errorJson = new JSONObject(responseBody);
                        errorMessage = errorJson.optString("message", errorMessage);
                    } catch (JSONException e) {
                        // biarkan errorMessage default
                    }
                    callback.onError(errorMessage);
                }
            }
        });
    }

    // Anda bisa menambahkan metode lain di sini (misal: getProducts, submitData, dll)
    // dengan pola yang sama seperti metode login, tetapi cukup memanggil client.newCall(request)
    // karena header sudah diurus oleh Interceptor.
    
    // ===== ANDROID STATUS METHOD =====
    
    /**
     * Test connection to Android API endpoint
     * @param callback Callback untuk menangani hasil
     */
    public void getAndroidStatus(final ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.ANDROID_STATUS;
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Kesalahan jaringan: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                final String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseBody);
                } else {
                    String errorMessage = "API status check failed (Kode: " + response.code() + ")";
                    try {
                        JSONObject errorJson = new JSONObject(responseBody);
                        errorMessage = errorJson.optString("message", errorMessage);
                    } catch (JSONException e) {
                        // use default error message
                    }
                    callback.onError(errorMessage);
                }
            }
        });
    }
    
    // ===== BOM DROPDOWN METHODS =====
    
    // Get all BOM dropdown data
    public void getBomDropdown(ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.BOM_DROPDOWN;
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("BOM dropdown failed: " + response.code());
                }
            }
        });
    }
    
    // Get BOM data by customer (for cascading dropdown level 2)
    public void getBomByCustomer(String customer, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.BOM_BY_CUSTOMER + "/" + customer;
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("BOM by customer failed: " + response.code());
                }
            }
        });
    }
    
    // Get BOM details by customer and partnumber (for cascading dropdown level 3)
    public void getBomDetails(String customer, String partnumber, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.BOM_DETAILS + "/" + customer + "/" + partnumber;
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("BOM details failed: " + response.code());
                }
            }
        });
    }
    
    // Search BOM with keyword
    public void searchBom(String keyword, String customer, int limit, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.BOM_SEARCH + 
                    "?keyword=" + keyword;
        
        if (customer != null && !customer.isEmpty()) {
            url += "&customer=" + customer;
        }
        
        if (limit > 0) {
            url += "&limit=" + limit;
        }
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("BOM search failed: " + response.code());
                }
            }
        });
    }
    
    // Get BOM statistics
    public void getBomStats(ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.BOM_STATS;
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("BOM stats failed: " + response.code());
                }
            }
        });
    }
    
    // ===== PRODUCTION METHODS (POST) =====
    
    // Submit MC Output data
    public void submitMcOutput(String machine, String customer, String partnumber, 
                              String model, String description, int quantityOk, 
                              int quantityNg, String operator, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.MC_OUTPUT;
        
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("machine", machine);
            jsonBody.put("customer", customer);
            jsonBody.put("partnumber", partnumber);
            jsonBody.put("model", model);
            jsonBody.put("description", description);
            jsonBody.put("quantity_ok", quantityOk);
            jsonBody.put("quantity_ng", quantityNg);
            jsonBody.put("operator", operator);
        } catch (JSONException e) {
            callback.onError("Failed to create JSON request: " + e.getMessage());
            return;
        }

        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("MC Output failed: " + response.code());
                }
            }
        });
    }
    
    // Submit MC Status data
    public void submitMcStatus(String machineName, String status, String operator, 
                              String shift, String notes, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.MC_STATUS;
        
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("machine_name", machineName);
            jsonBody.put("status", status);
            jsonBody.put("operator", operator);
            jsonBody.put("shift", shift);
            if (notes != null && !notes.isEmpty()) {
                jsonBody.put("notes", notes);
            }
        } catch (JSONException e) {
            callback.onError("Failed to create JSON request: " + e.getMessage());
            return;
        }

        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("MC Status failed: " + response.code());
                }
            }
        });
    }
    
    // Submit Transfer QC data
    public void submitTransferQc(String partnumber, String lotnumber, int quantity,
                                String fromProcess, String toProcess, String operator,
                                String notes, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.TRANSFER_QC;
        
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("partnumber", partnumber);
            jsonBody.put("lotnumber", lotnumber);
            jsonBody.put("quantity", quantity);
            jsonBody.put("from_process", fromProcess);
            jsonBody.put("to_process", toProcess);
            jsonBody.put("operator", operator);
            if (notes != null && !notes.isEmpty()) {
                jsonBody.put("notes", notes);
            }
        } catch (JSONException e) {
            callback.onError("Failed to create JSON request: " + e.getMessage());
            return;
        }

        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("Transfer QC failed: " + response.code());
                }
            }
        });
    }
    
    // Submit WIP Second data
    public void submitWipSecond(String partnumber, String lotnumber, int quantityInput,
                               int quantityOutput, String processType, String operator,
                               String notes, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + NetworkConfig.WIP_SECOND;
        
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("partnumber", partnumber);
            jsonBody.put("lotnumber", lotnumber);
            jsonBody.put("quantity_input", quantityInput);
            jsonBody.put("quantity_output", quantityOutput);
            jsonBody.put("process_type", processType);
            jsonBody.put("operator", operator);
            if (notes != null && !notes.isEmpty()) {
                jsonBody.put("notes", notes);
            }
        } catch (JSONException e) {
            callback.onError("Failed to create JSON request: " + e.getMessage());
            return;
        }

        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("WIP Second failed: " + response.code());
                }
            }
        });
    }
    
    // ===== GENERIC GET METHOD =====
    
    // Generic GET method untuk endpoint lain
    public void get(String endpoint, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + endpoint;
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("Request failed: " + response.code());
                }
            }
        });
    }
    
    // ===== GENERIC POST METHOD =====
    
    // Generic POST method untuk endpoint lain
    public void post(String endpoint, JSONObject data, ApiCallback callback) {
        String url = NetworkConfig.getBaseUrl() + endpoint;
        
        RequestBody body = RequestBody.create(data.toString(), JSON);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseData = response.body().string();
                if (response.isSuccessful()) {
                    callback.onSuccess(responseData);
                } else {
                    callback.onError("Request failed: " + response.code());
                }
            }
        });
    }
}