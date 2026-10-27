package com.routewise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "hotels")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String tier = "Budget"; // Budget, Mid-Range, Premium

    @Column(name = "price_per_night", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = new BigDecimal("4.00");

    @Column(length = 255)
    private String address;

    @Column(length = 255)
    private String amenities;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    public Hotel() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }

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

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}
