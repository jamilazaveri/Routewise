package com.routewise.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BookingOptionDto {

    private String stopType; // hotel, restaurant, attraction, transport
    private Long stopId;
    private String name;
    private String cityName;
    private String phone;
    private String websiteUrl;
    private String mapsUrl;
    private String ticketInfo;
    private BigDecimal price;
    private String rating;
    private String openingHours;
    private String bestTimeToVisit;
    private String rules;
    private String accessibility;
    private String suggestedReservationTime;
    private String notes;
    private String disclaimer = "Prices, seat/room availability, and schedules are estimates. Final booking, confirmation, and payments take place directly on partner websites.";

    private List<ProviderLinkDto> providerLinks = new ArrayList<>();

    public BookingOptionDto() {}

    public static class ProviderLinkDto {
        private String provider; // makemytrip, booking.com, google_maps, zomato, swiggy, redbus, irctc, official
        private String label;
        private String url;
        private String icon;
        private String description;

        public ProviderLinkDto() {}

        public ProviderLinkDto(String provider, String label, String url, String icon, String description) {
            this.provider = provider;
            this.label = label;
            this.url = url;
            this.icon = icon;
            this.description = description;
        }

        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public String getStopType() { return stopType; }
    public void setStopType(String stopType) { this.stopType = stopType; }

    public Long getStopId() { return stopId; }
    public void setStopId(Long stopId) { this.stopId = stopId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    public String getMapsUrl() { return mapsUrl; }
    public void setMapsUrl(String mapsUrl) { this.mapsUrl = mapsUrl; }

    public String getTicketInfo() { return ticketInfo; }
    public void setTicketInfo(String ticketInfo) { this.ticketInfo = ticketInfo; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public String getBestTimeToVisit() { return bestTimeToVisit; }
    public void setBestTimeToVisit(String bestTimeToVisit) { this.bestTimeToVisit = bestTimeToVisit; }

    public String getRules() { return rules; }
    public void setRules(String rules) { this.rules = rules; }

    public String getAccessibility() { return accessibility; }
    public void setAccessibility(String accessibility) { this.accessibility = accessibility; }

    public String getSuggestedReservationTime() { return suggestedReservationTime; }
    public void setSuggestedReservationTime(String suggestedReservationTime) { this.suggestedReservationTime = suggestedReservationTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }

    public List<ProviderLinkDto> getProviderLinks() { return providerLinks; }
    public void setProviderLinks(List<ProviderLinkDto> providerLinks) { this.providerLinks = providerLinks; }
}
