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

public class MesinOutputActivity extends AppCompatActivity {

    private AutoCompleteTextView spinnerCustomer, spinnerDescription;
    private TextInputEditText etPartNumber, etModel, etQuantityOK, etQuantityNG, etOperator, etPIC;
    private MaterialButton btnSubmit;
    private SharedPreferences sharedPreferences;

    // Sample data - in real app, this would come from API
    private Map<String, List<ProductData>> customerProducts = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mesin_output);

        initViews();
        setupToolbar();
        loadUserData();
        setupData();
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

    private void setupData() {
        // TODO: Replace with actual API call to get bill of material data
        // Sample data structure
        List<ProductData> toyotaProducts = new ArrayList<>();
        toyotaProducts.add(new ProductData("Toyota Engine Block V1", "TEB001", "Engine-V1"));
        toyotaProducts.add(new ProductData("Toyota Transmission Case", "TTC002", "Trans-A1"));

        List<ProductData> hondaProducts = new ArrayList<>();
        hondaProducts.add(new ProductData("Honda Cylinder Head", "HCH001", "Cylinder-H1"));
        hondaProducts.add(new ProductData("Honda Brake Component", "HBC002", "Brake-H2"));

        customerProducts.put("Toyota", toyotaProducts);
        customerProducts.put("Honda", hondaProducts);
    }

    private void setupDropdowns() {
        // Setup Customer dropdown
        List<String> customers = new ArrayList<>(customerProducts.keySet());
        ArrayAdapter<String> customerAdapter = new ArrayAdapter<>(
            this, android.R.layout.simple_dropdown_item_1line, customers);
        spinnerCustomer.setAdapter(customerAdapter);

        // Customer selection listener for cascading dropdown
        spinnerCustomer.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                String selectedCustomer = customers.get(position);
                setupDescriptionDropdown(selectedCustomer);
            }
        });
    }

    private void setupDescriptionDropdown(String customer) {
        List<ProductData> products = customerProducts.get(customer);
        if (products != null) {
            List<String> descriptions = new ArrayList<>();
            for (ProductData product : products) {
                descriptions.add(product.description);
            }

            ArrayAdapter<String> descriptionAdapter = new ArrayAdapter<>(
                this, android.R.layout.simple_dropdown_item_1line, descriptions);
            spinnerDescription.setAdapter(descriptionAdapter);
            spinnerDescription.setEnabled(true);

            // Description selection listener to auto-fill part number and model
            spinnerDescription.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    ProductData selectedProduct = products.get(position);
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

        // Validate required fields
        if (customer.isEmpty() || description.isEmpty() || partNumber.isEmpty() ||
            model.isEmpty() || quantityOK.isEmpty() || quantityNG.isEmpty() || operator.isEmpty()) {
            Toast.makeText(this, "Mohon lengkapi semua field", Toast.LENGTH_SHORT).show();
            return;
        }

        // TODO: Implement API call to Node.js backend
        postDataToBackend(customer, description, partNumber, model, quantityOK, quantityNG, operator, pic);
    }

    private void postDataToBackend(String customer, String description, String partNumber,
                                  String model, String quantityOK, String quantityNG, String operator, String pic) {
        // TODO: Implement HTTP POST request to Node.js backend
        // Example endpoint: POST /api/mesin-output

        // Simulate successful API call
        Toast.makeText(this, "Data output mesin berhasil disimpan", Toast.LENGTH_SHORT).show();

        // Clear form after successful submission
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

    // Helper class for product data
    private static class ProductData {
        String description;
        String partNumber;
        String model;

        ProductData(String description, String partNumber, String model) {
            this.description = description;
            this.partNumber = partNumber;
            this.model = model;
        }
    }
}
