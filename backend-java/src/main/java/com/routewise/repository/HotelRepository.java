package com.routewise.repository;

import com.routewise.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByCityId(Long cityId);
    List<Hotel> findByCityIdAndPricePerNightLessThanEqual(Long cityId, BigDecimal maxPrice);
    List<Hotel> findByCityIdAndTier(Long cityId, String tier);
}
