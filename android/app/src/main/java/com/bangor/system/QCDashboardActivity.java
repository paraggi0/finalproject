package com.bangor.system;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.google.android.material.appbar.MaterialToolbar;

public class QCDashboardActivity extends AppCompatActivity {

    private TextView tvWelcome, tvPIC;
    private CardView cardIncomingQC, cardOutgoingQC, cardNGReport, cardQCHistory;
    private MaterialToolbar toolbar;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qc_dashboard);
        
        initViews();
        setupUserInfo();
        setupClickListeners();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        tvWelcome = findViewById(R.id.tvWelcome);
        tvPIC = findViewById(R.id.tvPIC);
        cardIncomingQC = findViewById(R.id.cardIncomingQC);
        cardOutgoingQC = findViewById(R.id.cardOutgoingQC);
        cardNGReport = findViewById(R.id.cardNGReport);
        cardQCHistory = findViewById(R.id.cardQCHistory);
        
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle("Dashboard Quality Control");
    }

    private void setupUserInfo() {
        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);
        String username = sharedPreferences.getString("username", "User");
        String pic = sharedPreferences.getString("pic", "Unknown");
        
        tvWelcome.setText("Selamat Datang, " + username);
        tvPIC.setText("PIC: " + pic);
    }

    private void setupClickListeners() {
        cardIncomingQC.setOnClickListener(v -> {
            // Intent ke halaman Incoming QC
            Intent intent = new Intent(this, IncomingQCActivity.class);
            startActivity(intent);
        });

        cardOutgoingQC.setOnClickListener(v -> {
            // Intent ke halaman Outgoing QC
            Intent intent = new Intent(this, OutgoingQCActivity.class);
            startActivity(intent);
        });

        cardNGReport.setOnClickListener(v -> {
            // Intent ke halaman NG Report
            Intent intent = new Intent(this, NGReportActivity.class);
            startActivity(intent);
        });

        cardQCHistory.setOnClickListener(v -> {
            // Intent ke halaman QC History
            Intent intent = new Intent(this, QCHistoryActivity.class);
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