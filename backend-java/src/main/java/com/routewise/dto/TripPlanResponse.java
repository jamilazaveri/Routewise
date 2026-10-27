package com.routewise.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TripPlanResponse {

    private Long tripId;
    private String tripName;
    private String startCity;
    private String destinationCity;
    private Integer numDays;
    private Integer numTravellers;
    private String transportMode;
    private BigDecimal routeDistanceKm;
    private BigDecimal routeTollCost;
    private String highwayName;

    private Boolean isFeasible;
    private String statusMessage;

    private CostBreakdownDto costBreakdown;
    private Map<String, BigDecimal> categoryBudgets = new HashMap<>();

    private HotelSummaryDto selectedHotel;
    private Integer roomsNeeded = 1;
    private List<RestaurantSummaryDto> recommendedRestaurants = new ArrayList<>();
    private List<AttractionSummaryDto> recommendedAttractions = new ArrayList<>();

    private List<DayPlanDto> itinerary = new ArrayList<>();
    private CheapestAlternativeDto cheapestAlternative;

    public TripPlanResponse() {}

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public String getStartCity() { return startCity; }
    public void setStartCity(String startCity) { this.startCity = startCity; }

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public Integer getNumDays() { return numDays; }
    public void setNumDays(Integer numDays) { this.numDays = numDays; }

    public Integer getNumTravellers() { return numTravellers; }
    public void setNumTravellers(Integer numTravellers) { this.numTravellers = numTravellers; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public BigDecimal getRouteDistanceKm() { return routeDistanceKm; }
    public void setRouteDistanceKm(BigDecimal routeDistanceKm) { this.routeDistanceKm = routeDistanceKm; }

    public BigDecimal getRouteTollCost() { return routeTollCost; }
    public void setRouteTollCost(BigDecimal routeTollCost) { this.routeTollCost = routeTollCost; }

    public String getHighwayName() { return highwayName; }
    public void setHighwayName(String highwayName) { this.highwayName = highwayName; }

    public Boolean getIsFeasible() { return isFeasible; }
    public void setIsFeasible(Boolean isFeasible) { this.isFeasible = isFeasible; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public CostBreakdownDto getCostBreakdown() { return costBreakdown; }
    public void setCostBreakdown(CostBreakdownDto costBreakdown) { this.costBreakdown = costBreakdown; }

    public Map<String, BigDecimal> getCategoryBudgets() { return categoryBudgets; }
    public void setCategoryBudgets(Map<String, BigDecimal> categoryBudgets) { this.categoryBudgets = categoryBudgets; }

    public HotelSummaryDto getSelectedHotel() { return selectedHotel; }
    public void setSelectedHotel(HotelSummaryDto selectedHotel) { this.selectedHotel = selectedHotel; }

    public Integer getRoomsNeeded() { return roomsNeeded; }
    public void setRoomsNeeded(Integer roomsNeeded) { this.roomsNeeded = roomsNeeded; }

    public List<RestaurantSummaryDto> getRecommendedRestaurants() { return recommendedRestaurants; }
    public void setRecommendedRestaurants(List<RestaurantSummaryDto> recommendedRestaurants) { this.recommendedRestaurants = recommendedRestaurants; }

    public List<AttractionSummaryDto> getRecommendedAttractions() { return recommendedAttractions; }
    public void setRecommendedAttractions(List<AttractionSummaryDto> recommendedAttractions) { this.recommendedAttractions = recommendedAttractions; }

    public List<DayPlanDto> getItinerary() { return itinerary; }
    public void setItinerary(List<DayPlanDto> itinerary) { this.itinerary = itinerary; }

    public CheapestAlternativeDto getCheapestAlternative() { return cheapestAlternative; }
    public void setCheapestAlternative(CheapestAlternativeDto cheapestAlternative) { this.cheapestAlternative = cheapestAlternative; }

    // Nested DTOs
    public static class CostBreakdownDto {
        private BigDecimal accommodation = BigDecimal.ZERO;
        private BigDecimal food = BigDecimal.ZERO;
        private BigDecimal fuel = BigDecimal.ZERO;
        private BigDecimal tolls = BigDecimal.ZERO;
        private BigDecimal sightseeing = BigDecimal.ZERO;
        private BigDecimal miscellaneous = BigDecimal.ZERO;
        private BigDecimal total = BigDecimal.ZERO;
        private BigDecimal budgetMax = BigDecimal.ZERO;
        private BigDecimal amountLeft = BigDecimal.ZERO;

        public CostBreakdownDto() {}

        public BigDecimal getAccommodation() { return accommodation; }
        public void setAccommodation(BigDecimal accommodation) { this.accommodation = accommodation; }
        public BigDecimal getFood() { return food; }
        public void setFood(BigDecimal food) { this.food = food; }
        public BigDecimal getFuel() { return fuel; }
        public void setFuel(BigDecimal fuel) { this.fuel = fuel; }
        public BigDecimal getTolls() { return tolls; }
        public void setTolls(BigDecimal tolls) { this.tolls = tolls; }
        public BigDecimal getSightseeing() { return sightseeing; }
        public void setSightseeing(BigDecimal sightseeing) { this.sightseeing = sightseeing; }
        public BigDecimal getMiscellaneous() { return miscellaneous; }
        public void setMiscellaneous(BigDecimal miscellaneous) { this.miscellaneous = miscellaneous; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        public BigDecimal getBudgetMax() { return budgetMax; }
        public void setBudgetMax(BigDecimal budgetMax) { this.budgetMax = budgetMax; }
        public BigDecimal getAmountLeft() { return amountLeft; }
        public void setAmountLeft(BigDecimal amountLeft) { this.amountLeft = amountLeft; }
    }

    public static class HotelSummaryDto {
        private Long id;
        private String name;
        private String tier;
        private BigDecimal pricePerNight;
        private BigDecimal rating;
        private String address;
        private String amenities;

        public HotelSummaryDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getTier() { return tier; }
        public void setTier(String tier) { this.tier = tier; }
        public BigDecimal getPricePerNight() { return pricePerNight; }
        public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }
        public BigDecimal getRating() { return rating; }
        public void setRating(BigDecimal rating) { this.rating = rating; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getAmenities() { return amenities; }
        public void setAmenities(String amenities) { this.amenities = amenities; }
    }

    public static class RestaurantSummaryDto {
        private Long id;
        private String name;
        private String cuisine;
        private BigDecimal avgCostPerPerson;
        private BigDecimal rating;
        private String mealType;
        private String address;

        public RestaurantSummaryDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCuisine() { return cuisine; }
        public void setCuisine(String cuisine) { this.cuisine = cuisine; }
        public BigDecimal getAvgCostPerPerson() { return avgCostPerPerson; }
        public void setAvgCostPerPerson(BigDecimal avgCostPerPerson) { this.avgCostPerPerson = avgCostPerPerson; }
        public BigDecimal getRating() { return rating; }
        public void setRating(BigDecimal rating) { this.rating = rating; }
        public String getMealType() { return mealType; }
        public void setMealType(String mealType) { this.mealType = mealType; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }

    public static class AttractionSummaryDto {
        private Long id;
        private String name;
        private String category;
        private BigDecimal ticketPrice;
        private BigDecimal rating;
        private Integer avgVisitDurationMins;
        private String openingTime;
        private String closingTime;
        private String description;

        public AttractionSummaryDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public BigDecimal getTicketPrice() { return ticketPrice; }
        public void setTicketPrice(BigDecimal ticketPrice) { this.ticketPrice = ticketPrice; }
        public BigDecimal getRating() { return rating; }
        public void setRating(BigDecimal rating) { this.rating = rating; }
        public Integer getAvgVisitDurationMins() { return avgVisitDurationMins; }
        public void setAvgVisitDurationMins(Integer avgVisitDurationMins) { this.avgVisitDurationMins = avgVisitDurationMins; }
        public String getOpeningTime() { return openingTime; }
        public void setOpeningTime(String openingTime) { this.openingTime = openingTime; }
        public String getClosingTime() { return closingTime; }
        public void setClosingTime(String closingTime) { this.closingTime = closingTime; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class DayPlanDto {
        private Integer dayNumber;
        private String dateLabel;
        private BigDecimal dayTotalCost;
        private List<DayPlanItemDto> items = new ArrayList<>();

        public DayPlanDto() {}

        public Integer getDayNumber() { return dayNumber; }
        public void setDayNumber(Integer dayNumber) { this.dayNumber = dayNumber; }
        public String getDateLabel() { return dateLabel; }
        public void setDateLabel(String dateLabel) { this.dateLabel = dateLabel; }
        public BigDecimal getDayTotalCost() { return dayTotalCost; }
        public void setDayTotalCost(BigDecimal dayTotalCost) { this.dayTotalCost = dayTotalCost; }
        public List<DayPlanItemDto> getItems() { return items; }
        public void setItems(List<DayPlanItemDto> items) { this.items = items; }
    }

    public static class DayPlanItemDto {
        private Integer itemOrder;
        private String itemType;
        private String title;
        private String startTime;
        private String endTime;
        private BigDecimal cost;
        private String notes;
        private Long referenceId;

        public DayPlanItemDto() {}

        public Integer getItemOrder() { return itemOrder; }
        public void setItemOrder(Integer itemOrder) { this.itemOrder = itemOrder; }
        public String getItemType() { return itemType; }
        public void setItemType(String itemType) { this.itemType = itemType; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Long getReferenceId() { return referenceId; }
        public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    }

    public static class CheapestAlternativeDto {
        private BigDecimal suggestedBudget;
        private String transportMode;
        private String hotelName;
        private String hotelTier;
        private BigDecimal estimatedCost;
        private List<String> savingsTips = new ArrayList<>();

        public CheapestAlternativeDto() {}

        public BigDecimal getSuggestedBudget() { return suggestedBudget; }
        public void setSuggestedBudget(BigDecimal suggestedBudget) { this.suggestedBudget = suggestedBudget; }
        public String getTransportMode() { return transportMode; }
        public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
        public String getHotelName() { return hotelName; }
        public void setHotelName(String hotelName) { this.hotelName = hotelName; }
        public String getHotelTier() { return hotelTier; }
        public void setHotelTier(String hotelTier) { this.hotelTier = hotelTier; }
        public BigDecimal getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
        public List<String> getSavingsTips() { return savingsTips; }
        public void setSavingsTips(List<String> savingsTips) { this.savingsTips = savingsTips; }
    }
}
