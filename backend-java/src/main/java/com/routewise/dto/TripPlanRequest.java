package com.routewise.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TripPlanRequest {

    private String tripName;

    @NotBlank(message = "Start location is required")
    private String startCity;

    @NotBlank(message = "Destination city is required")
    private String destinationCity;

    private LocalDate startDate;
    private LocalDate endDate;

    @Min(value = 1, message = "Trip must be at least 1 day")
    @Max(value = 14, message = "Trip maximum is 14 days")
    private Integer numDays = 2;

    @Min(value = 1, message = "At least 1 traveller is required")
    @Max(value = 50, message = "Traveller limit exceeded")
    private Integer numTravellers = 1;

    @NotBlank(message = "Transport mode is required")
    @Pattern(regexp = "^(car|bike|bus|train)$", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Transport mode must be car, bike, bus, or train")
    private String transportMode = "car";

    @NotNull(message = "Minimum budget is required")
    @DecimalMin(value = "500.00", message = "Minimum budget must be at least ₹500")
    private BigDecimal totalBudgetMin;

    @NotNull(message = "Maximum budget is required")
    @DecimalMin(value = "1000.00", message = "Maximum budget must be at least ₹1,000")
    private BigDecimal totalBudgetMax;

    // Category percentage shares (default 35, 25, 20, 20)
    private BigDecimal shareAccommodation = new BigDecimal("35.00");
    private BigDecimal shareFood = new BigDecimal("25.00");
    private BigDecimal shareTransport = new BigDecimal("20.00");
    private BigDecimal shareSightseeing = new BigDecimal("20.00");

    public TripPlanRequest() {}

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public String getStartCity() { return startCity; }
    public void setStartCity(String startCity) { this.startCity = startCity; }

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getNumDays() { return numDays; }
    public void setNumDays(Integer numDays) { this.numDays = numDays; }

    public Integer getNumTravellers() { return numTravellers; }
    public void setNumTravellers(Integer numTravellers) { this.numTravellers = numTravellers; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public BigDecimal getTotalBudgetMin() { return totalBudgetMin; }
    public void setTotalBudgetMin(BigDecimal totalBudgetMin) { this.totalBudgetMin = totalBudgetMin; }

    public BigDecimal getTotalBudgetMax() { return totalBudgetMax; }
    public void setTotalBudgetMax(BigDecimal totalBudgetMax) { this.totalBudgetMax = totalBudgetMax; }

    public BigDecimal getShareAccommodation() { return shareAccommodation; }
    public void setShareAccommodation(BigDecimal shareAccommodation) { this.shareAccommodation = shareAccommodation; }

    public BigDecimal getShareFood() { return shareFood; }
    public void setShareFood(BigDecimal shareFood) { this.shareFood = shareFood; }

    public BigDecimal getShareTransport() { return shareTransport; }
    public void setShareTransport(BigDecimal shareTransport) { this.shareTransport = shareTransport; }

    public BigDecimal getShareSightseeing() { return shareSightseeing; }
    public void setShareSightseeing(BigDecimal shareSightseeing) { this.shareSightseeing = shareSightseeing; }
}
