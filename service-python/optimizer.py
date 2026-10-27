"""
Greedy Budget-Fitting, Cost Optimization, and Day-by-Day Itinerary Planner.
"""

from typing import List, Dict, Tuple, Optional
import math
from models import (
    TripOptimizationRequest, TripOptimizationResponse,
    CostBreakdown, CheapestFeasibleAlternative,
    DayPlan, DayPlanItem, HotelCandidate, RestaurantCandidate,
    AttractionCandidate, TransportCostRequest, TransportCostResponse
)
from scoring import rank_hotels, rank_restaurants, rank_attractions, calculate_rooms_needed


DEFAULT_FUEL_PRICE_INR = 103.0  # Petrol in Tamil Nadu / Karnataka
CAR_MILEAGE_KM_PER_L = 15.0
BIKE_MILEAGE_KM_PER_L = 40.0
BUS_FARE_PER_KM_INR = 1.80
TRAIN_FARE_PER_KM_INR = 1.25


def calculate_transport_costs(
    mode: str,
    distance_km: float,
    toll_cost_one_way: float,
    num_travellers: int,
    is_round_trip: bool = True
) -> Tuple[float, float, float, float, str]:
    """
    Returns (fuel_cost, toll_cost, ticket_cost, total_transport, explanation).
    """
    mode = mode.lower().strip()
    trip_multiplier = 2.0 if is_round_trip else 1.0
    total_km = distance_km * trip_multiplier

    if mode == "car":
        fuel_litres = total_km / CAR_MILEAGE_KM_PER_L
        fuel = round(fuel_litres * DEFAULT_FUEL_PRICE_INR, 2)
        tolls = round(toll_cost_one_way * trip_multiplier, 2)
        tickets = 0.0
        total = round(fuel + tolls, 2)
        notes = f"Car: {total_km:.1f} km round-trip @ {CAR_MILEAGE_KM_PER_L} km/l, ₹{DEFAULT_FUEL_PRICE_INR}/L fuel (₹{fuel}) + tolls (₹{tolls})"

    elif mode == "bike":
        fuel_litres = total_km / BIKE_MILEAGE_KM_PER_L
        fuel = round(fuel_litres * DEFAULT_FUEL_PRICE_INR, 2)
        tolls = 0.0  # 2-wheelers exempt on most NHAI highways
        tickets = 0.0
        total = round(fuel, 2)
        notes = f"Motorcycle: {total_km:.1f} km round-trip @ {BIKE_MILEAGE_KM_PER_L} km/l, ₹{DEFAULT_FUEL_PRICE_INR}/L fuel (₹{fuel}), no toll fees"

    elif mode == "bus":
        fuel = 0.0
        tolls = 0.0
        tickets = round(total_km * BUS_FARE_PER_KM_INR * num_travellers, 2)
        total = tickets
        notes = f"Express Bus: {num_travellers} traveller(s) @ ₹{BUS_FARE_PER_KM_INR}/km round-trip"

    elif mode == "train":
        fuel = 0.0
        tolls = 0.0
        tickets = round(total_km * TRAIN_FARE_PER_KM_INR * num_travellers, 2)
        total = tickets
        notes = f"Superfast / Express Train: {num_travellers} traveller(s) @ ₹{TRAIN_FARE_PER_KM_INR}/km round-trip"

    else:
        # Default fallback to car
        fuel = round((total_km / CAR_MILEAGE_KM_PER_L) * DEFAULT_FUEL_PRICE_INR, 2)
        tolls = round(toll_cost_one_way * trip_multiplier, 2)
        tickets = 0.0
        total = round(fuel + tolls, 2)
        notes = f"Standard vehicle transport: ₹{total}"

    return fuel, tolls, tickets, total, notes


def optimize_trip(req: TripOptimizationRequest) -> TripOptimizationResponse:
    """
    Core greedy budget-fitting algorithm:
    1. Allocate category limits based on user budget shares.
    2. Compute transport expense (fuel + tolls or tickets).
    3. Greedily pick the best hotel within accommodation limit (or cheapest if tight).
    4. Greedily allocate daily meals within food share.
    5. Rank and slot attractions into day-by-day plan within sightseeing limit.
    6. Compute totals, buffer, and feasibility alternative if over-budget.
    """
    total_budget_max = req.total_budget_max
    num_days = req.num_days
    num_nights = max(1, num_days - 1)
    travellers = req.num_travellers
    rooms = calculate_rooms_needed(travellers)

    # Category budget caps in INR
    cat_budgets = {
        "accommodation": round(total_budget_max * (req.shares.accommodation / 100.0), 2),
        "food": round(total_budget_max * (req.shares.food / 100.0), 2),
        "transport": round(total_budget_max * (req.shares.transport / 100.0), 2),
        "sightseeing": round(total_budget_max * (req.shares.sightseeing / 100.0), 2)
    }

    # 1. Transport Cost
    fuel_cost, toll_cost, ticket_cost, total_transport, transport_notes = calculate_transport_costs(
        mode=req.transport_mode,
        distance_km=req.route_distance_km,
        toll_cost_one_way=req.route_toll_cost,
        num_travellers=travellers,
        is_round_trip=True
    )

    # 2. Hotel Selection (Greedy based on score and budget limit)
    ranked_hotels = rank_hotels(
        hotels=req.hotels,
        budget_limit=cat_budgets["accommodation"],
        num_travellers=travellers,
        num_nights=num_nights
    )

    selected_hotel: Optional[HotelCandidate] = None
    actual_hotel_cost = 0.0

    # Look for highest scoring hotel that fits within budget
    fitting_hotels = [rh for rh in ranked_hotels if rh.fits_budget]
    if fitting_hotels:
        selected_hotel = fitting_hotels[0].hotel
        actual_hotel_cost = fitting_hotels[0].total_hotel_cost
    elif ranked_hotels:
        # None fits: choose the absolute cheapest available hotel
        cheapest_h = min(ranked_hotels, key=lambda x: x.hotel.price_per_night)
        selected_hotel = cheapest_h.hotel
        actual_hotel_cost = cheapest_h.total_hotel_cost

    # 3. Restaurant Selection
    # Total meals = num_days * 3 (breakfast, lunch, dinner)
    total_meals_count = num_days * 3
    target_meal_cost_per_person = cat_budgets["food"] / max(1, (total_meals_count * travellers))

    ranked_restaurants = rank_restaurants(
        restaurants=req.restaurants,
        meal_budget_per_person=target_meal_cost_per_person
    )

    # Pick up to 5 top diverse restaurants for the itinerary
    selected_restaurants: List[RestaurantCandidate] = []
    if ranked_restaurants:
        # Sort candidates that fit budget first, then by score
        sorted_rest = sorted(ranked_restaurants, key=lambda r: (r.fits_budget, r.score), reverse=True)
        selected_restaurants = [sr.restaurant for sr in sorted_rest[:min(5, len(sorted_rest))]]

    # Compute realistic total food cost based on selected or average realistic meal
    avg_selected_meal_cost = (
        sum(r.avg_cost_per_person for r in selected_restaurants) / len(selected_restaurants)
        if selected_restaurants else max(150.0, target_meal_cost_per_person)
    )
    actual_food_cost = round(avg_selected_meal_cost * total_meals_count * travellers, 2)

    # 4. Attraction Selection & Greedy Day Slotting
    ranked_attractions = rank_attractions(
        attractions=req.attractions,
        sightseeing_budget=cat_budgets["sightseeing"],
        num_travellers=travellers
    )

    selected_attractions: List[AttractionCandidate] = []
    actual_sightseeing_cost = 0.0
    # Allow at most 3 attractions per day for a sensible relaxed itinerary
    max_attractions_to_pick = min(len(ranked_attractions), num_days * 3)

    for ra in ranked_attractions:
        if len(selected_attractions) >= max_attractions_to_pick:
            break
        ticket_for_group = ra.attraction.ticket_price * travellers
        # Greedily pick if within remaining sightseeing budget OR if it's free
        if (actual_sightseeing_cost + ticket_for_group <= cat_budgets["sightseeing"]) or ra.attraction.ticket_price == 0:
            selected_attractions.append(ra.attraction)
            actual_sightseeing_cost += ticket_for_group

    # If user budget was very tight and didn't even get at least 1 attraction per day,
    # include free or minimal attractions
    if len(selected_attractions) < num_days:
        for ra in ranked_attractions:
            if ra.attraction not in selected_attractions and ra.attraction.ticket_price == 0:
                selected_attractions.append(ra.attraction)
                if len(selected_attractions) >= num_days:
                    break

    # 5. Build Day-by-Day Itinerary Plan
    itinerary = generate_day_by_day_plan(
        num_days=num_days,
        start_city=req.start_city,
        destination_city=req.destination_city,
        selected_hotel=selected_hotel,
        selected_restaurants=selected_restaurants,
        selected_attractions=selected_attractions,
        travellers=travellers,
        transport_mode=req.transport_mode,
        transport_cost=total_transport
    )

    # 6. Overall Cost Breakdown & Feasibility Check
    # Add a modest 5% miscellaneous contingency buffer
    cost_subtotal = actual_hotel_cost + actual_food_cost + total_transport + actual_sightseeing_cost
    misc_buffer = round(max(200.0, cost_subtotal * 0.04), 2)
    grand_total = round(cost_subtotal + misc_buffer, 2)
    amount_left = round(total_budget_max - grand_total, 2)

    is_feasible = (grand_total <= total_budget_max)
    status_msg = "Itinerary generated within budget!" if is_feasible else "Budget is lower than estimated minimum expenses. Review feasible alternatives below."

    # If not feasible, compute cheapest alternative
    cheapest_alt: Optional[CheapestFeasibleAlternative] = None
    if not is_feasible:
        cheapest_alt = compute_cheapest_alternative(
            req=req,
            num_nights=num_nights,
            rooms=rooms
        )

    cost_breakdown = CostBreakdown(
        accommodation=actual_hotel_cost,
        food=actual_food_cost,
        fuel=fuel_cost,
        tolls=toll_cost,
        sightseeing=round(actual_sightseeing_cost, 2),
        miscellaneous=misc_buffer,
        total=grand_total,
        budget_max=total_budget_max,
        amount_left=amount_left
    )

    return TripOptimizationResponse(
        is_feasible=is_feasible,
        status_message=status_msg,
        cost_breakdown=cost_breakdown,
        category_budgets=cat_budgets,
        selected_hotel=selected_hotel,
        rooms_needed=rooms,
        selected_restaurants=selected_restaurants,
        selected_attractions=selected_attractions,
        itinerary=itinerary,
        cheapest_alternative=cheapest_alt,
        ranked_hotels=ranked_hotels,
        ranked_restaurants=ranked_restaurants,
        ranked_attractions=ranked_attractions
    )


def generate_day_by_day_plan(
    num_days: int,
    start_city: str,
    destination_city: str,
    selected_hotel: Optional[HotelCandidate],
    selected_restaurants: List[RestaurantCandidate],
    selected_attractions: List[AttractionCandidate],
    travellers: int,
    transport_mode: str,
    transport_cost: float
) -> List[DayPlan]:
    """
    Constructs a sensible, realistic time-slotted itinerary:
    - Day 1: Morning departure & transit, lunch, check-in, afternoon & evening sights.
    - Intermediate Days: Breakfast, morning attraction, lunch break, afternoon attraction, evening stroll & dinner.
    - Final Day: Morning visit, lunch, hotel checkout, and return journey home.
    """
    days: List[DayPlan] = []
    attractions_pool = list(selected_attractions)
    attr_idx = 0

    hotel_name = selected_hotel.name if selected_hotel else "Budget City Stay"

    for day in range(1, num_days + 1):
        items: List[DayPlanItem] = []
        day_cost = 0.0
        order = 1

        if day == 1:
            # Transit out from start city
            items.append(DayPlanItem(
                item_order=order,
                item_type="travel",
                title=f"Journey from {start_city} to {destination_city}",
                start_time="07:00:00",
                end_time="11:30:00",
                cost=round(transport_cost * 0.5, 2),
                notes=f"Depart via {transport_mode.capitalize()}. Enjoy scenic highway vistas."
            ))
            day_cost += round(transport_cost * 0.5, 2)
            order += 1

            # Hotel Check-in
            items.append(DayPlanItem(
                item_order=order,
                item_type="hotel_checkin",
                title=f"Check-in at {hotel_name}",
                start_time="12:00:00",
                end_time="13:00:00",
                cost=selected_hotel.price_per_night if selected_hotel else 0.0,
                notes=f"Settle into rooms, freshen up, and unpack.",
                reference_id=selected_hotel.id if selected_hotel else None
            ))
            order += 1

            # Lunch Break
            lunch_spot = selected_restaurants[0].name if selected_restaurants else "Local South Indian Bistro"
            lunch_cost = round((selected_restaurants[0].avg_cost_per_person if selected_restaurants else 180.0) * travellers, 2)
            items.append(DayPlanItem(
                item_order=order,
                item_type="meal",
                title=f"Lunch at {lunch_spot}",
                start_time="13:00:00",
                end_time="14:00:00",
                cost=lunch_cost,
                notes="Hearty regional lunch meal."
            ))
            day_cost += lunch_cost
            order += 1

        else:
            # Breakfast
            bfast_spot = selected_restaurants[1 % len(selected_restaurants)].name if selected_restaurants else "Traditional Breakfast Joint"
            bfast_cost = round(130.0 * travellers, 2)
            items.append(DayPlanItem(
                item_order=order,
                item_type="meal",
                title=f"Breakfast at {bfast_spot}",
                start_time="08:00:00",
                end_time="09:00:00",
                cost=bfast_cost,
                notes="Hot filter coffee, crispy dosas, and fresh idlis."
            ))
            day_cost += bfast_cost
            order += 1

        # Morning Attraction
        if attr_idx < len(attractions_pool):
            att = attractions_pool[attr_idx]
            attr_idx += 1
            att_cost = round(att.ticket_price * travellers, 2)
            items.append(DayPlanItem(
                item_order=order,
                item_type="attraction",
                title=f"Visit {att.name}",
                start_time="09:30:00" if day > 1 else "14:30:00",
                end_time="12:00:00" if day > 1 else "16:30:00",
                cost=att_cost,
                notes=f"{att.category} - Recommended duration: {att.avg_visit_duration_mins} mins. {att.description or ''}",
                reference_id=att.id
            ))
            day_cost += att_cost
            order += 1

        if day > 1:
            # Lunch
            mid_spot = selected_restaurants[2 % len(selected_restaurants)].name if selected_restaurants else "Popular City Eatery"
            mid_cost = round(220.0 * travellers, 2)
            items.append(DayPlanItem(
                item_order=order,
                item_type="meal",
                title=f"Lunch break at {mid_spot}",
                start_time="12:30:00",
                end_time="13:45:00",
                cost=mid_cost,
                notes="Relaxing meal break before afternoon explorations."
            ))
            day_cost += mid_cost
            order += 1

        # Afternoon / Evening Attraction
        if attr_idx < len(attractions_pool):
            att = attractions_pool[attr_idx]
            attr_idx += 1
            att_cost = round(att.ticket_price * travellers, 2)
            items.append(DayPlanItem(
                item_order=order,
                item_type="attraction",
                title=f"Explore {att.name}",
                start_time="14:00:00" if day > 1 else "17:00:00",
                end_time="16:30:00" if day > 1 else "19:00:00",
                cost=att_cost,
                notes=f"{att.category} - {att.description or ''}",
                reference_id=att.id
            ))
            day_cost += att_cost
            order += 1

        # Evening Dinner or Return Trip on final day
        if day == num_days:
            # Final Day return travel
            items.append(DayPlanItem(
                item_order=order,
                item_type="travel",
                title=f"Return Journey to {start_city}",
                start_time="17:00:00",
                end_time="21:30:00",
                cost=round(transport_cost * 0.5, 2),
                notes=f"Conclude trip and travel back via {transport_mode.capitalize()}."
            ))
            day_cost += round(transport_cost * 0.5, 2)
        else:
            # Dinner
            dinner_spot = selected_restaurants[3 % len(selected_restaurants)].name if selected_restaurants else "Local Dining Haven"
            dinner_cost = round(280.0 * travellers, 2)
            items.append(DayPlanItem(
                item_order=order,
                item_type="meal",
                title=f"Dinner at {dinner_spot}",
                start_time="20:00:00",
                end_time="21:30:00",
                cost=dinner_cost,
                notes="Authentic dinner & local dessert."
            ))
            day_cost += dinner_cost

        days.append(DayPlan(
            day_number=day,
            date_label=f"Day {day}",
            items=items,
            day_total_cost=round(day_cost, 2)
        ))

    return days


def compute_cheapest_alternative(
    req: TripOptimizationRequest,
    num_nights: int,
    rooms: int
) -> CheapestFeasibleAlternative:
    """
    Computes rock-bottom cheapest feasible options:
    - Train or Bus travel
    - Budget / Hostel stay
    - Free / low-ticket attractions
    - Budget tiffin meals
    """
    # 1. Cheapest transport mode
    cheapest_mode = "train"
    _, _, _, min_transport, _ = calculate_transport_costs(
        mode="train",
        distance_km=req.route_distance_km,
        toll_cost_one_way=req.route_toll_cost,
        num_travellers=req.num_travellers
    )

    # 2. Cheapest hotel
    if req.hotels:
        cheapest_hotel_obj = min(req.hotels, key=lambda h: h.price_per_night)
        cheapest_hotel_name = cheapest_hotel_obj.name
        cheapest_hotel_tier = cheapest_hotel_obj.tier
        cheapest_hotel_stay = cheapest_hotel_obj.price_per_night * rooms * num_nights
    else:
        cheapest_hotel_name = "Backpacker Dorm / Hostel"
        cheapest_hotel_tier = "Budget"
        cheapest_hotel_stay = 800.0 * rooms * num_nights

    # 3. Budget Meals: ~₹350/person/day
    cheap_food = 350.0 * req.num_travellers * req.num_days

    # 4. Sightseeing: Free & minimal pass attractions (~₹50/person total)
    cheap_sightseeing = 50.0 * req.num_travellers

    # 5. Buffer
    misc = 300.0

    min_feasible_total = round(min_transport + cheapest_hotel_stay + cheap_food + cheap_sightseeing + misc, 2)

    tips = [
        f"Switch transport mode to Train (estimated ₹{min_transport:.0f} round-trip for {req.num_travellers} traveller(s)).",
        f"Opt for budget accommodation like '{cheapest_hotel_name}' (approx ₹{cheapest_hotel_stay:.0f} for {num_nights} night(s)).",
        "Focus on free public heritage sites, temples, beaches, and city parks.",
        "Dine at authentic local tiffin rooms rather than fine dining establishments."
    ]

    return CheapestFeasibleAlternative(
        suggested_budget=min_feasible_total,
        transport_mode=cheapest_mode,
        hotel_name=cheapest_hotel_name,
        hotel_tier=cheapest_hotel_tier,
        estimated_cost=min_feasible_total,
        savings_tips=tips
    )
