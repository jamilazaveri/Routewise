package com.routewise.dto;

import java.time.LocalDateTime;

public class TripBookingItemDto {

    private Long id;
    private Long tripId;
    private String stopType;
    private Long stopId;
    private String stopName;
    private String status; // Not booked, Booked, Call pending
    private String referenceNumber;
    private String notes;
    private LocalDateTime updatedAt;
    private BookingOptionDto bookingOptions;

    public TripBookingItemDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getStopType() { return stopType; }
    public void setStopType(String stopType) { this.stopType = stopType; }

    public Long getStopId() { return stopId; }
    public void setStopId(Long stopId) { this.stopId = stopId; }

    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public BookingOptionDto getBookingOptions() { return bookingOptions; }
    public void setBookingOptions(BookingOptionDto bookingOptions) { this.bookingOptions = bookingOptions; }
}
