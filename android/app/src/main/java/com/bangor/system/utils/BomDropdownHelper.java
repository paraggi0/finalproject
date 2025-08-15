package com.bangor.system.utils;

import android.content.Context;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Spinner;

import com.bangor.system.network.ApiService;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;

import java.util.ArrayList;
import java.util.List;

public class BomDropdownHelper {
    private static final String TAG = "BomDropdownHelper";
    
    private Context context;
    private ApiService apiService;
    private Gson gson;
    
    public BomDropdownHelper(Context context) {
        this.context = context;
        this.apiService = ApiService.getInstance();
        this.gson = new Gson();
    }
    
    // Interface untuk callback hasil dropdown
    public interface DropdownCallback {
        void onCustomersLoaded(List<String> customers);
        void onPartnumbersLoaded(List<String> partnumbers);
        void onDescriptionsLoaded(List<String> descriptions);
        void onError(String error);
    }
    
    // Load customers untuk dropdown pertama
    public void loadCustomers(DropdownCallback callback) {
        Log.d(TAG, "Loading customers...");
        
        apiService.getBomDropdown(new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String response) {
                try {
                    JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);
                    
                    if (jsonResponse.get("success").getAsBoolean()) {
                        JsonObject data = jsonResponse.getAsJsonObject("data");
                        JsonArray customersArray = data.getAsJsonArray("customers");
                        
                        List<String> customers = new ArrayList<>();
                        for (int i = 0; i < customersArray.size(); i++) {
                            customers.add(customersArray.get(i).getAsString());
                        }
                        
                        Log.d(TAG, "Customers loaded: " + customers.size());
                        callback.onCustomersLoaded(customers);
                    } else {
                        String message = jsonResponse.get("message").getAsString();
                        callback.onError("Failed to load customers: " + message);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing customers response", e);
                    callback.onError("Error parsing response: " + e.getMessage());
                }
            }
            
            @Override
            public void onError(String error) {
                Log.e(TAG, "Failed to load customers: " + error);
                callback.onError(error);
            }
        });
    }
    
    // Load partnumbers berdasarkan customer yang dipilih
    public void loadPartnumbersByCustomer(String customer, DropdownCallback callback) {
        Log.d(TAG, "Loading partnumbers for customer: " + customer);
        
        apiService.getBomByCustomer(customer, new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String response) {
                try {
                    JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);
                    
                    if (jsonResponse.get("success").getAsBoolean()) {
                        JsonObject data = jsonResponse.getAsJsonObject("data");
                        JsonArray partnumbersArray = data.getAsJsonArray("partnumbers");
                        
                        List<String> partnumbers = new ArrayList<>();
                        for (int i = 0; i < partnumbersArray.size(); i++) {
                            partnumbers.add(partnumbersArray.get(i).getAsString());
                        }
                        
                        Log.d(TAG, "Partnumbers loaded: " + partnumbers.size());
                        callback.onPartnumbersLoaded(partnumbers);
                    } else {
                        String message = jsonResponse.get("message").getAsString();
                        callback.onError("Failed to load partnumbers: " + message);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing partnumbers response", e);
                    callback.onError("Error parsing response: " + e.getMessage());
                }
            }
            
            @Override
            public void onError(String error) {
                Log.e(TAG, "Failed to load partnumbers: " + error);
                callback.onError(error);
            }
        });
    }
    
    // Load descriptions berdasarkan customer dan partnumber
    public void loadDescriptionsByCustomerAndPartnumber(String customer, String partnumber, DropdownCallback callback) {
        Log.d(TAG, "Loading descriptions for customer: " + customer + ", partnumber: " + partnumber);
        
        apiService.getBomDetails(customer, partnumber, new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String response) {
                try {
                    JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);
                    
                    if (jsonResponse.get("success").getAsBoolean()) {
                        JsonObject data = jsonResponse.getAsJsonObject("data");
                        JsonArray detailsArray = data.getAsJsonArray("details");
                        
                        List<String> descriptions = new ArrayList<>();
                        for (int i = 0; i < detailsArray.size(); i++) {
                            JsonObject detail = detailsArray.get(i).getAsJsonObject();
                            String description = detail.get("description").getAsString();
                            String model = detail.get("model").getAsString();
                            
                            // Combine description and model untuk dropdown
                            String displayText = description;
                            if (model != null && !model.isEmpty() && !model.equals("xx")) {
                                displayText += " (" + model + ")";
                            }
                            descriptions.add(displayText);
                        }
                        
                        Log.d(TAG, "Descriptions loaded: " + descriptions.size());
                        callback.onDescriptionsLoaded(descriptions);
                    } else {
                        String message = jsonResponse.get("message").getAsString();
                        callback.onError("Failed to load descriptions: " + message);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing descriptions response", e);
                    callback.onError("Error parsing response: " + e.getMessage());
                }
            }
            
            @Override
            public void onError(String error) {
                Log.e(TAG, "Failed to load descriptions: " + error);
                callback.onError(error);
            }
        });
    }
    
    // Helper method untuk setup spinner dengan data
    public void setupSpinner(Spinner spinner, List<String> data) {
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
            context, 
            android.R.layout.simple_spinner_item, 
            data
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
    }
    
    // Helper method untuk setup AutoCompleteTextView dengan data
    public void setupAutoCompleteTextView(AutoCompleteTextView autoCompleteTextView, List<String> data) {
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
            context,
            android.R.layout.simple_dropdown_item_1line,
            data
        );
        autoCompleteTextView.setAdapter(adapter);
        autoCompleteTextView.setThreshold(1); // Show suggestions after 1 character
    }
    
    // Search BOM dengan keyword
    public void searchBom(String keyword, String customer, DropdownCallback callback) {
        Log.d(TAG, "Searching BOM with keyword: " + keyword);
        
        apiService.searchBom(keyword, customer, 50, new ApiService.ApiCallback() {
            @Override
            public void onSuccess(String response) {
                try {
                    JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);
                    
                    if (jsonResponse.get("success").getAsBoolean()) {
                        JsonObject data = jsonResponse.getAsJsonObject("data");
                        JsonArray resultsArray = data.getAsJsonArray("results");
                        
                        List<String> searchResults = new ArrayList<>();
                        for (int i = 0; i < resultsArray.size(); i++) {
                            JsonObject result = resultsArray.get(i).getAsJsonObject();
                            String partnumber = result.get("partnumber").getAsString();
                            String description = result.get("description").getAsString();
                            String customer = result.get("customer").getAsString();
                            
                            String displayText = partnumber + " - " + description + " (" + customer + ")";
                            searchResults.add(displayText);
                        }
                        
                        Log.d(TAG, "Search results: " + searchResults.size());
                        callback.onPartnumbersLoaded(searchResults); // Reuse callback
                    } else {
                        String message = jsonResponse.get("message").getAsString();
                        callback.onError("Search failed: " + message);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing search response", e);
                    callback.onError("Error parsing response: " + e.getMessage());
                }
            }
            
            @Override
            public void onError(String error) {
                Log.e(TAG, "Search failed: " + error);
                callback.onError(error);
            }
        });
    }
}
