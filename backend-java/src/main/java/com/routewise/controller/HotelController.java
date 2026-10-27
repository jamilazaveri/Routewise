package com.routewise.controller;

import com.routewise.entity.Hotel;
import com.routewise.service.HotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels(
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        if (cityId != null && maxPrice != null) {
            return ResponseEntity.ok(hotelService.getHotelsByCityAndMaxPrice(cityId, maxPrice));
        } else if (cityId != null) {
            return ResponseEntity.ok(hotelService.getHotelsByCity(cityId));
        }
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<Hotel>> getHotelsByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(hotelService.getHotelsByCity(cityId));
    }
}
