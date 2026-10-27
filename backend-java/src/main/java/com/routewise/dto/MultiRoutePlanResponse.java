package com.routewise.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.*;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MultiRoutePlanResponse {

    @JsonAlias({"trip_id", "tripId"})
    private Long tripId;

    @JsonAlias({"city_name", "cityName"})
    private String cityName;

    @JsonAlias({"transport_mode", "transportMode"})
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

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RouteDetailDto {
        private Long id;

        @JsonAlias({"route_type", "routeType"})
        private String routeType;

        private String tag;

        @JsonAlias({"total_distance_km", "totalDistanceKm"})
        private BigDecimal totalDistanceKm;

        @JsonAlias({"total_time_mins", "totalTimeMins"})
        private Integer totalTimeMins;

        @JsonAlias({"total_cost", "totalCost"})
        private BigDecimal totalCost;

        @JsonAlias({"fuel_cost", "fuelCost"})
        private BigDecimal fuelCost;

        @JsonAlias({"toll_cost", "tollCost"})
        private BigDecimal tollCost;

        @JsonAlias({"scenic_score", "scenicScore"})
        private BigDecimal scenicScore;

        private String summary;

        @JsonAlias({"ordered_stops", "orderedStops"})
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

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LegDto {
        private Integer seq;

        @JsonAlias({"from_stop_name", "fromStopName"})
        private String fromStopName;

        @JsonAlias({"from_stop_type", "fromStopType"})
        private String fromStopType;

        @JsonAlias({"from_lat", "fromLat"})
        private BigDecimal fromLat;

        @JsonAlias({"from_lng", "fromLng"})
        private BigDecimal fromLng;

        @JsonAlias({"to_stop_name", "toStopName"})
        private String toStopName;

        @JsonAlias({"to_stop_type", "toStopType"})
        private String toStopType;

        @JsonAlias({"to_lat", "toLat"})
        private BigDecimal toLat;

        @JsonAlias({"to_lng", "toLng"})
        private BigDecimal toLng;

        @JsonAlias({"distance_km", "distanceKm"})
        private BigDecimal distanceKm;

        @JsonAlias({"duration_mins", "durationMins"})
        private Integer durationMins;

        @JsonAlias({"toll_cost", "tollCost"})
        private BigDecimal tollCost;

        @JsonAlias({"fuel_cost", "fuelCost"})
        private BigDecimal fuelCost;

        @JsonAlias({"arrival_time", "arrivalTime"})
        private String arrivalTime;

        @JsonAlias({"departure_time", "departureTime"})
        private String departureTime;

        @JsonAlias({"stay_duration_mins", "stayDurationMins"})
        private Integer stayDurationMins;

        private List<List<Double>> geometry = new ArrayList<>();
        private String instructions;

        @JsonAlias({"closing_time_warning", "closingTimeWarning"})
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

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RouteComparisonDto {
        @JsonAlias({"route_type", "routeType"})
        private String routeType;

        private String title;

        @JsonAlias({"distance_km", "distanceKm", "totalDistanceKm"})
        private BigDecimal distanceKm;

        @JsonAlias({"time_mins", "timeMins", "totalTimeMins", "durationMins"})
        private Integer timeMins;

        @JsonAlias({"fuel_cost", "fuelCost"})
        private BigDecimal fuelCost;

        @JsonAlias({"toll_cost", "tollCost"})
        private BigDecimal tollCost;

        @JsonAlias({"total_cost", "totalCost", "cost_inr"})
        private BigDecimal totalCost;

        @JsonAlias({"scenic_score", "scenicScore"})
        private BigDecimal scenicScore;

        @JsonAlias({"stops_count", "stopsCount"})
        private Integer stopsCount;

        @JsonAlias({"warnings_count", "warningsCount"})
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
