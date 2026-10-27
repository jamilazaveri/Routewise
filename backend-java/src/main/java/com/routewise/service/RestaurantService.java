package com.routewise.service;

import com.routewise.entity.Restaurant;
import com.routewise.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public List<Restaurant> getRestaurantsByCity(Long cityId) {
        return restaurantRepository.findByCityId(cityId);
    }

    public List<Restaurant> getRestaurantsByCityAndMaxCost(Long cityId, BigDecimal maxCost) {
        return restaurantRepository.findByCityIdAndAvgCostPerPersonLessThanEqual(cityId, maxCost);
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
}
