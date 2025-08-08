package com.bangor;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textview.MaterialTextView;

public class TransferQCActivity extends AppCompatActivity {

    private MaterialButton btnScanQR, btnSubmit;
    private TextInputEditText etPartNumber, etModel, etDescription, etLotNumber, etQuantity, etPIC;
    private MaterialTextView tvScanResult;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_transfer_qc);

        initViews();
        setupToolbar();
        loadUserData();
        setupButtons();

        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);
    }

    private void initViews() {
        btnScanQR = findViewById(R.id.btnScanQR);
        btnSubmit = findViewById(R.id.btnSubmit);
        etPartNumber = findViewById(R.id.etPartNumber);
        etModel = findViewById(R.id.etModel);
        etDescription = findViewById(R.id.etDescription);
        etLotNumber = findViewById(R.id.etLotNumber);
        etQuantity = findViewById(R.id.etQuantity);
        etPIC = findViewById(R.id.etPIC);
        tvScanResult = findViewById(R.id.tvScanResult);
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
        }

        toolbar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                onBackPressed();
            }
        });
    }

    private void loadUserData() {
        // Load PIC data from login session
        String username = sharedPreferences.getString("username", "");
        etPIC.setText(username);
    }

    private void setupButtons() {
        btnScanQR.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                scanQRCode();
            }
        });

        btnSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                submitData();
            }
        });
    }

    private void scanQRCode() {
        // TODO: Implement QR code scanning using ZXing library
        // For now, simulate QR scan result
        String simulatedQRResult = "PN123456|MODEL-ABC|Description Test|LOT001|100";
        tvScanResult.setText("QR Scan Result: " + simulatedQRResult);

        // Parse QR result and fill form
        parseQRResult(simulatedQRResult);

        Toast.makeText(this, "QR Code berhasil discan", Toast.LENGTH_SHORT).show();
    }

    private void parseQRResult(String qrResult) {
        try {
            String[] parts = qrResult.split("\\|");
            if (parts.length >= 5) {
                etPartNumber.setText(parts[0]);
                etModel.setText(parts[1]);
                etDescription.setText(parts[2]);
                etLotNumber.setText(parts[3]);
                etQuantity.setText(parts[4]);
            }
        } catch (Exception e) {
            Toast.makeText(this, "Format QR Code tidak valid", Toast.LENGTH_SHORT).show();
        }
    }

    private void submitData() {
        String partNumber = etPartNumber.getText().toString().trim();
        String model = etModel.getText().toString().trim();
        String description = etDescription.getText().toString().trim();
        String lotNumber = etLotNumber.getText().toString().trim();
        String quantity = etQuantity.getText().toString().trim();
        String pic = etPIC.getText().toString().trim();

        // Validate required fields
        if (partNumber.isEmpty() || model.isEmpty() || description.isEmpty() ||
            lotNumber.isEmpty() || quantity.isEmpty()) {
            Toast.makeText(this, "Mohon lengkapi semua field", Toast.LENGTH_SHORT).show();
            return;
        }

        // TODO: Implement API call to Node.js backend
        // For now, simulate successful submission
        postDataToBackend(partNumber, model, description, lotNumber, quantity, pic);
    }

    private void postDataToBackend(String partNumber, String model, String description,
                                  String lotNumber, String quantity, String pic) {
        // TODO: Implement HTTP POST request to Node.js backend
        // Example endpoint: POST /api/transfer-qc

        // Simulate successful API call
        Toast.makeText(this, "Data berhasil disimpan ke database", Toast.LENGTH_SHORT).show();

        // Clear form after successful submission
        clearForm();
    }

    private void clearForm() {
        etPartNumber.setText("");
        etModel.setText("");
        etDescription.setText("");
        etLotNumber.setText("");
        etQuantity.setText("");
        tvScanResult.setText("Hasil scan akan muncul di sini...");
    }
}
