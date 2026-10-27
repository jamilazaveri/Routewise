package com.routewise.controller;

import com.routewise.dto.*;
import com.routewise.entity.Trip;
import com.routewise.exception.ResourceNotFoundException;
import com.routewise.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    /**
     * Endpoint to generate a complete budget-optimized journey plan.
     */
    @PostMapping("/plan")
    public ResponseEntity<TripPlanResponse> planTrip(@Valid @RequestBody TripPlanRequest request) {
        TripPlanResponse response = tripService.planTrip(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Endpoint for dynamic budget re-allocation when category shares change.
     */
    @PostMapping("/reallocate")
    public ResponseEntity<ReallocateResponse> reallocateBudget(@Valid @RequestBody BudgetReallocateRequest request) {
        ReallocateResponse response = tripService.reallocateBudget(request);
        return ResponseEntity.ok(response);
    }

    /**
     * List all previously generated trips.
     */
    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    /**
     * Retrieve trip details by trip ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return tripService.getTripById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + id + " not found."));
    }

    /**
     * Plans multi-style ordered routes for a trip and stores them in MySQL.
     */
    @PostMapping("/routes")
    public ResponseEntity<MultiRoutePlanResponse> planTripRoutes(@RequestBody MultiRoutePlanRequest request) {
        Long tripId = request.getTripId();
        if (tripId == null) {
            // Find most recent trip or default to 1
            List<Trip> trips = tripService.getAllTrips();
            if (!trips.isEmpty()) {
                tripId = trips.get(0).getId();
                request.setTripId(tripId);
            } else {
                throw new ResourceNotFoundException("No trip found. Please generate a trip plan first.");
            }
        }
        MultiRoutePlanResponse response = tripService.planTripRoutes(tripId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieve all planned route options for a specific trip.
     */
    @GetMapping("/{id}/routes")
    public ResponseEntity<MultiRoutePlanResponse> getTripRoutes(@PathVariable Long id) {
        MultiRoutePlanResponse response = tripService.planTripRoutes(id, null);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieve a specific route type (fastest, shortest, cheapest, scenic, easiest) for a trip.
     */
    @GetMapping("/{id}/route/{type}")
    public ResponseEntity<MultiRoutePlanResponse.RouteDetailDto> getRouteByType(
            @PathVariable Long id,
            @PathVariable String type
    ) {
        MultiRoutePlanResponse.RouteDetailDto routeDetail = tripService.getRouteOptionByType(id, type);
        if (routeDetail == null) {
            throw new ResourceNotFoundException("Route type '" + type + "' not found for trip ID " + id);
        }
        return ResponseEntity.ok(routeDetail);
    }
}
