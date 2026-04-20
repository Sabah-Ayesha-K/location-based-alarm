package com.locationalarm.backend.dto;

public class FrequentPlaceResponse {
    private String label;
    private Double latitude;
    private Double longitude;
    private String address;
    private int visitCount;

    public FrequentPlaceResponse() {
    }

    public FrequentPlaceResponse(String label, Double latitude, Double longitude, String address, int visitCount) {
        this.label = label;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.visitCount = visitCount;
    }

    public String getLabel() {
        return label;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getAddress() {
        return address;
    }

    public int getVisitCount() {
        return visitCount;
    }
}