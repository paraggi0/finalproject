package com.bangor.system;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.Toast;

public class ReceiveGoodsActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // TODO: Create proper layout for Receive Goods
        Toast.makeText(this, "Receive Goods - Under Development", Toast.LENGTH_LONG).show();
        
        // For now, close this activity to prevent crashes
        finish();
    }
}