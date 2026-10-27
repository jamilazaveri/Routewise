package com.routewise.controller;

import com.routewise.dto.BookingOptionDto;
import com.routewise.dto.BookingStatusUpdateRequest;
import com.routewise.dto.TripBookingItemDto;
import com.routewise.service.TripBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final TripBookingService bookingService;

    public BookingController(TripBookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Endpoint to fetch booking options, partner deep links, contact numbers, and guidelines for any stop.
     */
    @GetMapping("/stops/{type}/{id}/booking-options")
    public ResponseEntity<BookingOptionDto> getStopBookingOptions(
            @PathVariable String type,
            @PathVariable Long id,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false, defaultValue = "2") Integer guests,
            @RequestParam(required = false) String suggestedTime
    ) {
        BookingOptionDto options = bookingService.getStopBookingOptions(
                type, id, city, startDate, endDate, guests, suggestedTime);
        return ResponseEntity.ok(options);
    }

    /**
     * Endpoint to retrieve the Booking Checklist for a trip.
     */
    @GetMapping("/trips/{id}/bookings")
    public ResponseEntity<List<TripBookingItemDto>> getTripBookingChecklist(@PathVariable Long id) {
        List<TripBookingItemDto> checklist = bookingService.getTripChecklist(id);
        return ResponseEntity.ok(checklist);
    }

    /**
     * Endpoint to update booking status ('Not booked', 'Booked', 'Call pending'), reference number, and notes.
     */
    @PutMapping("/trips/{id}/bookings/{stopId}")
    public ResponseEntity<TripBookingItemDto> updateBooking(
            @PathVariable Long id,
            @PathVariable Long stopId,
            @RequestBody BookingStatusUpdateRequest request
    ) {
        TripBookingItemDto updated = bookingService.updateBookingStatus(id, stopId, request);
        return ResponseEntity.ok(updated);
    }
}
