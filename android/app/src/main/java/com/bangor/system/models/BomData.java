package com.bangor.system.models;

public class BomData {
    private String customer;
    private String partnumber;
    private String model;
    private String description;
    private String timestamp;

    // Constructors
    public BomData() {}

    public BomData(String customer, String partnumber, String model, String description) {
        this.customer = customer;
        this.partnumber = partnumber;
        this.model = model;
        this.description = description;
    }

    // Getters and Setters
    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public String getPartnumber() {
        return partnumber;
    }

    public void setPartnumber(String partnumber) {
        this.partnumber = partnumber;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
