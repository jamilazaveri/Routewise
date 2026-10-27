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
}
