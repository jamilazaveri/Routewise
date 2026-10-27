package com.routewise;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

public class BudgetLogicTest {

    @Test
    @DisplayName("Test hotel rooms required based on traveller count")
    void testRoomsNeeded() {
        assertEquals(1, calculateRooms(1));
        assertEquals(1, calculateRooms(2));
        assertEquals(2, calculateRooms(3));
        assertEquals(2, calculateRooms(4));
        assertEquals(3, calculateRooms(5));
    }

    private int calculateRooms(int travellers) {
        return (int) Math.ceil(travellers / 2.0);
    }

    @Test
    @DisplayName("Test category budget distribution sums to total budget")
    void testCategoryBudgetShares() {
        BigDecimal totalBudget = new BigDecimal("25000.00");
        BigDecimal shareAcc = new BigDecimal("35.00");
        BigDecimal shareFood = new BigDecimal("25.00");
        BigDecimal shareTrans = new BigDecimal("20.00");
        BigDecimal shareSight = new BigDecimal("20.00");

        BigDecimal accBudget = totalBudget.multiply(shareAcc).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal foodBudget = totalBudget.multiply(shareFood).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal transBudget = totalBudget.multiply(shareTrans).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal sightBudget = totalBudget.multiply(shareSight).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        assertEquals(new BigDecimal("8750.00"), accBudget);
        assertEquals(new BigDecimal("6250.00"), foodBudget);
        assertEquals(new BigDecimal("5000.00"), transBudget);
        assertEquals(new BigDecimal("5000.00"), sightBudget);

        BigDecimal sum = accBudget.add(foodBudget).add(transBudget).add(sightBudget);
        assertEquals(totalBudget, sum);
    }

    @Test
    @DisplayName("Test fuel calculation formula: distance / mileage * fuelPrice")
    void testFuelCalculation() {
        double oneWayDistance = 346.0;
        double roundTripDistance = oneWayDistance * 2.0; // 692 km
        double carMileage = 15.0; // km per litre
        double fuelPrice = 103.0; // INR per litre

        double fuelLitres = roundTripDistance / carMileage;
        double expectedFuelCost = Math.round((fuelLitres * fuelPrice) * 100.0) / 100.0;

        assertEquals(4751.73, expectedFuelCost, 0.05);

        double tollOneWay = 385.0;
        double totalToll = tollOneWay * 2.0; // 770.0
        double totalTransport = expectedFuelCost + totalToll;

        assertEquals(5521.73, totalTransport, 0.05);
    }

    @Test
    @DisplayName("Test budget feasibility check flags deficit")
    void testFeasibilityFlag() {
        BigDecimal budgetMax = new BigDecimal("5000.00");
        BigDecimal totalExpenses = new BigDecimal("7500.00");

        boolean isFeasible = totalExpenses.compareTo(budgetMax) <= 0;
        assertFalse(isFeasible, "Total expenses exceed max budget, should be marked infeasible");

        BigDecimal amountLeft = budgetMax.subtract(totalExpenses);
        assertTrue(amountLeft.compareTo(BigDecimal.ZERO) < 0);
        assertEquals(new BigDecimal("-2500.00"), amountLeft);
    }

    @Test
    @DisplayName("Test budget re-allocation redistribution")
    void testBudgetReallocation() {
        // User changes accommodation from 35% to 20%
        double newAccShare = 20.0;
        double remainingNeeded = 100.0 - newAccShare; // 80%

        double oldFood = 25.0;
        double oldTrans = 20.0;
        double oldSight = 20.0;
        double otherOldSum = oldFood + oldTrans + oldSight; // 65%

        double newFood = Math.round((oldFood * remainingNeeded / otherOldSum) * 100.0) / 100.0;
        double newTrans = Math.round((oldTrans * remainingNeeded / otherOldSum) * 100.0) / 100.0;
        double newSight = Math.round((oldSight * remainingNeeded / otherOldSum) * 100.0) / 100.0;

        double totalNew = newAccShare + newFood + newTrans + newSight;
        assertEquals(100.0, totalNew, 0.5);
    }
}
