package com.bangor.system;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bangor.system.network.ApiService;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class MesinOutputActivity extends AppCompatActivity {

    private MaterialToolbar toolbar;
    private AutoCompleteTextView acCustomer, acDescription;
    private TextInputEditText etPartnumber, etModel, etQuantityOK, etQuantityNG, etOperator, etPIC;
    private MaterialButton btnSubmit;
    
    private ApiService apiService;
    private SharedPreferences sharedPreferences;
    private String currentPIC;
    
    private List<String> customerList = new ArrayList<>();
    private List<JSONObject> bomData = new ArrayList<>();
    private JSONObject selectedBOMItem;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mesin_output);
        
        initViews();
        setupToolbar();
        getUserInfo();
        setupClickListeners();
        loadCustomerData();
        
        apiService = ApiService.getInstance();
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        acCustomer = findViewById(R.id.acCustomer);
        acDescription = findViewById(R.id.acDescription);
        etPartnumber = findViewById(R.id.etPartnumber);
        etModel = findViewById(R.id.etModel);
        etQuantityOK = findViewById(R.id.etQuantityOK);
        etQuantityNG = findViewById(R.id.etQuantityNG);
        etOperator = findViewById(R.id.etOperator);
        etPIC = findViewById(R.id.etPIC);
        btnSubmit = findViewById(R.id.btnSubmit);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Mesin Output");
        toolbar.setNavigationOnClickListener(v -> onBackPressed());
    }

    private void getUserInfo() {
        sharedPreferences = getSharedPreferences("UserSession", MODE_PRIVATE);
        currentPIC = sharedPreferences.getString("pic", "Unknown");
        etPIC.setText(currentPIC);
        etPIC.setEnabled(false); // PIC readonly dari login
    }

    private void setupClickListeners() {
        // Customer selection listener - untuk dropdown bertingkat
        acCustomer.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                String selectedCustomer = customerList.get(position);
                loadDescriptionByCustomer(selectedCustomer);
                clearDependentFields();
            }
        });

        // Description selection listener - untuk auto-fill partnumber dan model
        acDescription.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                if (selectedBOMItem != null) {
                    try {
                        String partnumber = selectedBOMItem.getString("partnumber");
                        String model = selectedBOMItem.getString("model");
                        
                        etPartnumber.setText(partnumber);
                        etModel.setText(model);
                        
                        // Make partnumber and model readonly
                        etPartnumber.setEnabled(false);
                        etModel.setEnabled(false);
                        
                    } catch (JSONException e) {
                        Toast.makeText(MesinOutputActivity.this, "Error parsing BOM data", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });

        btnSubmit.setOnClickListener(v -> submitMesinOutput());
    }

    private void loadCustomerData() {
        // GET customer list dari database BOM
        apiService.getBomDropdown(new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String responseBody) {
                runOnUiThread(() -> parseCustomerData(responseBody));
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> {
                    Toast.makeText(MesinOutputActivity.this, "Error loading customer: " + message, Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void parseCustomerData(String responseBody) {
        try {
            JSONObject response = new JSONObject(responseBody);
            if (response.getBoolean("success")) {
                JSONArray customers = response.getJSONArray("customers");
                customerList.clear();
                
                for (int i = 0; i < customers.length(); i++) {
                    customerList.add(customers.getString(i));
                }
                
                // Setup customer dropdown
                ArrayAdapter<String> customerAdapter = new ArrayAdapter<>(this, 
                    android.R.layout.simple_dropdown_item_1line, customerList);
                acCustomer.setAdapter(customerAdapter);
                
            } else {
                Toast.makeText(this, "Failed to load customer data", Toast.LENGTH_SHORT).show();
            }
        } catch (JSONException e) {
            Toast.makeText(this, "Error parsing customer data", Toast.LENGTH_SHORT).show();
        }
    }

    private void loadDescriptionByCustomer(String customer) {
        // GET description berdasarkan customer yang dipilih
        apiService.getBomByCustomer(customer, new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String responseBody) {
                runOnUiThread(() -> parseDescriptionData(responseBody));
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> {
                    Toast.makeText(MesinOutputActivity.this, "Error loading description: " + message, Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void parseDescriptionData(String responseBody) {
        try {
            JSONObject response = new JSONObject(responseBody);
            if (response.getBoolean("success")) {
                JSONArray bomItems = response.getJSONArray("data");
                bomData.clear();
                List<String> descriptionList = new ArrayList<>();
                
                for (int i = 0; i < bomItems.length(); i++) {
                    JSONObject item = bomItems.getJSONObject(i);
                    bomData.add(item);
                    descriptionList.add(item.getString("description"));
                }
                
                // Setup description dropdown
                ArrayAdapter<String> descriptionAdapter = new ArrayAdapter<>(this, 
                    android.R.layout.simple_dropdown_item_1line, descriptionList);
                acDescription.setAdapter(descriptionAdapter);
                acDescription.setEnabled(true);
                
                // Store selected BOM item for later use
                acDescription.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        selectedBOMItem = bomData.get(position);
                        autoFillFromBOM();
                    }
                });
                
            } else {
                Toast.makeText(this, "No description found for this customer", Toast.LENGTH_SHORT).show();
            }
        } catch (JSONException e) {
            Toast.makeText(this, "Error parsing description data", Toast.LENGTH_SHORT).show();
        }
    }

    private void autoFillFromBOM() {
        if (selectedBOMItem != null) {
            try {
                String partnumber = selectedBOMItem.getString("partnumber");
                String model = selectedBOMItem.getString("model");
                
                etPartnumber.setText(partnumber);
                etModel.setText(model);
                
                // Make readonly setelah auto-fill
                etPartnumber.setEnabled(false);
                etModel.setEnabled(false);
                
            } catch (JSONException e) {
                Toast.makeText(this, "Error auto-filling BOM data", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void clearDependentFields() {
        acDescription.setText("");
        etPartnumber.setText("");
        etModel.setText("");
        etPartnumber.setEnabled(true);
        etModel.setEnabled(true);
        acDescription.setEnabled(false);
        selectedBOMItem = null;
    }

    private void submitMesinOutput() {
        String customer = acCustomer.getText().toString().trim();
        String description = acDescription.getText().toString().trim();
        String partnumber = etPartnumber.getText().toString().trim();
        String model = etModel.getText().toString().trim();
        String quantityOKStr = etQuantityOK.getText().toString().trim();
        String quantityNGStr = etQuantityNG.getText().toString().trim();
        String operator = etOperator.getText().toString().trim();

        // Validasi input
        if (customer.isEmpty() || description.isEmpty() || partnumber.isEmpty() || 
            model.isEmpty() || quantityOKStr.isEmpty() || quantityNGStr.isEmpty() || operator.isEmpty()) {
            Toast.makeText(this, "Semua field harus diisi", Toast.LENGTH_SHORT).show();
            return;
        }

        int quantityOK, quantityNG;
        try {
            quantityOK = Integer.parseInt(quantityOKStr);
            quantityNG = Integer.parseInt(quantityNGStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Quantity harus berupa angka", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSubmit.setEnabled(false);
        btnSubmit.setText("Submitting...");

        // POST data ke backend
        apiService.submitMcOutput("AUTO", customer, partnumber, model, description, 
                                 quantityOK, quantityNG, operator, new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String responseBody) {
                runOnUiThread(() -> {
                    btnSubmit.setEnabled(true);
                    btnSubmit.setText("Submit");
                    Toast.makeText(MesinOutputActivity.this, "Data berhasil disimpan", Toast.LENGTH_SHORT).show();
                    clearForm();
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> {
                    btnSubmit.setEnabled(true);
                    btnSubmit.setText("Submit");
                    Toast.makeText(MesinOutputActivity.this, "Error: " + message, Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void clearForm() {
        acCustomer.setText("");
        acDescription.setText("");
        etPartnumber.setText("");
        etModel.setText("");
        etQuantityOK.setText("");
        etQuantityNG.setText("");
        etOperator.setText("");
        etPartnumber.setEnabled(true);
        etModel.setEnabled(true);
        acDescription.setEnabled(false);
        selectedBOMItem = null;
    }
}