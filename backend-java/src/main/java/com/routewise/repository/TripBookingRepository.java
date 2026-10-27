package com.routewise.repository;

import com.routewise.entity.TripBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripBookingRepository extends JpaRepository<TripBooking, Long> {
    List<TripBooking> findByTripIdOrderByIdAsc(Long tripId);
    Optional<TripBooking> findByTripIdAndStopTypeAndStopId(Long tripId, String stopType, Long stopId);
    Optional<TripBooking> findByTripIdAndStopTypeAndStopName(Long tripId, String stopType, String stopName);
    void deleteByTripId(Long tripId);
}
