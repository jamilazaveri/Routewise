"""
Unit tests for the Routewise Python Microservice.
Verifies cost estimation formulas, scoring/ranking, budget reallocation, and feasibility logic.
"""

import unittest
from optimizer import calculate_transport_costs, optimize_trip
from scoring import rank_hotels, rank_restaurants, rank_attractions, calculate_rooms_needed
from models import (
    HotelCandidate, RestaurantCandidate, AttractionCandidate,
    TripOptimizationRequest, BudgetShares, ReallocateBudgetRequest
)
from main import reallocate_budget


class RoutewiseMicroserviceTests(unittest.TestCase):

    def test_transport_cost_car(self):
        distance = 346.0
        toll = 385.0
        fuel, tolls, tickets, total, notes = calculate_transport_costs(
            mode="car",
            distance_km=distance,
            toll_cost_one_way=toll,
            num_travellers=2,
            is_round_trip=True
        )

        total_km = distance * 2.0  # 692 km
        expected_litres = total_km / 15.0  # 46.133 L
        expected_fuel = round(expected_litres * 103.0, 2)
        expected_tolls = toll * 2.0

        self.assertEqual(fuel, expected_fuel)
        self.assertEqual(tolls, expected_tolls)
        self.assertEqual(total, round(expected_fuel + expected_tolls, 2))
        self.assertEqual(tickets, 0.0)

    def test_transport_cost_bike_exempt_tolls(self):
        fuel, tolls, tickets, total, _ = calculate_transport_costs(
            mode="bike",
            distance_km=100.0,
            toll_cost_one_way=150.0,
            num_travellers=1,
            is_round_trip=True
        )
        self.assertEqual(fuel, 515.0)
        self.assertEqual(tolls, 0.0)
        self.assertEqual(total, 515.0)

    def test_rooms_needed_calculation(self):
        self.assertEqual(calculate_rooms_needed(1), 1)
        self.assertEqual(calculate_rooms_needed(2), 1)
        self.assertEqual(calculate_rooms_needed(3), 2)
        self.assertEqual(calculate_rooms_needed(4), 2)
        self.assertEqual(calculate_rooms_needed(5), 3)

    def test_hotel_ranking(self):
        hotels = [
            HotelCandidate(id=1, name="Budget Stay", price_per_night=1000.0, rating=4.2),
            HotelCandidate(id=2, name="Luxury Palace", price_per_night=9000.0, rating=4.8),
            HotelCandidate(id=3, name="Mid Comfort", price_per_night=3000.0, rating=4.5)
        ]
        ranked = rank_hotels(hotels, budget_limit=3500.0, num_travellers=2, num_nights=1)
        self.assertEqual(len(ranked), 3)
        self.assertTrue(ranked[0].fits_budget)
        luxury = next(r for r in ranked if r.hotel.id == 2)
        self.assertFalse(luxury.fits_budget)

    def test_budget_reallocation_logic(self):
        req = ReallocateBudgetRequest(
            changed_category="accommodation",
            new_share=20.0,
            current_shares=BudgetShares(
                accommodation=35.0,
                food=25.0,
                transport=20.0,
                sightseeing=20.0
            ),
            total_budget_max=20000.0
        )
        res = reallocate_budget(req)
        new_shares = res.new_shares

        self.assertEqual(new_shares.accommodation, 20.0)
        total_share = (
            new_shares.accommodation +
            new_shares.food +
            new_shares.transport +
            new_shares.sightseeing
        )
        self.assertAlmostEqual(total_share, 100.0, places=1)
        cat_budgets = res.category_budgets
        self.assertAlmostEqual(sum(cat_budgets.values()), 20000.0, delta=1.0)

    def test_trip_optimization_feasibility(self):
        hotels = [
            HotelCandidate(id=1, name="Budget Inn", price_per_night=900.0, rating=4.2),
            HotelCandidate(id=2, name="Grand Hotel", price_per_night=4500.0, rating=4.7)
        ]
        restaurants = [
            RestaurantCandidate(id=1, name="Dosa Point", cuisine="South Indian", avg_cost_per_person=150.0, rating=4.5),
            RestaurantCandidate(id=2, name="Fine Dining", cuisine="Continental", avg_cost_per_person=800.0, rating=4.6)
        ]
        attractions = [
            AttractionCandidate(id=1, name="City Beach", category="Beach", ticket_price=0.0, rating=4.7),
            AttractionCandidate(id=2, name="Museum", category="Museum", ticket_price=50.0, rating=4.3)
        ]

        # Feasible Trip
        req_ok = TripOptimizationRequest(
            start_city="Chennai",
            destination_city="Pondicherry",
            num_days=2,
            num_travellers=2,
            transport_mode="car",
            total_budget_min=15000.0,
            total_budget_max=20000.0,
            route_distance_km=151.0,
            route_toll_cost=115.0,
            hotels=hotels,
            restaurants=restaurants,
            attractions=attractions
        )
        res_ok = optimize_trip(req_ok)
        self.assertTrue(res_ok.is_feasible)
        self.assertGreaterEqual(res_ok.cost_breakdown.amount_left, 0)
        self.assertEqual(len(res_ok.itinerary), 2)

        # Infeasible Trip with too low budget
        req_low = TripOptimizationRequest(
            start_city="Chennai",
            destination_city="Pondicherry",
            num_days=2,
            num_travellers=2,
            transport_mode="car",
            total_budget_min=1000.0,
            total_budget_max=1500.0,
            route_distance_km=151.0,
            route_toll_cost=115.0,
            hotels=hotels,
            restaurants=restaurants,
            attractions=attractions
        )
        res_low = optimize_trip(req_low)
        self.assertFalse(res_low.is_feasible)
        self.assertIsNotNone(res_low.cheapest_alternative)
        self.assertGreater(res_low.cheapest_alternative.suggested_budget, 1500.0)


if __name__ == '__main__':
    unittest.main()
