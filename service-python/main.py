"""
Routewise Python Microservice: Cost Estimation, Scoring/Ranking, and Budget Fitting.
FastAPI Application running on port 8000.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from models import (
    TransportCostRequest, TransportCostResponse,
    HotelRankingRequest, RankedHotel,
    RestaurantRankingRequest, RankedRestaurant,
    AttractionRankingRequest, RankedAttraction,
    TripOptimizationRequest, TripOptimizationResponse,
    ReallocateBudgetRequest, ReallocateBudgetResponse, BudgetShares
)
from scoring import rank_hotels, rank_restaurants, rank_attractions
from optimizer import calculate_transport_costs, optimize_trip


app = FastAPI(
    title="Routewise Cost & Ranking Engine",
    description="Microservice for journey cost calculation, score-based ranking, and budget-optimized itinerary planning.",
    version="1.0.0"
)

# Enable CORS for Spring Boot and web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "routewise-python-microservice",
        "version": "1.0.0"
    }


@app.post("/estimate-transport", response_model=TransportCostResponse)
def estimate_transport(req: TransportCostRequest):
    """
    Computes fuel, tolls, or ticket costs according to transport mode and mileage/pricing models.
    """
    fuel, tolls, tickets, total, notes = calculate_transport_costs(
        mode=req.transport_mode,
        distance_km=req.distance_km,
        toll_cost_one_way=req.toll_cost_one_way,
        num_travellers=req.num_travellers,
        is_round_trip=req.is_round_trip
    )

    multiplier = 2.0 if req.is_round_trip else 1.0
    return TransportCostResponse(
        transport_mode=req.transport_mode,
        total_distance_km=round(req.distance_km * multiplier, 2),
        fuel_cost=fuel,
        toll_cost=tolls,
        ticket_cost=tickets,
        total_transport_cost=total,
        breakdown_notes=notes
    )


@app.post("/rank-hotels")
def rank_hotel_candidates(req: HotelRankingRequest):
    """
    Ranks hotels by rating vs price trade-off, verifying budget constraints.
    """
    ranked = rank_hotels(
        hotels=req.hotels,
        budget_limit=req.budget_limit,
        num_travellers=req.num_travellers,
        num_nights=req.num_nights
    )
    return {"ranked_hotels": ranked}


@app.post("/rank-restaurants")
def rank_restaurant_candidates(req: RestaurantRankingRequest):
    """
    Ranks restaurants by rating and meal affordability.
    """
    ranked = rank_restaurants(
        restaurants=req.restaurants,
        meal_budget_per_person=req.meal_budget_per_person
    )
    return {"ranked_restaurants": ranked}


@app.post("/rank-attractions")
def rank_attraction_candidates(req: AttractionRankingRequest):
    """
    Ranks attractions based on popularity rating and ticket price value.
    """
    ranked = rank_attractions(
        attractions=req.attractions,
        sightseeing_budget=req.sightseeing_budget,
        num_travellers=req.num_travellers
    )
    return {"ranked_attractions": ranked}


@app.post("/optimize-trip", response_model=TripOptimizationResponse)
def optimize_trip_plan(req: TripOptimizationRequest):
    """
    Main itinerary generator and budget-fitting optimizer called by Spring Boot.
    """
    try:
        response = optimize_trip(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@app.post("/reallocate-budget", response_model=ReallocateBudgetResponse)
def reallocate_budget(req: ReallocateBudgetRequest):
    """
    Feature 5: Budget re-allocation.
    If the user adjusts one category share slider (e.g. accommodation from 35% to 20%),
    the remaining 80% is proportionately distributed across the other 3 categories,
    keeping total at 100%, and recalculating INR amounts.
    """
    cat = req.changed_category.lower().strip()
    new_share = round(float(req.new_share), 2)
    current = req.current_shares

    valid_cats = ["accommodation", "food", "transport", "sightseeing"]
    if cat not in valid_cats:
        raise HTTPException(status_code=400, detail=f"Invalid category '{cat}'. Expected one of {valid_cats}")

    shares_dict = {
        "accommodation": current.accommodation,
        "food": current.food,
        "transport": current.transport,
        "sightseeing": current.sightseeing
    }

    # Old share of the changed category
    old_share = shares_dict[cat]
    shares_dict[cat] = new_share

    remaining_needed = 100.0 - new_share
    other_cats = [c for c in valid_cats if c != cat]
    other_total = sum(shares_dict[c] for c in other_cats)

    if other_total > 0:
        ratio = remaining_needed / other_total
        for c in other_cats:
            shares_dict[c] = round(shares_dict[c] * ratio, 2)
    else:
        # Distribute equally
        split = round(remaining_needed / 3.0, 2)
        for c in other_cats:
            shares_dict[c] = split

    # Fix any rounding discrepancy on the last category
    diff = round(100.0 - sum(shares_dict.values()), 2)
    shares_dict[other_cats[-1]] = round(shares_dict[other_cats[-1]] + diff, 2)

    total_max = req.total_budget_max
    cat_budgets = {
        k: round(total_max * (v / 100.0), 2) for k, v in shares_dict.items()
    }

    explanation = (
        f"Adjusted {cat.capitalize()} to {new_share}% (₹{cat_budgets[cat]:.0f}). "
        f"Re-balanced remaining {remaining_needed:.1f}% across {', '.join(c.capitalize() for c in other_cats)}."
    )

    new_shares_obj = BudgetShares(
        accommodation=shares_dict["accommodation"],
        food=shares_dict["food"],
        transport=shares_dict["transport"],
        sightseeing=shares_dict["sightseeing"]
    )

    return ReallocateBudgetResponse(
        new_shares=new_shares_obj,
        category_budgets=cat_budgets,
        total_budget_max=total_max,
        explanation=explanation
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
