package com.bangor.system.models;

import java.util.List;

public class BomByCustomerResponse {
    private boolean success;
    private String message;
    private BomByCustomerData data;
    
    public static class BomByCustomerData {
        private String customer;
        private List<String> partnumbers;
        private List<BomItem> bom_details;
        private int total_records;
        
        // Getters and Setters
        public String getCustomer() { return customer; }
        public void setCustomer(String customer) { this.customer = customer; }
        
        public List<String> getPartnumbers() { return partnumbers; }
        public void setPartnumbers(List<String> partnumbers) { this.partnumbers = partnumbers; }
        
        public List<BomItem> getBom_details() { return bom_details; }
        public void setBom_details(List<BomItem> bom_details) { this.bom_details = bom_details; }
        
        public int getTotal_records() { return total_records; }
        public void setTotal_records(int total_records) { this.total_records = total_records; }
    }
    
    public static class BomItem {
        private int id;
        private String partnumber;
        private String model;
        private String description;
        private String timestamp;
        
        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        
        public String getPartnumber() { return partnumber; }
        public void setPartnumber(String partnumber) { this.partnumber = partnumber; }
        
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }
    
    // Main class getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public BomByCustomerData getData() { return data; }
    public void setData(BomByCustomerData data) { this.data = data; }
}
