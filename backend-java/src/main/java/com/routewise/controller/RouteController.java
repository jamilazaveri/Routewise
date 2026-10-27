package com.routewise.controller;

import com.routewise.entity.Route;
import com.routewise.repository.RouteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteRepository routeRepository;

    public RouteController(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeRepository.findAll());
    }

    @GetMapping("/between")
    public ResponseEntity<Route> getRouteBetween(
            @RequestParam Long originCityId,
            @RequestParam Long destinationCityId
    ) {
        return routeRepository.findByOriginCityIdAndDestinationCityId(originCityId, destinationCityId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
