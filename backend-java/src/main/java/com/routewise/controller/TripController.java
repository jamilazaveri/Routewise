package com.routewise.controller;

import com.routewise.dto.BudgetReallocateRequest;
import com.routewise.dto.ReallocateResponse;
import com.routewise.dto.TripPlanRequest;
import com.routewise.dto.TripPlanResponse;
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
}
