package com.routewise.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class MultiRoutePlanRequest {

    private Long tripId;
    private String cityName;
    private String transportMode = "car";
    private List<StopItemDto> stops = new ArrayList<>();

    public MultiRoutePlanRequest() {}

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public List<StopItemDto> getStops() { return stops; }
    public void setStops(List<StopItemDto> stops) { this.stops = stops; }

    public static class StopItemDto {
        private Long id;
        private String name;
        private String type; // hotel, restaurant, attraction
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String openingTime;
        private String closingTime;
        private Double durationHours = 1.0;
        private BigDecimal ticketPrice = BigDecimal.ZERO;
        private String mealType;
        private Double rating = 4.0;
        private Double scenicScore = 0.5;
        private String category;
        private String address;

        public StopItemDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

        public String getOpeningTime() { return openingTime; }
        public void setOpeningTime(String openingTime) { this.openingTime = openingTime; }

        public String getClosingTime() { return closingTime; }
        public void setClosingTime(String closingTime) { this.closingTime = closingTime; }

        public Double getDurationHours() { return durationHours; }
        public void setDurationHours(Double durationHours) { this.durationHours = durationHours; }

        public BigDecimal getTicketPrice() { return ticketPrice; }
        public void setTicketPrice(BigDecimal ticketPrice) { this.ticketPrice = ticketPrice; }

        public String getMealType() { return mealType; }
        public void setMealType(String mealType) { this.mealType = mealType; }

        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }

        public Double getScenicScore() { return scenicScore; }
        public void setScenicScore(Double scenicScore) { this.scenicScore = scenicScore; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }
}
