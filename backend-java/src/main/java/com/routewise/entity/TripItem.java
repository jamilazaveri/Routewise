package com.routewise.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "trip_items")
public class TripItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnore
    private Trip trip;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "item_order", nullable = false)
    private Integer itemOrder;

    @Column(name = "item_type", nullable = false, length = 30)
    private String itemType; // attraction, hotel, restaurant, transport

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    public TripItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public Integer getDayNumber() { return dayNumber; }
    public void setDayNumber(Integer dayNumber) { this.dayNumber = dayNumber; }

    public Integer getItemOrder() { return itemOrder; }
    public void setItemOrder(Integer itemOrder) { this.itemOrder = itemOrder; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
