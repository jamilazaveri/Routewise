package com.routewise.repository;

import com.routewise.entity.BookingLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingLinkRepository extends JpaRepository<BookingLink, Long> {
    List<BookingLink> findByStopType(String stopType);
    Optional<BookingLink> findByStopTypeAndProvider(String stopType, String provider);
    Optional<BookingLink> findByStopTypeAndStopIdAndProvider(String stopType, Long stopId, String provider);
    List<BookingLink> findByStopTypeAndStopId(String stopType, Long stopId);
}
