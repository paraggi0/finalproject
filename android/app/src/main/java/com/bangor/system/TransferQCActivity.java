package com.bangor.system;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bangor.system.network.ApiService;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONException;
import org.json.JSONObject;

public class TransferQCActivity extends AppCompatActivity {

    private MaterialToolbar toolbar;
    private TextInputEditText etPartnumber, etModel, etDescription, etLotNumber, etQuantity;
    private MaterialButton btnScanQR, btnSubmit;
    private ApiService apiService;
    private SharedPreferences sharedPreferences;
    private String currentPIC;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_transfer_qc);
        
        initViews();
        setupToolbar();
        getUserInfo();
        setupClickListeners();
        
        apiService = ApiService.getInstance();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        etPartnumber = findViewById(R.id.etPartnumber);
        etModel = findViewById(R.id.etModel);
        etDescription = findViewById(R.id.etDescription);
        etLotNumber = findViewById(R.id.etLotNumber);
        etQuantity = findViewById(R.id.etQuantity);
        btnScanQR = findViewById(R.id.btnScanQR);
        btnSubmit = findViewById(R.id.btnSubmit);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Transfer QC");
        toolbar.setNavigationOnClickListener(v -> onBackPressed());
    }

    private void getUserInfo() {
        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);
        currentPIC = sharedPreferences.getString("pic", "Unknown");
    }

    private void setupClickListeners() {
        btnScanQR.setOnClickListener(v -> {
            // Intent untuk scan QR code
            Intent intent = new Intent(this, QRScannerActivity.class);
            intent.putExtra("scanMode", "transferqc");
            startActivityForResult(intent, 100);
        });

        btnSubmit.setOnClickListener(v -> submitTransferQC());
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == 100 && resultCode == RESULT_OK && data != null) {
            String qrData = data.getStringExtra("qrData");
            parseQRData(qrData);
        }
    }

    private void parseQRData(String qrData) {
        try {
            JSONObject qrJson = new JSONObject(qrData);
            
            // Parse data dari QR code
            String partnumber = qrJson.optString("partnumber", "");
            String model = qrJson.optString("model", "");
            String description = qrJson.optString("description", "");
            String lotNumber = qrJson.optString("lotNumber", "");
            String quantity = qrJson.optString("quantity", "");
            
            // Isi form otomatis dari QR scan
            etPartnumber.setText(partnumber);
            etModel.setText(model);
            etDescription.setText(description);
            etLotNumber.setText(lotNumber);
            etQuantity.setText(quantity);
            
            Toast.makeText(this, "Data QR berhasil di-scan", Toast.LENGTH_SHORT).show();
            
        } catch (JSONException e) {
            Toast.makeText(this, "Format QR code tidak valid", Toast.LENGTH_SHORT).show();
        }
    }

    private void submitTransferQC() {
        String partnumber = etPartnumber.getText().toString().trim();
        String model = etModel.getText().toString().trim();
        String description = etDescription.getText().toString().trim();
        String lotNumber = etLotNumber.getText().toString().trim();
        String quantityStr = etQuantity.getText().toString().trim();

        // Validasi input
        if (partnumber.isEmpty() || model.isEmpty() || description.isEmpty() || 
            lotNumber.isEmpty() || quantityStr.isEmpty()) {
            Toast.makeText(this, "Semua field harus diisi", Toast.LENGTH_SHORT).show();
            return;
        }

        int quantity;
        try {
            quantity = Integer.parseInt(quantityStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Quantity harus berupa angka", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSubmit.setEnabled(false);
        btnSubmit.setText("Submitting...");

        // POST data ke backend
        apiService.submitTransferQc(partnumber, lotNumber, quantity, "Production", "QC", 
                                   currentPIC, description, new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String responseBody) {
                runOnUiThread(() -> {
                    btnSubmit.setEnabled(true);
                    btnSubmit.setText("Submit");
                    Toast.makeText(TransferQCActivity.this, "Data berhasil disimpan", Toast.LENGTH_SHORT).show();
                    clearForm();
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> {
                    btnSubmit.setEnabled(true);
                    btnSubmit.setText("Submit");
                    Toast.makeText(TransferQCActivity.this, "Error: " + message, Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void clearForm() {
        etPartnumber.setText("");
        etModel.setText("");
        etDescription.setText("");
        etLotNumber.setText("");
        etQuantity.setText("");
    }
}