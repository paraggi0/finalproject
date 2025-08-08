package com.bangor;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etUsername, etPassword;
    private AutoCompleteTextView spinnerDepartment;
    private MaterialButton btnLogin;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        initViews();
        setupDepartmentDropdown();
        setupLoginButton();

        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);
    }

    private void initViews() {
        etUsername = findViewById(R.id.etUsername);
        etPassword = findViewById(R.id.etPassword);
        spinnerDepartment = findViewById(R.id.spinnerDepartment);
        btnLogin = findViewById(R.id.btnLogin);
    }

    private void setupDepartmentDropdown() {
        String[] departments = {
            "Produksi (Production)",
            "QC (Quality Control)",
            "Warehouse"
        };

        ArrayAdapter<String> adapter = new ArrayAdapter<>(
            this,
            android.R.layout.simple_dropdown_item_1line,
            departments
        );
        spinnerDepartment.setAdapter(adapter);
    }

    private void setupLoginButton() {
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                performLogin();
            }
        });
    }

    private void performLogin() {
        String username = etUsername.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String department = spinnerDepartment.getText().toString().trim();

        if (username.isEmpty() || password.isEmpty() || department.isEmpty()) {
            Toast.makeText(this, "Mohon lengkapi semua field", Toast.LENGTH_SHORT).show();
            return;
        }

        // TODO: Implement API call to Node.js backend for authentication
        // For now, using simple validation
        if (validateUser(username, password, department)) {
            // Save user session
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putString("username", username);
            editor.putString("department", department);
            editor.putBoolean("isLoggedIn", true);
            editor.apply();

            // Navigate based on department
            navigateToMainActivity(department);
        } else {
            Toast.makeText(this, "Username atau password salah", Toast.LENGTH_SHORT).show();
        }
    }

    private boolean validateUser(String username, String password, String department) {
        // TODO: Replace with actual API call to db-topline database
        // This is temporary validation
        return !username.isEmpty() && !password.isEmpty();
    }

    private void navigateToMainActivity(String department) {
        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
        intent.putExtra("department", department);
        startActivity(intent);
        finish();
    }

    @Override
    protected void onStart() {
        super.onStart();

        // Check if user is already logged in
        if (sharedPreferences.getBoolean("isLoggedIn", false)) {
            String department = sharedPreferences.getString("department", "");
            navigateToMainActivity(department);
        }
    }
}
