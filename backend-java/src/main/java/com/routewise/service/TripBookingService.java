package com.routewise.service;

import com.routewise.dto.BookingOptionDto;
import com.routewise.dto.BookingStatusUpdateRequest;
import com.routewise.dto.TripBookingItemDto;
import com.routewise.entity.*;
import com.routewise.exception.ResourceNotFoundException;
import com.routewise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class TripBookingService {

    private static final Logger log = LoggerFactory.getLogger(TripBookingService.class);

    private final TripRepository tripRepository;
    private final TripBookingRepository tripBookingRepository;
    private final HotelRepository hotelRepository;
    private final RestaurantRepository restaurantRepository;
    private final AttractionRepository attractionRepository;
    private final TripItemRepository tripItemRepository;
    private final BookingLinkBuilderService linkBuilderService;

    public TripBookingService(
            TripRepository tripRepository,
            TripBookingRepository tripBookingRepository,
            HotelRepository hotelRepository,
            RestaurantRepository restaurantRepository,
            AttractionRepository attractionRepository,
            TripItemRepository tripItemRepository,
            BookingLinkBuilderService linkBuilderService
    ) {
        this.tripRepository = tripRepository;
        this.tripBookingRepository = tripBookingRepository;
        this.hotelRepository = hotelRepository;
        this.restaurantRepository = restaurantRepository;
        this.attractionRepository = attractionRepository;
        this.tripItemRepository = tripItemRepository;
        this.linkBuilderService = linkBuilderService;
    }

    /**
     * Retrieves rich booking & contact details for a specific stop type and ID.
     */
    public BookingOptionDto getStopBookingOptions(
            String stopType,
            Long stopId,
            String cityName,
            String startDate,
            String endDate,
            Integer guests,
            String suggestedTime
    ) {
        String type = (stopType != null) ? stopType.toLowerCase().trim() : "hotel";
        BookingOptionDto dto = new BookingOptionDto();
        dto.setStopType(type);
        dto.setStopId(stopId);

        if ("hotel".equals(type)) {
            Hotel hotel = null;
            if (stopId != null) {
                hotel = hotelRepository.findById(stopId).orElse(null);
            }
            if (hotel == null) {
                // Fallback to first hotel in city if known
                List<Hotel> cityHotels = (cityName != null) ? hotelRepository.findAll() : Collections.emptyList();
                hotel = cityHotels.isEmpty() ? null : cityHotels.get(0);
            }

            if (hotel != null) {
                dto.setName(hotel.getName());
                dto.setCityName(hotel.getCity() != null ? hotel.getCity().getName() : cityName);
                dto.setPhone(hotel.getPhone());
                dto.setWebsiteUrl(hotel.getWebsiteUrl());
                dto.setMapsUrl(hotel.getMapsUrl());
                dto.setTicketInfo(hotel.getTicketInfo());
                dto.setPrice(hotel.getPricePerNight());
                dto.setRating(hotel.getRating() != null ? hotel.getRating().toString() : "4.5");
                dto.setOpeningHours("Standard Check-in: 14:00 | Check-out: 11:00");
                dto.setNotes(hotel.getAmenities());
                dto.setProviderLinks(linkBuilderService.buildHotelLinks(
                        hotel.getName(), dto.getCityName(), startDate, endDate, guests));
            } else {
                dto.setName("Accommodations");
                dto.setCityName(cityName);
                dto.setProviderLinks(linkBuilderService.buildHotelLinks("Hotel", cityName, startDate, endDate, guests));
            }

        } else if ("restaurant".equals(type) || "food".equals(type)) {
            Restaurant restaurant = null;
            if (stopId != null) {
                restaurant = restaurantRepository.findById(stopId).orElse(null);
            }

            if (restaurant != null) {
                dto.setName(restaurant.getName());
                dto.setCityName(restaurant.getCity() != null ? restaurant.getCity().getName() : cityName);
                dto.setPhone(restaurant.getPhone());
                dto.setWebsiteUrl(restaurant.getWebsiteUrl());
                dto.setMapsUrl(restaurant.getMapsUrl());
                dto.setTicketInfo(restaurant.getTicketInfo());
                dto.setPrice(restaurant.getAvgCostPerPerson());
                dto.setRating(restaurant.getRating() != null ? restaurant.getRating().toString() : "4.4");
                dto.setOpeningHours("Dining Hours: 07:30 - 22:30 (" + restaurant.getMealType() + ")");
                dto.setNotes(restaurant.getCuisine() + " • " + restaurant.getAddress());
                dto.setSuggestedReservationTime(suggestedTime != null ? suggestedTime : "Lunch: 13:00 / Dinner: 20:00");
                dto.setProviderLinks(linkBuilderService.buildRestaurantLinks(restaurant.getName(), dto.getCityName()));
            } else {
                dto.setName("Local Restaurant");
                dto.setCityName(cityName);
                dto.setProviderLinks(linkBuilderService.buildRestaurantLinks("Restaurant", cityName));
            }

        } else if ("attraction".equals(type) || "sightseeing".equals(type)) {
            Attraction attraction = null;
            if (stopId != null) {
                attraction = attractionRepository.findById(stopId).orElse(null);
            }

            if (attraction != null) {
                dto.setName(attraction.getName());
                dto.setCityName(attraction.getCity() != null ? attraction.getCity().getName() : cityName);
                dto.setPhone(attraction.getPhone());
                dto.setWebsiteUrl(attraction.getWebsiteUrl());
                dto.setMapsUrl(attraction.getMapsUrl());
                dto.setTicketInfo(attraction.getTicketInfo());
                dto.setPrice(attraction.getTicketPrice());
                dto.setRating(attraction.getRating() != null ? attraction.getRating().toString() : "4.5");
                dto.setOpeningHours(attraction.getOpeningTime() + " - " + attraction.getClosingTime());
                dto.setBestTimeToVisit(attraction.getBestTimeToVisit() != null ? attraction.getBestTimeToVisit() : "Morning or early evening");
                dto.setRules(attraction.getRules() != null ? attraction.getRules() : "Entry pass required; follow venue guidelines.");
                dto.setAccessibility(attraction.getAccessibility() != null ? attraction.getAccessibility() : "Wheelchair accessible pathways available.");
                dto.setNotes("Avg duration: " + attraction.getAvgVisitDurationMins() + " mins. " + attraction.getDescription());
                dto.setProviderLinks(linkBuilderService.buildAttractionLinks(attraction.getName(), dto.getCityName(), attraction.getBookingUrl()));
            } else {
                dto.setName("Tourist Attraction");
                dto.setCityName(cityName);
                dto.setProviderLinks(linkBuilderService.buildAttractionLinks("Attraction", cityName, null));
            }

        } else if ("transport".equals(type)) {
            dto.setName("Intercity Travel");
            dto.setCityName(cityName);
            dto.setPrice(BigDecimal.ZERO);
            dto.setNotes("RedBus & IRCTC booking options available");
            dto.setProviderLinks(linkBuilderService.buildTransportLinks("bus", cityName, "Destination", startDate));
        }

        return dto;
    }

    /**
     * Retrieves the entire Booking Checklist for a trip.
     * If the checklist is empty, initializes it from the trip's scheduled items and hotel.
     */
    @Transactional
    public List<TripBookingItemDto> getTripChecklist(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + tripId + " not found."));

        List<TripBooking> existingBookings = tripBookingRepository.findByTripIdOrderByIdAsc(tripId);

        if (existingBookings.isEmpty()) {
            populateInitialChecklist(trip);
            existingBookings = tripBookingRepository.findByTripIdOrderByIdAsc(tripId);
        }

        List<TripBookingItemDto> dtoList = new ArrayList<>();
        String cityName = trip.getDestinationCity() != null ? trip.getDestinationCity().getName() : "Destination";
        String startDateStr = trip.getStartDate() != null ? trip.getStartDate().toString() : "";
        String endDateStr = trip.getEndDate() != null ? trip.getEndDate().toString() : "";
        int travellers = trip.getNumTravellers() != null ? trip.getNumTravellers() : 2;

        for (TripBooking b : existingBookings) {
            TripBookingItemDto item = new TripBookingItemDto();
            item.setId(b.getId());
            item.setTripId(trip.getId());
            item.setStopType(b.getStopType());
            item.setStopId(b.getStopId());
            item.setStopName(b.getStopName());
            item.setStatus(b.getStatus());
            item.setReferenceNumber(b.getReferenceNumber());
            item.setNotes(b.getNotes());
            item.setUpdatedAt(b.getUpdatedAt());

            BookingOptionDto options = getStopBookingOptions(
                    b.getStopType(),
                    b.getStopId(),
                    cityName,
                    startDateStr,
                    endDateStr,
                    travellers,
                    null
            );
            if (options.getName() == null || options.getName().isBlank()) {
                options.setName(b.getStopName());
            }
            item.setBookingOptions(options);
            dtoList.add(item);
        }

        return dtoList;
    }

    /**
     * Updates the status, reference number, and notes for a specific stop on a trip.
     */
    @Transactional
    public TripBookingItemDto updateBookingStatus(Long tripId, Long stopId, BookingStatusUpdateRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + tripId + " not found."));

        String stopType = request.getStopType() != null ? request.getStopType().toLowerCase().trim() : "hotel";
        TripBooking booking = null;

        if (stopId != null && stopId > 0) {
            // First try matching by tripId and stopId
            Optional<TripBooking> byId = tripBookingRepository.findByTripIdAndStopTypeAndStopId(tripId, stopType, stopId);
            if (byId.isPresent()) {
                booking = byId.get();
            } else {
                // If stopId corresponds to trip_bookings.id itself
                Optional<TripBooking> byPrimaryId = tripBookingRepository.findById(stopId);
                if (byPrimaryId.isPresent() && byPrimaryId.get().getTrip().getId().equals(tripId)) {
                    booking = byPrimaryId.get();
                }
            }
        }

        if (booking == null && request.getStopName() != null) {
            booking = tripBookingRepository.findByTripIdAndStopTypeAndStopName(tripId, stopType, request.getStopName())
                    .orElse(null);
        }

        if (booking == null) {
            // Create a new booking item
            booking = new TripBooking();
            booking.setTrip(trip);
            booking.setStopType(stopType);
            booking.setStopId(stopId);
            booking.setStopName(request.getStopName() != null ? request.getStopName() : "Stop " + stopId);
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            booking.setStatus(request.getStatus().trim());
        }
        if (request.getReferenceNumber() != null) {
            booking.setReferenceNumber(request.getReferenceNumber().trim());
        }
        if (request.getNotes() != null) {
            booking.setNotes(request.getNotes().trim());
        }

        TripBooking saved = tripBookingRepository.save(booking);

        TripBookingItemDto dto = new TripBookingItemDto();
        dto.setId(saved.getId());
        dto.setTripId(trip.getId());
        dto.setStopType(saved.getStopType());
        dto.setStopId(saved.getStopId());
        dto.setStopName(saved.getStopName());
        dto.setStatus(saved.getStatus());
        dto.setReferenceNumber(saved.getReferenceNumber());
        dto.setNotes(saved.getNotes());
        dto.setUpdatedAt(saved.getUpdatedAt());

        BookingOptionDto options = getStopBookingOptions(
                saved.getStopType(),
                saved.getStopId(),
                trip.getDestinationCity() != null ? trip.getDestinationCity().getName() : "",
                trip.getStartDate() != null ? trip.getStartDate().toString() : "",
                trip.getEndDate() != null ? trip.getEndDate().toString() : "",
                trip.getNumTravellers(),
                null
        );
        dto.setBookingOptions(options);

        return dto;
    }

    private void populateInitialChecklist(Trip trip) {
        String destName = trip.getDestinationCity() != null ? trip.getDestinationCity().getName() : "Destination";
        String startName = trip.getStartCity() != null ? trip.getStartCity().getName() : "Origin";

        // 1. Intercity Transport Stop
        TripBooking transportBooking = new TripBooking();
        transportBooking.setTrip(trip);
        transportBooking.setStopType("transport");
        transportBooking.setStopId(null);
        transportBooking.setStopName(startName + " to " + destName + " (" + trip.getTransportMode().toUpperCase() + ")");
        transportBooking.setStatus("Not booked");
        transportBooking.setNotes("RedBus / IRCTC booking for " + trip.getNumTravellers() + " travellers");
        tripBookingRepository.save(transportBooking);

        // 2. Hotel Accommodation Stop
        // Check trip items for hotel
        List<TripItem> items = tripItemRepository.findByTripIdOrderByDayNumberAscItemOrderAsc(trip.getId());
        boolean hasHotel = false;

        for (TripItem it : items) {
            if ("hotel".equalsIgnoreCase(it.getItemType())) {
                TripBooking hb = new TripBooking();
                hb.setTrip(trip);
                hb.setStopType("hotel");
                hb.setStopId(it.getReferenceId());
                hb.setStopName(it.getTitle());
                hb.setStatus("Not booked");
                hb.setNotes(it.getDescription());
                tripBookingRepository.save(hb);
                hasHotel = true;
                break;
            }
        }

        if (!hasHotel) {
            // Find first hotel for destination city
            if (trip.getDestinationCity() != null) {
                List<Hotel> hotels = hotelRepository.findByCityId(trip.getDestinationCity().getId());
                if (!hotels.isEmpty()) {
                    Hotel h = hotels.get(0);
                    TripBooking hb = new TripBooking();
                    hb.setTrip(trip);
                    hb.setStopType("hotel");
                    hb.setStopId(h.getId());
                    hb.setStopName(h.getName());
                    hb.setStatus("Not booked");
                    hb.setNotes(h.getAmenities() != null ? h.getAmenities() : "Hotel Stay");
                    tripBookingRepository.save(hb);
                }
            }
        }

        // 3. Restaurants and Attractions from trip items
        Set<String> seen = new HashSet<>();
        for (TripItem it : items) {
            String itemType = (it.getItemType() != null) ? it.getItemType().toLowerCase() : "";
            if ("restaurant".equals(itemType) || "food".equals(itemType) || "attraction".equals(itemType) || "sightseeing".equals(itemType)) {
                String key = itemType + ":" + it.getTitle();
                if (!seen.contains(key)) {
                    seen.add(key);
                    TripBooking b = new TripBooking();
                    b.setTrip(trip);
                    b.setStopType(itemType.contains("food") || itemType.contains("rest") ? "restaurant" : "attraction");
                    b.setStopId(it.getReferenceId());
                    b.setStopName(it.getTitle());
                    b.setStatus("Not booked");
                    b.setNotes("Scheduled Day " + it.getDayNumber() + ": " + (it.getDescription() != null ? it.getDescription() : ""));
                    tripBookingRepository.save(b);
                }
            }
        }
    }
}
