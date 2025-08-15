package com.bangor.system.models;

public class ProductionResponse {
    private boolean success;
    private String message;
    private ProductionData data;
    
    public static class ProductionData {
        private int id;
        private String machine;
        private String machine_name;
        private String customer;
        private String partnumber;
        private String model;
        private String description;
        private int quantity_ok;
        private int quantity_ng;
        private int quantity;
        private int quantity_input;
        private int quantity_output;
        private String operator;
        private String status;
        private String shift;
        private String lotnumber;
        private String from_process;
        private String to_process;
        private String process_type;
        private String notes;
        private String timestamp;
        
        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        
        public String getMachine() { return machine; }
        public void setMachine(String machine) { this.machine = machine; }
        
        public String getMachine_name() { return machine_name; }
        public void setMachine_name(String machine_name) { this.machine_name = machine_name; }
        
        public String getCustomer() { return customer; }
        public void setCustomer(String customer) { this.customer = customer; }
        
        public String getPartnumber() { return partnumber; }
        public void setPartnumber(String partnumber) { this.partnumber = partnumber; }
        
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public int getQuantity_ok() { return quantity_ok; }
        public void setQuantity_ok(int quantity_ok) { this.quantity_ok = quantity_ok; }
        
        public int getQuantity_ng() { return quantity_ng; }
        public void setQuantity_ng(int quantity_ng) { this.quantity_ng = quantity_ng; }
        
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        
        public int getQuantity_input() { return quantity_input; }
        public void setQuantity_input(int quantity_input) { this.quantity_input = quantity_input; }
        
        public int getQuantity_output() { return quantity_output; }
        public void setQuantity_output(int quantity_output) { this.quantity_output = quantity_output; }
        
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getShift() { return shift; }
        public void setShift(String shift) { this.shift = shift; }
        
        public String getLotnumber() { return lotnumber; }
        public void setLotnumber(String lotnumber) { this.lotnumber = lotnumber; }
        
        public String getFrom_process() { return from_process; }
        public void setFrom_process(String from_process) { this.from_process = from_process; }
        
        public String getTo_process() { return to_process; }
        public void setTo_process(String to_process) { this.to_process = to_process; }
        
        public String getProcess_type() { return process_type; }
        public void setProcess_type(String process_type) { this.process_type = process_type; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }
    
    // Main class getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public ProductionData getData() { return data; }
    public void setData(ProductionData data) { this.data = data; }
}
