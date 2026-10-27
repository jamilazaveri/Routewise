package com.routewise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_name", nullable = false, length = 150)
    private String tripName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "start_city_id", nullable = false)
    private City startCity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_city_id", nullable = false)
    private City destinationCity;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "num_days", nullable = false)
    private Integer numDays;

    @Column(name = "num_travellers", nullable = false)
    private Integer numTravellers = 1;

    @Column(name = "transport_mode", nullable = false, length = 20)
    private String transportMode = "car";

    @Column(name = "total_budget_min", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalBudgetMin;

    @Column(name = "total_budget_max", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalBudgetMax;

    @Column(name = "share_accommodation", precision = 5, scale = 2)
    private BigDecimal shareAccommodation = new BigDecimal("35.00");

    @Column(name = "share_food", precision = 5, scale = 2)
    private BigDecimal shareFood = new BigDecimal("25.00");

    @Column(name = "share_transport", precision = 5, scale = 2)
    private BigDecimal shareTransport = new BigDecimal("20.00");

    @Column(name = "share_sightseeing", precision = 5, scale = 2)
    private BigDecimal shareSightseeing = new BigDecimal("20.00");

    @Column(name = "total_estimated_cost", precision = 12, scale = 2)
    private BigDecimal totalEstimatedCost = BigDecimal.ZERO;

    @Column(name = "cost_accommodation", precision = 12, scale = 2)
    private BigDecimal costAccommodation = BigDecimal.ZERO;

    @Column(name = "cost_food", precision = 12, scale = 2)
    private BigDecimal costFood = BigDecimal.ZERO;

    @Column(name = "cost_transport", precision = 12, scale = 2)
    private BigDecimal costTransport = BigDecimal.ZERO;

    @Column(name = "cost_fuel", precision = 12, scale = 2)
    private BigDecimal costFuel = BigDecimal.ZERO;

    @Column(name = "cost_tolls", precision = 12, scale = 2)
    private BigDecimal costTolls = BigDecimal.ZERO;

    @Column(name = "cost_sightseeing", precision = 12, scale = 2)
    private BigDecimal costSightseeing = BigDecimal.ZERO;

    @Column(name = "cost_misc", precision = 12, scale = 2)
    private BigDecimal costMisc = BigDecimal.ZERO;

    @Column(name = "amount_left", precision = 12, scale = 2)
    private BigDecimal amountLeft = BigDecimal.ZERO;

    @Column(name = "is_feasible", nullable = false)
    private Boolean isFeasible = true;

    @Column(name = "feasibility_notes", columnDefinition = "TEXT")
    private String feasibilityNotes;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TripItem> items = new ArrayList<>();

    public Trip() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public City getStartCity() { return startCity; }
    public void setStartCity(City startCity) { this.startCity = startCity; }

    public City getDestinationCity() { return destinationCity; }
    public void setDestinationCity(City destinationCity) { this.destinationCity = destinationCity; }

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

    public BigDecimal getTotalEstimatedCost() { return totalEstimatedCost; }
    public void setTotalEstimatedCost(BigDecimal totalEstimatedCost) { this.totalEstimatedCost = totalEstimatedCost; }

    public BigDecimal getCostAccommodation() { return costAccommodation; }
    public void setCostAccommodation(BigDecimal costAccommodation) { this.costAccommodation = costAccommodation; }

    public BigDecimal getCostFood() { return costFood; }
    public void setCostFood(BigDecimal costFood) { this.costFood = costFood; }

    public BigDecimal getCostTransport() { return costTransport; }
    public void setCostTransport(BigDecimal costTransport) { this.costTransport = costTransport; }

    public BigDecimal getCostFuel() { return costFuel; }
    public void setCostFuel(BigDecimal costFuel) { this.costFuel = costFuel; }

    public BigDecimal getCostTolls() { return costTolls; }
    public void setCostTolls(BigDecimal costTolls) { this.costTolls = costTolls; }

    public BigDecimal getCostSightseeing() { return costSightseeing; }
    public void setCostSightseeing(BigDecimal costSightseeing) { this.costSightseeing = costSightseeing; }

    public BigDecimal getCostMisc() { return costMisc; }
    public void setCostMisc(BigDecimal costMisc) { this.costMisc = costMisc; }

    public BigDecimal getAmountLeft() { return amountLeft; }
    public void setAmountLeft(BigDecimal amountLeft) { this.amountLeft = amountLeft; }

    public Boolean getIsFeasible() { return isFeasible; }
    public void setIsFeasible(Boolean isFeasible) { this.isFeasible = isFeasible; }

    public String getFeasibilityNotes() { return feasibilityNotes; }
    public void setFeasibilityNotes(String feasibilityNotes) { this.feasibilityNotes = feasibilityNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<TripItem> getItems() { return items; }
    public void setItems(List<TripItem> items) { this.items = items; }
}
