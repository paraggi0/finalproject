package com.bangor.system;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import com.bangor.system.services.ApiService;
import com.bangor.system.utils.NetworkUtils;
import org.json.JSONObject;

public class LoginActivity extends AppCompatActivity {

    private static final String TAG = "LoginActivity";
    
    private EditText etUsername, etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;
    private TextView tvStatus;
    private ApiService apiService;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        initializeViews();
        setupApiService();
        setupClickListeners();
        
        // Check if user already logged in
        checkExistingSession();
    }

    private void initializeViews() {
        etUsername = findViewById(R.id.etUsername);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);
        tvStatus = findViewById(R.id.tvStatus);
        
        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);
    }

    private void setupApiService() {
        String baseUrl = NetworkUtils.getBaseUrl();
        apiService = new ApiService(baseUrl);
        
        tvStatus.setText("Server: " + baseUrl);
    }

    private void setupClickListeners() {
        btnLogin.setOnClickListener(v -> performLogin());
        
        // Test credentials button untuk development
        Button btnTestCredentials = findViewById(R.id.btnTestCredentials);
        if (btnTestCredentials != null) {
            btnTestCredentials.setOnClickListener(v -> fillTestCredentials());
        }
    }

    private void checkExistingSession() {
        String savedToken = sharedPreferences.getString("token", null);
        String savedUsername = sharedPreferences.getString("username", null);
        
        if (savedToken != null && savedUsername != null) {
            Log.d(TAG, "Existing session found for: " + savedUsername);
            redirectToDashboard();
        }
    }

    private void fillTestCredentials() {
        // Cycling through test credentials
        String currentText = etUsername.getText().toString();
        
        if (currentText.equals("production01")) {
            etUsername.setText("qc01");
            etPassword.setText("admin123");
            tvStatus.setText("Test: QC Supervisor");
        } else if (currentText.equals("qc01")) {
            etUsername.setText("wh01");
            etPassword.setText("admin123");
            tvStatus.setText("Test: Warehouse Supervisor");
        } else if (currentText.equals("wh01")) {
            etUsername.setText("admin");
            etPassword.setText("admin123");
            tvStatus.setText("Test: System Administrator");
        } else {
            etUsername.setText("production01");
            etPassword.setText("admin123");
            tvStatus.setText("Test: Production Supervisor");
        }
    }

    private void performLogin() {
        String username = etUsername.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (username.isEmpty() || password.isEmpty()) {
            showError("Username dan password harus diisi");
            return;
        }

        setLoading(true);
        tvStatus.setText("Logging in...");

        apiService.login(username, password, new ApiService.ApiCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                runOnUiThread(() -> {
                    setLoading(false);
                    try {
                        if (response.getBoolean("success")) {
                            JSONObject userData = response.getJSONObject("data");
                            
                            // Save user session with role information
                            saveUserSession(userData);
                            
                            String fullName = userData.optString("full_name", username);
                            String role = userData.optString("role", "OPERATOR");
                            String department = userData.optString("department", "PRODUCTION");
                            
                            showSuccess("Login berhasil! Selamat datang " + username);
                            
                            Log.d(TAG, "Login successful - Role: " + role + ", Department: " + department);
                            
                            // Redirect to appropriate dashboard based on role/department
                            redirectToDashboard();
                            
                        } else {
                            String message = response.optString("message", "Login gagal");
                            showError(message);
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error parsing login response", e);
                        showError("Error parsing response: " + e.getMessage());
                    }
                });
            }

            @Override
            public void onError(String error) {
                runOnUiThread(() -> {
                    setLoading(false);
                    showError("Login failed: " + error);
                    tvStatus.setText("Login failed - check network");
                });
            }
        });
    }

    private void saveUserSession(JSONObject userData) {
        try {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            
            editor.putInt("user_id", userData.optInt("user_id"));
            editor.putString("username", userData.optString("username"));
            editor.putString("full_name", userData.optString("username")); // Gunakan username sebagai display name
            editor.putString("department", userData.optString("department"));
            editor.putString("role", userData.optString("role"));
            editor.putString("token", userData.optString("token"));
            editor.putString("login_time", userData.optString("login_time"));
            editor.putBoolean("is_logged_in", true);
            
            editor.apply();
            
            Log.d(TAG, "User session saved: " + userData.optString("username") + 
                      " - " + userData.optString("role") + 
                      " (" + userData.optString("department") + ")");
                      
        } catch (Exception e) {
            Log.e(TAG, "Error saving user session", e);
        }
    }

    private void redirectToDashboard() {
        String department = sharedPreferences.getString("department", "PRODUCTION");
        String role = sharedPreferences.getString("role", "OPERATOR");
        
        Intent intent;
        
        // Route user based on department and role
        switch (department) {
            case "QC":
                intent = new Intent(this, QCDashboardActivity.class);
                break;
            case "WAREHOUSE":
                intent = new Intent(this, WarehouseDashboardActivity.class);
                break;
            case "ADMIN":
                // Admin dapat akses ke semua dashboard, default ke production
                intent = new Intent(this, ProductionDashboardActivity.class);
                break;
            case "PRODUCTION":
            default:
                intent = new Intent(this, ProductionDashboardActivity.class);
                break;
        }
        
        Log.d(TAG, "Redirecting to dashboard: " + department + " (" + role + ")");
        
        startActivity(intent);
        finish(); // Prevent going back to login
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnLogin.setEnabled(!loading);
        etUsername.setEnabled(!loading);
        etPassword.setEnabled(!loading);
    }

    private void showError(String message) {
        tvStatus.setText("❌ " + message);
        tvStatus.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void showSuccess(String message) {
        tvStatus.setText("✅ " + message);
        tvStatus.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    public static void logout(AppCompatActivity activity) {
        SharedPreferences sharedPreferences = activity.getSharedPreferences("UserSession", MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.clear();
        editor.apply();
        
        Intent intent = new Intent(activity, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        activity.startActivity(intent);
        activity.finish();
    }
}
