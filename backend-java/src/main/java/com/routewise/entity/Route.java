package com.routewise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "routes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"origin_city_id", "destination_city_id"})
})
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "origin_city_id", nullable = false)
    private City originCity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_city_id", nullable = false)
    private City destinationCity;

    @Column(name = "distance_km", nullable = false, precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "toll_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal tollCost = BigDecimal.ZERO;

    @Column(name = "estimated_time_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal estimatedTimeHours;

    @Column(name = "highway_name", length = 100)
    private String highwayName;

    public Route() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public City getOriginCity() { return originCity; }
    public void setOriginCity(City originCity) { this.originCity = originCity; }

    public City getDestinationCity() { return destinationCity; }
    public void setDestinationCity(City destinationCity) { this.destinationCity = destinationCity; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

    public BigDecimal getTollCost() { return tollCost; }
    public void setTollCost(BigDecimal tollCost) { this.tollCost = tollCost; }

    public BigDecimal getEstimatedTimeHours() { return estimatedTimeHours; }
    public void setEstimatedTimeHours(BigDecimal estimatedTimeHours) { this.estimatedTimeHours = estimatedTimeHours; }

    public String getHighwayName() { return highwayName; }
    public void setHighwayName(String highwayName) { this.highwayName = highwayName; }
}
