package com.routewise.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_links")
public class BookingLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stop_type", nullable = false, length = 50)
    private String stopType; // hotel, restaurant, attraction, transport

    @Column(name = "stop_id")
    private Long stopId;

    @Column(nullable = false, length = 50)
    private String provider; // makemytrip, booking.com, google_maps, zomato, swiggy, redbus, irctc, official

    @Column(name = "url_template", nullable = false, length = 1000)
    private String urlTemplate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public BookingLink() {}

    public BookingLink(Long id, String stopType, Long stopId, String provider, String urlTemplate) {
        this.id = id;
        this.stopType = stopType;
        this.stopId = stopId;
        this.provider = provider;
        this.urlTemplate = urlTemplate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStopType() { return stopType; }
    public void setStopType(String stopType) { this.stopType = stopType; }

    public Long getStopId() { return stopId; }
    public void setStopId(Long stopId) { this.stopId = stopId; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getUrlTemplate() { return urlTemplate; }
    public void setUrlTemplate(String urlTemplate) { this.urlTemplate = urlTemplate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
