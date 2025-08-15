package com.bangor.system;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.Toast;

public class ProductDetailActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // TODO: Create proper layout for Product Detail
        Toast.makeText(this, "Product Detail - Under Development", Toast.LENGTH_LONG).show();
        
        // For now, close this activity to prevent crashes
        finish();
    }
}