package com.bangor.system;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bangor.system.network.ApiService;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;

import org.json.JSONException;
import org.json.JSONObject;

public class ScanQRStatusActivity extends AppCompatActivity {

    private MaterialToolbar toolbar;
    private MaterialButton btnScanQR;
    private MaterialCardView cardResult;
    private TextView tvPartnumber, tvModel, tvDescription, tvLotNumber, tvQuantity, tvStatus, tvLastUpdate;
    private RecyclerView rvStatusHistory;
    
    private ApiService apiService;
    private boolean isResultVisible = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_scan_qr_status);
        
        initViews();
        setupToolbar();
        setupClickListeners();
        hideResult();
        
        apiService = ApiService.getInstance();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        btnScanQR = findViewById(R.id.btnScanQR);
        cardResult = findViewById(R.id.cardResult);
        tvPartnumber = findViewById(R.id.tvPartnumber);
        tvModel = findViewById(R.id.tvModel);
        tvDescription = findViewById(R.id.tvDescription);
        tvLotNumber = findViewById(R.id.tvLotNumber);
        tvQuantity = findViewById(R.id.tvQuantity);
        tvStatus = findViewById(R.id.tvStatus);
        tvLastUpdate = findViewById(R.id.tvLastUpdate);
        rvStatusHistory = findViewById(R.id.rvStatusHistory);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Scan QR - Status Barang");
        toolbar.setNavigationOnClickListener(v -> onBackPressed());
    }

    private void setupClickListeners() {
        btnScanQR.setOnClickListener(v -> {
            Intent intent = new Intent(this, QRScannerActivity.class);
            intent.putExtra("scanMode", "status");
            startActivityForResult(intent, 200);
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == 200 && resultCode == RESULT_OK && data != null) {
            String qrData = data.getStringExtra("qrData");
            searchProductStatus(qrData);
        }
    }

    private void searchProductStatus(String qrData) {
        try {
            JSONObject qrJson = new JSONObject(qrData);
            String partnumber = qrJson.optString("partnumber", "");
            String lotNumber = qrJson.optString("lotNumber", "");
            
            if (!partnumber.isEmpty()) {
                searchByPartnumber(partnumber, lotNumber);
            } else {
                Toast.makeText(this, "QR code tidak mengandung partnumber", Toast.LENGTH_SHORT).show();
            }
            
        } catch (JSONException e) {
            // Jika QR bukan JSON, coba search langsung sebagai partnumber
            searchByPartnumber(qrData, "");
        }
    }

    private void searchByPartnumber(String partnumber, String lotNumber) {
        btnScanQR.setEnabled(false);
        btnScanQR.setText("Searching...");
        
        // Search product status via API
        String searchEndpoint = "/api/android/production/product-status/" + partnumber;
        if (!lotNumber.isEmpty()) {
            searchEndpoint += "?lot=" + lotNumber;
        }
        
        apiService.get(searchEndpoint, new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String responseBody) {
                runOnUiThread(() -> {
                    btnScanQR.setEnabled(true);
                    btnScanQR.setText("SCAN QR CODE");
                    displayProductStatus(responseBody);
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> {
                    btnScanQR.setEnabled(true);
                    btnScanQR.setText("SCAN QR CODE");
                    Toast.makeText(ScanQRStatusActivity.this, "Error: " + message, Toast.LENGTH_SHORT).show();
                    hideResult();
                });
            }
        });
    }

    private void displayProductStatus(String responseBody) {
        try {
            JSONObject response = new JSONObject(responseBody);
            if (response.getBoolean("success")) {
                JSONObject product = response.getJSONObject("data");
                
                // Display product information
                tvPartnumber.setText(product.optString("partnumber", "N/A"));
                tvModel.setText(product.optString("model", "N/A"));
                tvDescription.setText(product.optString("description", "N/A"));
                tvLotNumber.setText(product.optString("lotNumber", "N/A"));
                tvQuantity.setText(String.valueOf(product.optInt("quantity", 0)));
                tvStatus.setText(product.optString("status", "Unknown"));
                tvLastUpdate.setText(product.optString("lastUpdate", "N/A"));
                
                // Set status color
                String status = product.optString("status", "Unknown");
                setStatusColor(status);
                
                showResult();
                
                // Load status history if available
                if (response.has("history")) {
                    // TODO: Setup RecyclerView for status history
                    // loadStatusHistory(response.getJSONArray("history"));
                }
                
            } else {
                Toast.makeText(this, "Produk tidak ditemukan", Toast.LENGTH_SHORT).show();
                hideResult();
            }
        } catch (JSONException e) {
            Toast.makeText(this, "Error parsing product data", Toast.LENGTH_SHORT).show();
            hideResult();
        }
    }

    private void setStatusColor(String status) {
        int color;
        switch (status.toLowerCase()) {
            case "production":
            case "in_production":
                color = getResources().getColor(android.R.color.holo_orange_light, getTheme());
                break;
            case "qc":
            case "quality_control":
                color = getResources().getColor(android.R.color.holo_blue_light, getTheme());
                break;
            case "finished":
            case "completed":
                color = getResources().getColor(android.R.color.holo_green_light, getTheme());
                break;
            case "ng":
            case "rejected":
                color = getResources().getColor(android.R.color.holo_red_light, getTheme());
                break;
            default:
                color = getResources().getColor(android.R.color.darker_gray, getTheme());
                break;
        }
        tvStatus.setTextColor(color);
    }

    private void showResult() {
        cardResult.setVisibility(View.VISIBLE);
        isResultVisible = true;
    }

    private void hideResult() {
        cardResult.setVisibility(View.GONE);
        isResultVisible = false;
    }
}