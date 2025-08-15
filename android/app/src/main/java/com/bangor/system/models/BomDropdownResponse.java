package com.bangor.system.models;

import java.util.List;

public class BomDropdownResponse {
    private boolean success;
    private String message;
    private BomDropdownData data;
    
    public static class BomDropdownData {
        private List<String> customers;
        private List<BomItem> bom_data;
        private BomGroupedByCustomer grouped_by_customer;
        private int total_customers;
        private int total_bom_records;
        
        // Getters and Setters
        public List<String> getCustomers() { return customers; }
        public void setCustomers(List<String> customers) { this.customers = customers; }
        
        public List<BomItem> getBom_data() { return bom_data; }
        public void setBom_data(List<BomItem> bom_data) { this.bom_data = bom_data; }
        
        public BomGroupedByCustomer getGrouped_by_customer() { return grouped_by_customer; }
        public void setGrouped_by_customer(BomGroupedByCustomer grouped_by_customer) { this.grouped_by_customer = grouped_by_customer; }
        
        public int getTotal_customers() { return total_customers; }
        public void setTotal_customers(int total_customers) { this.total_customers = total_customers; }
        
        public int getTotal_bom_records() { return total_bom_records; }
        public void setTotal_bom_records(int total_bom_records) { this.total_bom_records = total_bom_records; }
    }
    
    public static class BomItem {
        private int id;
        private String customer;
        private String partnumber;
        private String model;
        private String description;
        private String timestamp;
        
        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        
        public String getCustomer() { return customer; }
        public void setCustomer(String customer) { this.customer = customer; }
        
        public String getPartnumber() { return partnumber; }
        public void setPartnumber(String partnumber) { this.partnumber = partnumber; }
        
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }
    
    public static class BomGroupedByCustomer {
        // This will be dynamically populated based on customer names
        // Map<String, List<BomItem>> structure
        // For Android, we'll handle this with Map<String, List<BomItem>>
    }
    
    // Main class getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public BomDropdownData getData() { return data; }
    public void setData(BomDropdownData data) { this.data = data; }
}
