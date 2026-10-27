package com.routewise.controller;

import com.routewise.entity.Attraction;
import com.routewise.service.AttractionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/attractions")
public class AttractionController {

    private final AttractionService attractionService;

    public AttractionController(AttractionService attractionService) {
        this.attractionService = attractionService;
    }

    @GetMapping
    public ResponseEntity<List<Attraction>> getAllAttractions(
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        if (cityId != null && maxPrice != null) {
            return ResponseEntity.ok(attractionService.getAttractionsByCityAndMaxPrice(cityId, maxPrice));
        } else if (cityId != null) {
            return ResponseEntity.ok(attractionService.getAttractionsByCity(cityId));
        }
        return ResponseEntity.ok(attractionService.getAllAttractions());
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<Attraction>> getAttractionsByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(attractionService.getAttractionsByCity(cityId));
    }
}
