package com.bangor.network;

import android.util.Log;
import okhttp3.*;
import okhttp3.logging.HttpLoggingInterceptor;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

public class ApiService {
    private static final String TAG = "ApiService";
    private static final String BASE_URL = "http://192.168.0.153:3001";
    
    private static ApiService instance;
    private OkHttpClient httpClient;
    
    private ApiService() {
        // Create logging interceptor for debugging
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
        
        // Build HTTP client with timeouts
        httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(loggingInterceptor)
                .build();
    }
    
    public static synchronized ApiService getInstance() {
        if (instance == null) {
            instance = new ApiService();
        }
        return instance;
    }
    
    public void get(String endpoint, ApiCallback callback) {
        String url = BASE_URL + endpoint;
        Log.d(TAG, "GET request to: " + url);
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .addHeader("Content-Type", "application/json")
                .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "GET request failed: " + e.getMessage());
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                Log.d(TAG, "GET response: " + responseBody);
                
                if (response.isSuccessful()) {
                    callback.onSuccess(responseBody);
                } else {
                    callback.onError("HTTP " + response.code() + ": " + response.message());
                }
            }
        });
    }
    
    public void post(String endpoint, String jsonBody, ApiCallback callback) {
        String url = BASE_URL + endpoint;
        Log.d(TAG, "POST request to: " + url);
        Log.d(TAG, "POST body: " + jsonBody);
        
        RequestBody body = RequestBody.create(
            jsonBody, 
            MediaType.parse("application/json; charset=utf-8")
        );
        
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("Content-Type", "application/json")
                .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "POST request failed: " + e.getMessage());
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                Log.d(TAG, "POST response: " + responseBody);
                
                if (response.isSuccessful()) {
                    callback.onSuccess(responseBody);
                } else {
                    callback.onError("HTTP " + response.code() + ": " + response.message());
                }
            }
        });
    }
    
    public interface ApiCallback {
        void onSuccess(String responseBody);
        void onError(String message);
    }
}