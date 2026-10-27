package com.routewise.repository;

import com.routewise.entity.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, Long> {
    List<Attraction> findByCityId(Long cityId);
    List<Attraction> findByCityIdAndTicketPriceLessThanEqual(Long cityId, BigDecimal maxTicketPrice);
}
