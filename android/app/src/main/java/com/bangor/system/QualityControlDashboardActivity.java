package com.bangor.system;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.Toast;

public class QualityControlDashboardActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // TODO: Create proper layout for QC Dashboard
        // setContentView(R.layout.activity_quality_control_dashboard);
        
        Toast.makeText(this, "Quality Control Dashboard - Under Development", Toast.LENGTH_LONG).show();
        
        // For now, close this activity to prevent crashes
        finish();
    }
}