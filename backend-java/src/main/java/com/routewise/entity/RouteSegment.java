package com.routewise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "route_segments")
public class RouteSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "from_name", nullable = false, length = 150)
    private String fromName;

    @Column(name = "to_name", nullable = false, length = 150)
    private String toName;

    @Column(name = "distance_km", nullable = false, precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "duration_mins", nullable = false)
    private Integer durationMins;

    @Column(name = "toll_cost", precision = 8, scale = 2)
    private BigDecimal tollCost = BigDecimal.ZERO;

    @Column(name = "fuel_cost", precision = 8, scale = 2)
    private BigDecimal fuelCost = BigDecimal.ZERO;

    @Column(name = "scenic_score", precision = 3, scale = 2)
    private BigDecimal scenicScore = new BigDecimal("0.50");

    @Column(length = 20)
    private String difficulty = "medium";

    @Column(name = "turn_count")
    private Integer turnCount = 4;

    @Column(name = "congestion_level", length = 20)
    private String congestionLevel = "medium";

    @Column(columnDefinition = "TEXT")
    private String geometry;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public RouteSegment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }

    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }

    public String getToName() { return toName; }
    public void setToName(String toName) { this.toName = toName; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

    public Integer getDurationMins() { return durationMins; }
    public void setDurationMins(Integer durationMins) { this.durationMins = durationMins; }

    public BigDecimal getTollCost() { return tollCost; }
    public void setTollCost(BigDecimal tollCost) { this.tollCost = tollCost; }

    public BigDecimal getFuelCost() { return fuelCost; }
    public void setFuelCost(BigDecimal fuelCost) { this.fuelCost = fuelCost; }

    public BigDecimal getScenicScore() { return scenicScore; }
    public void setScenicScore(BigDecimal scenicScore) { this.scenicScore = scenicScore; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getTurnCount() { return turnCount; }
    public void setTurnCount(Integer turnCount) { this.turnCount = turnCount; }

    public String getCongestionLevel() { return congestionLevel; }
    public void setCongestionLevel(String congestionLevel) { this.congestionLevel = congestionLevel; }

    public String getGeometry() { return geometry; }
    public void setGeometry(String geometry) { this.geometry = geometry; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
