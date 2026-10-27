package com.routewise.repository;

import com.routewise.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByOrderByCreatedAtDesc();
    Optional<Trip> findByTripHash(String tripHash);
}
