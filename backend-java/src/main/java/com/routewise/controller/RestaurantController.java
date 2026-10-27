package com.routewise.controller;

import com.routewise.entity.Restaurant;
import com.routewise.service.RestaurantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants(
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) BigDecimal maxCost
    ) {
        if (cityId != null && maxCost != null) {
            return ResponseEntity.ok(restaurantService.getRestaurantsByCityAndMaxCost(cityId, maxCost));
        } else if (cityId != null) {
            return ResponseEntity.ok(restaurantService.getRestaurantsByCity(cityId));
        }
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(restaurantService.getRestaurantsByCity(cityId));
    }
}
