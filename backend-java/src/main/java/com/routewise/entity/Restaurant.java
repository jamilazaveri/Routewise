package com.routewise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String cuisine;

    @Column(name = "avg_cost_per_person", nullable = false, precision = 10, scale = 2)
    private BigDecimal avgCostPerPerson;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = new BigDecimal("4.00");

    @Column(length = 50)
    private String phone;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "booking_url", length = 500)
    private String bookingUrl;

    @Column(name = "maps_url", length = 500)
    private String mapsUrl;

    @Column(name = "ticket_info", length = 255)
    private String ticketInfo;

    @Column(length = 255)
    private String address;

    @Column(name = "meal_type", nullable = false, length = 50)
    private String mealType = "All"; // Breakfast, Lunch, Dinner, All

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    public Restaurant() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public BigDecimal getAvgCostPerPerson() { return avgCostPerPerson; }
    public void setAvgCostPerPerson(BigDecimal avgCostPerPerson) { this.avgCostPerPerson = avgCostPerPerson; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    public String getBookingUrl() { return bookingUrl; }
    public void setBookingUrl(String bookingUrl) { this.bookingUrl = bookingUrl; }

    public String getMapsUrl() { return mapsUrl; }
    public void setMapsUrl(String mapsUrl) { this.mapsUrl = mapsUrl; }

    public String getTicketInfo() { return ticketInfo; }
    public void setTicketInfo(String ticketInfo) { this.ticketInfo = ticketInfo; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
}
