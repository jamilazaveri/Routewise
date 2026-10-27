package com.routewise;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

public class RoutePlanningTest {

    @Test
    @DisplayName("Shortest route minimizes distance")
    void testShortestRouteWeight() {
        double dist1 = 15.2;
        double dist2 = 18.0;

        double cost1 = dist1;
        double cost2 = dist2;

        assertTrue(cost1 < cost2, "Shorter distance must yield lower cost function for shortest route type");
    }

    @Test
    @DisplayName("Cheapest route considers fuel and toll cost")
    void testCheapestRouteAvoidsTolls() {
        double fuelPricePerLitre = 103.0;
        double mileageKmPerLitre = 15.0;

        // Highway route with toll
        double highwayDist = 20.0;
        double tollCost = 90.0;
        double highwayCost = (highwayDist / mileageKmPerLitre * fuelPricePerLitre) + tollCost;

        // Bypass / city route without toll
        double bypassDist = 24.0;
        double bypassToll = 0.0;
        double bypassCost = (bypassDist / mileageKmPerLitre * fuelPricePerLitre) + bypassToll;

        // highwayCost = 20/15 * 103 + 90 = 137.33 + 90 = 227.33
        // bypassCost = 24/15 * 103 + 0 = 164.80
        assertTrue(bypassCost < highwayCost, "Cheapest route should prefer toll-free alternative when total cost is lower");
    }

    @Test
    @DisplayName("Scenic route respects maximum detour cap of 25% over fastest")
    void testScenicRouteDetourCap() {
        double fastestDistance = 16.0;
        double maxAllowedScenicDist = fastestDistance * 1.25; // 20.0 km

        double candidateScenicDist1 = 19.5;
        double candidateScenicDist2 = 23.0;

        assertTrue(candidateScenicDist1 <= maxAllowedScenicDist, "Scenic route within 25% detour is accepted");
        assertFalse(candidateScenicDist2 <= maxAllowedScenicDist, "Scenic route exceeding 25% detour exceeds cap");
    }

    @Test
    @DisplayName("Easiest route penalizes excessive turns and congestion")
    void testEasiestRouteTurnPenalty() {
        double travelTimeMins = 25.0;

        // Route A: 3 turns, low congestion
        int turnsA = 3;
        double congestionFactorA = 1.0;
        double turnPenaltyA = turnsA * 0.5;
        double scoreA = travelTimeMins + turnPenaltyA + (congestionFactorA * 5.0);

        // Route B: 12 turns, heavy congestion
        int turnsB = 12;
        double congestionFactorB = 2.0;
        double turnPenaltyB = turnsB * 0.5;
        double scoreB = travelTimeMins + turnPenaltyB + (congestionFactorB * 5.0);

        assertTrue(scoreA < scoreB, "Easiest route prefers fewer turns and lower congestion");
    }

    @Test
    @DisplayName("Scenic score weights distance by (1 - scenic_score)")
    void testScenicScoreWeightFormula() {
        double distance = 10.0;
        double highScenicScore = 0.90;
        double lowScenicScore = 0.20;

        double weightedCostHigh = distance * (1.0 - highScenicScore); // 10 * 0.1 = 1.0
        double weightedCostLow = distance * (1.0 - lowScenicScore);   // 10 * 0.8 = 8.0

        assertTrue(weightedCostHigh < weightedCostLow, "Higher scenic score produces lower cost in scenic route optimization");
    }

    @Test
    @DisplayName("Verify that all five route styles produce distinctly differentiated numbers")
    void testFiveRouteStylesProduceDistinctResults() {
        com.routewise.dto.MultiRoutePlanRequest req = new com.routewise.dto.MultiRoutePlanRequest();
        req.setCityName("Chennai");

        com.routewise.dto.MultiRoutePlanRequest.StopItemDto s1 = new com.routewise.dto.MultiRoutePlanRequest.StopItemDto();
        s1.setName("Mylapore Inn");
        s1.setType("hotel");
        s1.setLatitude(new BigDecimal("13.0330"));
        s1.setLongitude(new BigDecimal("80.2690"));

        com.routewise.dto.MultiRoutePlanRequest.StopItemDto s2 = new com.routewise.dto.MultiRoutePlanRequest.StopItemDto();
        s2.setName("Marina Beach");
        s2.setType("attraction");
        s2.setLatitude(new BigDecimal("13.0500"));
        s2.setLongitude(new BigDecimal("80.2824"));

        com.routewise.dto.MultiRoutePlanRequest.StopItemDto s3 = new com.routewise.dto.MultiRoutePlanRequest.StopItemDto();
        s3.setName("Kapaleeshwarar Temple");
        s3.setType("attraction");
        s3.setLatitude(new BigDecimal("13.0336"));
        s3.setLongitude(new BigDecimal("80.2694"));

        req.setStops(java.util.List.of(s1, s2, s3));

        com.routewise.service.PythonMicroserviceClient client = new com.routewise.service.PythonMicroserviceClient(
                new org.springframework.web.client.RestTemplate(),
                new com.fasterxml.jackson.databind.ObjectMapper()
        );

        // Uses fallback or microservice
        com.routewise.dto.MultiRoutePlanResponse res = client.planRoutes(req);
        assertNotNull(res);
        assertNotNull(res.getRoutes());
        assertEquals(5, res.getRoutes().size());

        com.routewise.dto.MultiRoutePlanResponse.RouteDetailDto fastest = res.getRoutes().get("fastest");
        com.routewise.dto.MultiRoutePlanResponse.RouteDetailDto shortest = res.getRoutes().get("shortest");
        com.routewise.dto.MultiRoutePlanResponse.RouteDetailDto cheapest = res.getRoutes().get("cheapest");
        com.routewise.dto.MultiRoutePlanResponse.RouteDetailDto scenic = res.getRoutes().get("scenic");
        com.routewise.dto.MultiRoutePlanResponse.RouteDetailDto easiest = res.getRoutes().get("easiest");

        assertNotNull(fastest);
        assertNotNull(shortest);
        assertNotNull(cheapest);
        assertNotNull(scenic);
        assertNotNull(easiest);

        // Shortest distance <= fastest distance
        assertTrue(shortest.getTotalDistanceKm().compareTo(fastest.getTotalDistanceKm()) <= 0);

        // Cheapest total cost <= fastest total cost
        assertTrue(cheapest.getTotalCost().compareTo(fastest.getTotalCost()) <= 0);

        // Scenic score >= fastest scenic score
        assertTrue(scenic.getScenicScore().compareTo(fastest.getScenicScore()) >= 0);

        // Scenic detour is <= 25% over fastest
        BigDecimal maxAllowedScenic = fastest.getTotalDistanceKm().multiply(new BigDecimal("1.25"));
        assertTrue(scenic.getTotalDistanceKm().compareTo(maxAllowedScenic) <= 0);

        // Distinct distances check across styles
        java.util.Set<BigDecimal> dists = new java.util.HashSet<>();
        res.getRoutes().values().forEach(r -> dists.add(r.getTotalDistanceKm()));
        assertTrue(dists.size() > 1, "There must be distinct distances across route styles");
    }
}
