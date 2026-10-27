"""
Scoring and Ranking logic for Routewise.
Combines user rating and price competitiveness into a balanced composite score.
"""

from typing import List
import math
from models import (
    HotelCandidate, RankedHotel,
    RestaurantCandidate, RankedRestaurant,
    AttractionCandidate, RankedAttraction
)


def calculate_rooms_needed(num_travellers: int) -> int:
    """Standard rule: 2 adults per hotel room, ceiling division."""
    return max(1, math.ceil(num_travellers / 2.0))


def rank_hotels(
    hotels: List[HotelCandidate],
    budget_limit: float = None,
    num_travellers: int = 1,
    num_nights: int = 1
) -> List[RankedHotel]:
    """
    Ranks hotels by balancing rating (65% weight) and price value (35% weight).
    Applies penalty if total stay exceeds the target accommodation budget.
    """
    if not hotels:
        return []

    rooms = calculate_rooms_needed(num_travellers)
    prices = [h.price_per_night for h in hotels]
    min_price = min(prices)
    max_price = max(prices)
    spread = max(1.0, max_price - min_price)

    ranked_list: List[RankedHotel] = []

    for h in hotels:
        total_hotel_cost = h.price_per_night * rooms * num_nights
        fits = True
        if budget_limit is not None and total_hotel_cost > budget_limit:
            fits = False

        norm_rating = max(0.0, min(1.0, h.rating / 5.0))
        norm_price = 1.0 - ((h.price_per_night - min_price) / spread)

        # Base composite score 0 to 100
        score = (0.65 * norm_rating + 0.35 * norm_price) * 100.0

        if fits:
            score += 10.0  # Budget adherence bonus
        else:
            # Over budget penalty
            overage_ratio = (total_hotel_cost - budget_limit) / (budget_limit + 1.0) if budget_limit else 0
            score -= min(40.0, overage_ratio * 30.0)

        ranked_list.append(
            RankedHotel(
                hotel=h,
                score=round(max(0.0, score), 2),
                rooms_needed=rooms,
                total_hotel_cost=round(total_hotel_cost, 2),
                fits_budget=fits
            )
        )

    # Sort descending by score, tie-break with lower price
    ranked_list.sort(key=lambda x: (x.score, -x.hotel.price_per_night), reverse=True)
    return ranked_list


def rank_restaurants(
    restaurants: List[RestaurantCandidate],
    meal_budget_per_person: float = None
) -> List[RankedRestaurant]:
    """
    Ranks restaurants balancing rating (60% weight) and affordable cost (40% weight).
    """
    if not restaurants:
        return []

    costs = [r.avg_cost_per_person for r in restaurants]
    min_cost = min(costs)
    max_cost = max(costs)
    spread = max(1.0, max_cost - min_cost)

    ranked_list: List[RankedRestaurant] = []

    for r in restaurants:
        fits = True
        if meal_budget_per_person is not None and r.avg_cost_per_person > meal_budget_per_person:
            fits = False

        norm_rating = max(0.0, min(1.0, r.rating / 5.0))
        norm_cost = 1.0 - ((r.avg_cost_per_person - min_cost) / spread)

        score = (0.60 * norm_rating + 0.40 * norm_cost) * 100.0

        if fits:
            score += 10.0
        else:
            score -= 20.0

        ranked_list.append(
            RankedRestaurant(
                restaurant=r,
                score=round(max(0.0, score), 2),
                fits_budget=fits
            )
        )

    ranked_list.sort(key=lambda x: (x.score, -x.restaurant.avg_cost_per_person), reverse=True)
    return ranked_list


def rank_attractions(
    attractions: List[AttractionCandidate],
    sightseeing_budget: float = None,
    num_travellers: int = 1
) -> List[RankedAttraction]:
    """
    Ranks tourist attractions prioritizing rating (70% weight) and low ticket price (30% weight).
    """
    if not attractions:
        return []

    prices = [a.ticket_price for a in attractions]
    min_p = min(prices)
    max_p = max(prices)
    spread = max(1.0, max_p - min_p)

    ranked_list: List[RankedAttraction] = []

    for a in attractions:
        total_ticket = a.ticket_price * num_travellers
        fits = True
        if sightseeing_budget is not None and total_ticket > sightseeing_budget:
            fits = False

        norm_rating = max(0.0, min(1.0, a.rating / 5.0))
        norm_price = 1.0 - ((a.ticket_price - min_p) / spread)

        score = (0.70 * norm_rating + 0.30 * norm_price) * 100.0

        if a.ticket_price == 0:
            score += 15.0  # Free attraction bonus for budget travelers

        if fits:
            score += 5.0
        else:
            score -= 15.0

        ranked_list.append(
            RankedAttraction(
                attraction=a,
                score=round(max(0.0, score), 2),
                total_ticket_cost=round(total_ticket, 2),
                fits_budget=fits
            )
        )

    ranked_list.sort(key=lambda x: (x.score, -x.attraction.ticket_price), reverse=True)
    return ranked_list
