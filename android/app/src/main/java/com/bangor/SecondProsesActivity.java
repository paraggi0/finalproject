package com.bangor;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SecondProsesActivity extends AppCompatActivity {

    private AutoCompleteTextView spinnerCustomer, spinnerDescription;
    private TextInputEditText etPartNumber, etModel, etQuantityOK, etQuantityNG, etOperator, etPIC;
    private MaterialButton btnSubmit;
    private SharedPreferences sharedPreferences;

    // Sample data for assembly products
    private Map<String, List<AssemblyData>> customerAssemblyProducts = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_second_proses);

        initViews();
        setupToolbar();
        loadUserData();
        setupAssemblyData();
        setupDropdowns();
        setupSubmitButton();

        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);
    }

    private void initViews() {
        spinnerCustomer = findViewById(R.id.spinnerCustomer);
        spinnerDescription = findViewById(R.id.spinnerDescription);
        etPartNumber = findViewById(R.id.etPartNumber);
        etModel = findViewById(R.id.etModel);
        etQuantityOK = findViewById(R.id.etQuantityOK);
        etQuantityNG = findViewById(R.id.etQuantityNG);
        etOperator = findViewById(R.id.etOperator);
        etPIC = findViewById(R.id.etPIC);
        btnSubmit = findViewById(R.id.btnSubmit);
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
        String username = sharedPreferences.getString("username", "");
        etPIC.setText(username);
    }

    private void setupAssemblyData() {
        // Assembly-specific products - different from machine output
        List<AssemblyData> toyotaAssembly = new ArrayList<>();
        toyotaAssembly.add(new AssemblyData("Toyota Complete Engine Assembly", "TEA001", "Assembly-V1"));
        toyotaAssembly.add(new AssemblyData("Toyota Transmission Assembly", "TTA002", "Assembly-T1"));

        List<AssemblyData> hondaAssembly = new ArrayList<>();
        hondaAssembly.add(new AssemblyData("Honda Engine Block Assembly", "HEA001", "Assembly-H1"));
        hondaAssembly.add(new AssemblyData("Honda Brake System Assembly", "HBA002", "Assembly-B2"));

        customerAssemblyProducts.put("Toyota", toyotaAssembly);
        customerAssemblyProducts.put("Honda", hondaAssembly);
    }

    private void setupDropdowns() {
        List<String> customers = new ArrayList<>(customerAssemblyProducts.keySet());
        ArrayAdapter<String> customerAdapter = new ArrayAdapter<>(
            this, android.R.layout.simple_dropdown_item_1line, customers);
        spinnerCustomer.setAdapter(customerAdapter);

        spinnerCustomer.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                String selectedCustomer = customers.get(position);
                setupDescriptionDropdown(selectedCustomer);
            }
        });
    }

    private void setupDescriptionDropdown(String customer) {
        List<AssemblyData> products = customerAssemblyProducts.get(customer);
        if (products != null) {
            List<String> descriptions = new ArrayList<>();
            for (AssemblyData product : products) {
                descriptions.add(product.description);
            }

            ArrayAdapter<String> descriptionAdapter = new ArrayAdapter<>(
                this, android.R.layout.simple_dropdown_item_1line, descriptions);
            spinnerDescription.setAdapter(descriptionAdapter);
            spinnerDescription.setEnabled(true);

            spinnerDescription.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    AssemblyData selectedProduct = products.get(position);
                    etPartNumber.setText(selectedProduct.partNumber);
                    etModel.setText(selectedProduct.model);
                }
            });
        }
    }

    private void setupSubmitButton() {
        btnSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                submitData();
            }
        });
    }

    private void submitData() {
        String customer = spinnerCustomer.getText().toString().trim();
        String description = spinnerDescription.getText().toString().trim();
        String partNumber = etPartNumber.getText().toString().trim();
        String model = etModel.getText().toString().trim();
        String quantityOK = etQuantityOK.getText().toString().trim();
        String quantityNG = etQuantityNG.getText().toString().trim();
        String operator = etOperator.getText().toString().trim();
        String pic = etPIC.getText().toString().trim();

        if (customer.isEmpty() || description.isEmpty() || partNumber.isEmpty() ||
            model.isEmpty() || quantityOK.isEmpty() || quantityNG.isEmpty() || operator.isEmpty()) {
            Toast.makeText(this, "Mohon lengkapi semua field", Toast.LENGTH_SHORT).show();
            return;
        }

        postAssemblyDataToBackend(customer, description, partNumber, model, quantityOK, quantityNG, operator, pic);
    }

    private void postAssemblyDataToBackend(String customer, String description, String partNumber,
                                          String model, String quantityOK, String quantityNG, String operator, String pic) {
        // TODO: Implement HTTP POST request to Node.js backend
        // Example endpoint: POST /api/second-proses

        Toast.makeText(this, "Data assembly berhasil disimpan", Toast.LENGTH_SHORT).show();
        clearForm();
    }

    private void clearForm() {
        spinnerCustomer.setText("");
        spinnerDescription.setText("");
        spinnerDescription.setEnabled(false);
        etPartNumber.setText("");
        etModel.setText("");
        etQuantityOK.setText("");
        etQuantityNG.setText("");
        etOperator.setText("");
    }

    private static class AssemblyData {
        String description;
        String partNumber;
        String model;

        AssemblyData(String description, String partNumber, String model) {
            this.description = description;
            this.partNumber = partNumber;
            this.model = model;
        }
    }
}
