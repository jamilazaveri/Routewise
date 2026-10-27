package com.routewise.dto;

public class BookingStatusUpdateRequest {

    private String status; // 'Not booked', 'Booked', 'Call pending'
    private String referenceNumber;
    private String notes;
    private String stopType;
    private String stopName;

    public BookingStatusUpdateRequest() {}

    public BookingStatusUpdateRequest(String status, String referenceNumber, String notes) {
        this.status = status;
        this.referenceNumber = referenceNumber;
        this.notes = notes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStopType() { return stopType; }
    public void setStopType(String stopType) { this.stopType = stopType; }

    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }
}
