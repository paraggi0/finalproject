package com.bangor.system;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.journeyapps.barcodescanner.BarcodeCallback;
import com.journeyapps.barcodescanner.BarcodeResult;
import com.journeyapps.barcodescanner.DecoratedBarcodeView;
import com.journeyapps.barcodescanner.camera.CameraSettings;

public class QRScannerActivity extends AppCompatActivity {

    private static final int CAMERA_PERMISSION_REQUEST = 1001;
    private DecoratedBarcodeView barcodeView;
    private ImageButton btnBack, btnFlashlight;
    private boolean isFlashlightOn = false;
    private boolean isScanningEnabled = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_scanner);
        
        initViews();
        setupCamera();
        setupClickListeners();
        
        // Check camera permission
        if (checkCameraPermission()) {
            startScanning();
        } else {
            requestCameraPermission();
        }
    }

    private void initViews() {
        barcodeView = findViewById(R.id.barcodeView);
        btnBack = findViewById(R.id.btnBack);
        btnFlashlight = findViewById(R.id.btnFlashlight);
    }

    private void setupCamera() {
        // Configure camera settings
        CameraSettings settings = new CameraSettings();
        settings.setRequestedCameraId(0); // Use back camera
        barcodeView.getBarcodeView().setCameraSettings(settings);
        
        // Set scanning callback
        barcodeView.decodeContinuous(new BarcodeCallback() {
            @Override
            public void barcodeResult(BarcodeResult result) {
                if (isScanningEnabled && result.getText() != null) {
                    handleQRCodeResult(result.getText());
                }
            }
        });
    }

    private void setupClickListeners() {
        btnBack.setOnClickListener(v -> onBackPressed());
        
        btnFlashlight.setOnClickListener(v -> toggleFlashlight());
    }

    private boolean checkCameraPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) 
                == PackageManager.PERMISSION_GRANTED;
    }

    private void requestCameraPermission() {
        ActivityCompat.requestPermissions(this, 
                new String[]{Manifest.permission.CAMERA}, 
                CAMERA_PERMISSION_REQUEST);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startScanning();
            } else {
                Toast.makeText(this, "Camera permission is required to scan QR codes", Toast.LENGTH_LONG).show();
                finish();
            }
        }
    }

    private void startScanning() {
        barcodeView.resume();
        isScanningEnabled = true;
    }

    private void stopScanning() {
        barcodeView.pause();
        isScanningEnabled = false;
    }

    private void toggleFlashlight() {
        if (isFlashlightOn) {
            barcodeView.setTorchOff();
            isFlashlightOn = false;
            btnFlashlight.setImageResource(R.drawable.ic_flashlight);
        } else {
            barcodeView.setTorchOn();
            isFlashlightOn = true;
            btnFlashlight.setImageResource(R.drawable.ic_flashlight);
        }
    }

    private void handleQRCodeResult(String qrData) {
        // Stop scanning to prevent multiple scans
        stopScanning();
        
        // Return result to calling activity
        Intent resultIntent = new Intent();
        resultIntent.putExtra("qrData", qrData);
        setResult(RESULT_OK, resultIntent);
        
        // Show success message and close
        Toast.makeText(this, "QR Code scanned successfully", Toast.LENGTH_SHORT).show();
        finish();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (checkCameraPermission()) {
            startScanning();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        stopScanning();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (barcodeView != null) {
            barcodeView.pause();
        }
    }
}