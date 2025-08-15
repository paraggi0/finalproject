package com.bangor.system;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.Toast;

public class InventoryCheckActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // TODO: Create proper layout for Inventory Check
        Toast.makeText(this, "Inventory Check - Under Development", Toast.LENGTH_LONG).show();
        
        // For now, close this activity to prevent crashes
        finish();
    }
}