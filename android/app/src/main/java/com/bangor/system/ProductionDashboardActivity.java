package com.bangor.system;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.google.android.material.appbar.MaterialToolbar;

public class ProductionDashboardActivity extends AppCompatActivity {

    private TextView tvWelcome, tvPIC;
    private CardView cardTransferQC, cardMesinOutput, cardSecondProcess, cardScanQR;
    private MaterialToolbar toolbar;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_production_dashboard);
        
        initViews();
        setupUserInfo();
        setupClickListeners();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        tvWelcome = findViewById(R.id.tvWelcome);
        tvPIC = findViewById(R.id.tvPIC);
        cardTransferQC = findViewById(R.id.cardTransferQC);
        cardMesinOutput = findViewById(R.id.cardMesinOutput);
        cardSecondProcess = findViewById(R.id.cardSecondProcess);
        cardScanQR = findViewById(R.id.cardScanQR);
        
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle("Dashboard Produksi");
    }

    private void setupUserInfo() {
        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);
        String username = sharedPreferences.getString("username", "User");
        String pic = sharedPreferences.getString("pic", "Unknown");
        
        tvWelcome.setText("Selamat Datang, " + username);
        tvPIC.setText("PIC: " + pic);
    }

    private void setupClickListeners() {
        cardTransferQC.setOnClickListener(v -> {
            Intent intent = new Intent(this, TransferQCActivity.class);
            startActivity(intent);
        });

        cardMesinOutput.setOnClickListener(v -> {
            Intent intent = new Intent(this, MesinOutputActivity.class);
            startActivity(intent);
        });

        cardSecondProcess.setOnClickListener(v -> {
            Intent intent = new Intent(this, SecondProcessActivity.class);
            startActivity(intent);
        });

        cardScanQR.setOnClickListener(v -> {
            Intent intent = new Intent(this, ScanQRStatusActivity.class);
            startActivity(intent);
        });
    }

    @Override
    public void onBackPressed() {
        // Logout dan kembali ke login
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.clear();
        editor.apply();
        
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}