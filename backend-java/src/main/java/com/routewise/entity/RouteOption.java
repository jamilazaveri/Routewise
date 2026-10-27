package com.routewise.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "route_options")
public class RouteOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnore
    private Trip trip;

    @Column(name = "route_type", nullable = false, length = 20)
    private String routeType; // fastest, shortest, cheapest, scenic, easiest

    @Column(length = 50)
    private String tag;

    @Column(name = "total_distance_km", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalDistanceKm;

    @Column(name = "total_time_mins", nullable = false)
    private Integer totalTimeMins;

    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "fuel_cost", precision = 10, scale = 2)
    private BigDecimal fuelCost = BigDecimal.ZERO;

    @Column(name = "toll_cost", precision = 10, scale = 2)
    private BigDecimal tollCost = BigDecimal.ZERO;

    @Column(name = "scenic_score", precision = 3, scale = 2)
    private BigDecimal scenicScore = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "routeOption", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("seq ASC")
    private List<RouteLeg> legs = new ArrayList<>();

    public RouteOption() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public String getRouteType() { return routeType; }
    public void setRouteType(String routeType) { this.routeType = routeType; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public BigDecimal getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(BigDecimal totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public Integer getTotalTimeMins() { return totalTimeMins; }
    public void setTotalTimeMins(Integer totalTimeMins) { this.totalTimeMins = totalTimeMins; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public BigDecimal getFuelCost() { return fuelCost; }
    public void setFuelCost(BigDecimal fuelCost) { this.fuelCost = fuelCost; }

    public BigDecimal getTollCost() { return tollCost; }
    public void setTollCost(BigDecimal tollCost) { this.tollCost = tollCost; }

    public BigDecimal getScenicScore() { return scenicScore; }
    public void setScenicScore(BigDecimal scenicScore) { this.scenicScore = scenicScore; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<RouteLeg> getLegs() { return legs; }
    public void setLegs(List<RouteLeg> legs) { this.legs = legs; }

    public void addLeg(RouteLeg leg) {
        legs.add(leg);
        leg.setRouteOption(this);
    }
}
