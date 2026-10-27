package com.routewise.repository;

import com.routewise.entity.RouteLeg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteLegRepository extends JpaRepository<RouteLeg, Long> {
    List<RouteLeg> findByRouteOptionIdOrderBySeqAsc(Long routeOptionId);
}
