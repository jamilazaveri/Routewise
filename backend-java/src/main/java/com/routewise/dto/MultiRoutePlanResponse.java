package com.routewise.dto;

import java.math.BigDecimal;
import java.util.*;

public class MultiRoutePlanResponse {

    private Long tripId;
    private String cityName;
    private String transportMode;
    private Map<String, RouteDetailDto> routes = new HashMap<>();
    private List<RouteComparisonDto> comparison = new ArrayList<>();

    public MultiRoutePlanResponse() {}

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public Map<String, RouteDetailDto> getRoutes() { return routes; }
    public void setRoutes(Map<String, RouteDetailDto> routes) { this.routes = routes; }

    public List<RouteComparisonDto> getComparison() { return comparison; }
    public void setComparison(List<RouteComparisonDto> comparison) { this.comparison = comparison; }

    public static class RouteDetailDto {
        private Long id;
        private String routeType;
        private String tag;
        private BigDecimal totalDistanceKm;
        private Integer totalTimeMins;
        private BigDecimal totalCost;
        private BigDecimal fuelCost;
        private BigDecimal tollCost;
        private BigDecimal scenicScore;
        private String summary;
        private List<MultiRoutePlanRequest.StopItemDto> orderedStops = new ArrayList<>();
        private List<LegDto> legs = new ArrayList<>();
        private List<String> warnings = new ArrayList<>();

        public RouteDetailDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

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

        public List<MultiRoutePlanRequest.StopItemDto> getOrderedStops() { return orderedStops; }
        public void setOrderedStops(List<MultiRoutePlanRequest.StopItemDto> orderedStops) { this.orderedStops = orderedStops; }

        public List<LegDto> getLegs() { return legs; }
        public void setLegs(List<LegDto> legs) { this.legs = legs; }

        public List<String> getWarnings() { return warnings; }
        public void setWarnings(List<String> warnings) { this.warnings = warnings; }
    }

    public static class LegDto {
        private Integer seq;
        private String fromStopName;
        private String fromStopType;
        private BigDecimal fromLat;
        private BigDecimal fromLng;
        private String toStopName;
        private String toStopType;
        private BigDecimal toLat;
        private BigDecimal toLng;
        private BigDecimal distanceKm;
        private Integer durationMins;
        private BigDecimal tollCost;
        private BigDecimal fuelCost;
        private String arrivalTime;
        private String departureTime;
        private Integer stayDurationMins;
        private List<List<Double>> geometry = new ArrayList<>();
        private String instructions;
        private String closingTimeWarning;

        public LegDto() {}

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

        public List<List<Double>> getGeometry() { return geometry; }
        public void setGeometry(List<List<Double>> geometry) { this.geometry = geometry; }

        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }

        public String getClosingTimeWarning() { return closingTimeWarning; }
        public void setClosingTimeWarning(String closingTimeWarning) { this.closingTimeWarning = closingTimeWarning; }
    }

    public static class RouteComparisonDto {
        private String routeType;
        private String title;
        private BigDecimal distanceKm;
        private Integer timeMins;
        private BigDecimal fuelCost;
        private BigDecimal tollCost;
        private BigDecimal totalCost;
        private BigDecimal scenicScore;
        private Integer stopsCount;
        private Integer warningsCount;

        public RouteComparisonDto() {}

        public String getRouteType() { return routeType; }
        public void setRouteType(String routeType) { this.routeType = routeType; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public BigDecimal getDistanceKm() { return distanceKm; }
        public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

        public Integer getTimeMins() { return timeMins; }
        public void setTimeMins(Integer timeMins) { this.timeMins = timeMins; }

        public BigDecimal getFuelCost() { return fuelCost; }
        public void setFuelCost(BigDecimal fuelCost) { this.fuelCost = fuelCost; }

        public BigDecimal getTollCost() { return tollCost; }
        public void setTollCost(BigDecimal tollCost) { this.tollCost = tollCost; }

        public BigDecimal getTotalCost() { return totalCost; }
        public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

        public BigDecimal getScenicScore() { return scenicScore; }
        public void setScenicScore(BigDecimal scenicScore) { this.scenicScore = scenicScore; }

        public Integer getStopsCount() { return stopsCount; }
        public void setStopsCount(Integer stopsCount) { this.stopsCount = stopsCount; }

        public Integer getWarningsCount() { return warningsCount; }
        public void setWarningsCount(Integer warningsCount) { this.warningsCount = warningsCount; }
    }
}
