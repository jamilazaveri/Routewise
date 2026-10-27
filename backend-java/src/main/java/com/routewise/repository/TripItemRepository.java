package com.routewise.repository;

import com.routewise.entity.TripItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripItemRepository extends JpaRepository<TripItem, Long> {
    List<TripItem> findByTripIdOrderByDayNumberAscItemOrderAsc(Long tripId);
}
