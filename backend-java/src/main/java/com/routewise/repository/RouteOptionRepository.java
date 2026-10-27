package com.routewise.repository;

import com.routewise.entity.RouteOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteOptionRepository extends JpaRepository<RouteOption, Long> {
    List<RouteOption> findByTripId(Long tripId);
    Optional<RouteOption> findByTripIdAndRouteType(Long tripId, String routeType);
    void deleteByTripId(Long tripId);
}
