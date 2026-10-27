package com.routewise.repository;

import com.routewise.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByCityId(Long cityId);
    List<Restaurant> findByCityIdAndAvgCostPerPersonLessThanEqual(Long cityId, BigDecimal maxCost);
}
