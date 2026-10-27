package com.routewise.repository;

import com.routewise.entity.RouteSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteSegmentRepository extends JpaRepository<RouteSegment, Long> {
    List<RouteSegment> findByCityId(Long cityId);
    Optional<RouteSegment> findByCityIdAndFromNameAndToName(Long cityId, String fromName, String toName);
}
