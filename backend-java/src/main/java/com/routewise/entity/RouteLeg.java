package com.routewise.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "route_legs")
public class RouteLeg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_option_id", nullable = false)
    @JsonIgnore
    private RouteOption routeOption;

    @Column(nullable = false)
    private Integer seq;

    @Column(name = "from_stop_name", nullable = false, length = 150)
    private String fromStopName;

    @Column(name = "from_stop_type", nullable = false, length = 30)
    private String fromStopType;

    @Column(name = "from_lat", nullable = false, precision = 10, scale = 7)
    private BigDecimal fromLat;

    @Column(name = "from_lng", nullable = false, precision = 10, scale = 7)
    private BigDecimal fromLng;

    @Column(name = "to_stop_name", nullable = false, length = 150)
    private String toStopName;

    @Column(name = "to_stop_type", nullable = false, length = 30)
    private String toStopType;

    @Column(name = "to_lat", nullable = false, precision = 10, scale = 7)
    private BigDecimal toLat;

    @Column(name = "to_lng", nullable = false, precision = 10, scale = 7)
    private BigDecimal toLng;

    @Column(name = "distance_km", nullable = false, precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "duration_mins", nullable = false)
    private Integer durationMins;

    @Column(name = "toll_cost", precision = 10, scale = 2)
    private BigDecimal tollCost = BigDecimal.ZERO;

    @Column(name = "fuel_cost", precision = 10, scale = 2)
    private BigDecimal fuelCost = BigDecimal.ZERO;

    @Column(name = "arrival_time", length = 20)
    private String arrivalTime;

    @Column(name = "departure_time", length = 20)
    private String departureTime;

    @Column(name = "stay_duration_mins")
    private Integer stayDurationMins = 0;

    @Column(columnDefinition = "TEXT")
    private String geometry;

    @Column(length = 255)
    private String instructions;

    @Column(name = "closing_time_warning", length = 255)
    private String closingTimeWarning;

    public RouteLeg() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RouteOption getRouteOption() { return routeOption; }
    public void setRouteOption(RouteOption routeOption) { this.routeOption = routeOption; }

    public Integer getSeq() { return seq; }
    public void setSeq(Integer seq) { this.seq = seq; }

    public String getFromStopName() { return fromStopName; }
    public void setFromStopName(String fromStopName) { this.fromStopName = fromStopName; }

    public String getFromStopType() { return fromStopType; }
    public void setFromStopType(String fromStopType) { this.fromStopType = fromStopType; }

    public BigDecimal getFromLat() { return fromLat; }
    public void setFromLat(BigDecimal fromLat) { this.fromLat = fromLat; }

    public BigDecimal getFromLng() { return fromLng; }
    public void setFromLng(BigDecimal fromLng) { this.fromLng = fromLng; }

    public String getToStopName() { return toStopName; }
    public void setToStopName(String toStopName) { this.toStopName = toStopName; }

    public String getToStopType() { return toStopType; }
    public void setToStopType(String toStopType) { this.toStopType = toStopType; }

    public BigDecimal getToLat() { return toLat; }
    public void setToLat(BigDecimal toLat) { this.toLat = toLat; }

    public BigDecimal getToLng() { return toLng; }
    public void setToLng(BigDecimal toLng) { this.toLng = toLng; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

    public Integer getDurationMins() { return durationMins; }
    public void setDurationMins(Integer durationMins) { this.durationMins = durationMins; }

    public BigDecimal getTollCost() { return tollCost; }
    public void setTollCost(BigDecimal tollCost) { this.tollCost = tollCost; }

    public BigDecimal getFuelCost() { return fuelCost; }
    public void setFuelCost(BigDecimal fuelCost) { this.fuelCost = fuelCost; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public Integer getStayDurationMins() { return stayDurationMins; }
    public void setStayDurationMins(Integer stayDurationMins) { this.stayDurationMins = stayDurationMins; }

    public String getGeometry() { return geometry; }
    public void setGeometry(String geometry) { this.geometry = geometry; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getClosingTimeWarning() { return closingTimeWarning; }
    public void setClosingTimeWarning(String closingTimeWarning) { this.closingTimeWarning = closingTimeWarning; }
}
