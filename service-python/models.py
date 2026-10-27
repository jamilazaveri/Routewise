"""
Pydantic data models for the Routewise Python Microservice.
Handles cost estimation, scoring/ranking, and budget optimization.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator


# -------------------------------------------------------------
# 1. Transport & Toll Models
# -------------------------------------------------------------
class TransportCostRequest(BaseModel):
    transport_mode: str = Field(..., description="car, bike, bus, or train")
    distance_km: float = Field(..., ge=0, description="One-way distance in kilometers")
    is_round_trip: bool = Field(True, description="Whether to calculate round trip")
    toll_cost_one_way: float = Field(0.0, ge=0, description="One-way toll cost in INR from route data")
    num_travellers: int = Field(1, ge=1, description="Number of travellers")
    fuel_price_per_litre: Optional[float] = Field(None, ge=50, description="Override fuel price in INR")
    mileage_km_per_litre: Optional[float] = Field(None, ge=5, description="Override mileage in km/l")


class TransportCostResponse(BaseModel):
    transport_mode: str
    total_distance_km: float
    fuel_cost: float
    toll_cost: float
    ticket_cost: float
    total_transport_cost: float
    breakdown_notes: str


# -------------------------------------------------------------
# 2. Candidate Items for Ranking & Optimization
# -------------------------------------------------------------
class HotelCandidate(BaseModel):
    id: int
    name: str
    tier: str = "Mid-Range"
    price_per_night: float
    rating: float = 4.0
    amenities: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RestaurantCandidate(BaseModel):
    id: int
    name: str
    cuisine: str
    avg_cost_per_person: float
    rating: float = 4.0
    meal_type: str = "All"
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AttractionCandidate(BaseModel):
    id: int
    name: str
    category: str
    ticket_price: float
    rating: float = 4.0
    scenic_score: float = 0.5
    avg_visit_duration_mins: int = 90
    opening_time: str = "09:00:00"
    closing_time: str = "18:00:00"
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# -------------------------------------------------------------
# 3. Ranking Requests & Responses
# -------------------------------------------------------------
class HotelRankingRequest(BaseModel):
    hotels: List[HotelCandidate]
    budget_limit: Optional[float] = None
    num_travellers: int = 1
    num_nights: int = 1


class RankedHotel(BaseModel):
    hotel: HotelCandidate
    score: float
    rooms_needed: int
    total_hotel_cost: float
    fits_budget: bool


class RestaurantRankingRequest(BaseModel):
    restaurants: List[RestaurantCandidate]
    meal_budget_per_person: Optional[float] = None


class RankedRestaurant(BaseModel):
    restaurant: RestaurantCandidate
    score: float
    fits_budget: bool


class AttractionRankingRequest(BaseModel):
    attractions: List[AttractionCandidate]
    sightseeing_budget: Optional[float] = None
    num_travellers: int = 1


class RankedAttraction(BaseModel):
    attraction: AttractionCandidate
    score: float
    total_ticket_cost: float
    fits_budget: bool


# -------------------------------------------------------------
# 4. Budget Optimization & Greedy Fitting
# -------------------------------------------------------------
class BudgetShares(BaseModel):
    accommodation: float = Field(35.0, ge=0, le=100)
    food: float = Field(25.0, ge=0, le=100)
    transport: float = Field(20.0, ge=0, le=100)
    sightseeing: float = Field(20.0, ge=0, le=100)

    @model_validator(mode="after")
    def check_sum_close_to_100(self):
        total = self.accommodation + self.food + self.transport + self.sightseeing
        if abs(total - 100.0) > 0.5:
            # Re-normalize to 100 if user shares do not add up perfectly
            factor = 100.0 / total if total > 0 else 1.0
            self.accommodation = round(self.accommodation * factor, 2)
            self.food = round(self.food * factor, 2)
            self.transport = round(self.transport * factor, 2)
            self.sightseeing = round(100.0 - (self.accommodation + self.food + self.transport), 2)
        return self


class TripOptimizationRequest(BaseModel):
    start_city: str
    destination_city: str
    num_days: int = Field(..., ge=1, le=14)
    num_travellers: int = Field(..., ge=1, le=50)
    transport_mode: str = Field("car", description="car, bike, bus, train")
    total_budget_min: float = Field(..., ge=1000)
    total_budget_max: float = Field(..., ge=1000)
    shares: BudgetShares = Field(default_factory=BudgetShares)
    route_distance_km: float = Field(..., ge=0)
    route_toll_cost: float = Field(0.0, ge=0)
    hotels: List[HotelCandidate]
    restaurants: List[RestaurantCandidate]
    attractions: List[AttractionCandidate]


class DayPlanItem(BaseModel):
    item_order: int
    item_type: str  # 'travel', 'hotel_checkin', 'attraction', 'meal'
    title: str
    start_time: str
    end_time: str
    cost: float
    notes: str
    reference_id: Optional[int] = None


class DayPlan(BaseModel):
    day_number: int
    date_label: Optional[str] = None
    items: List[DayPlanItem]
    day_total_cost: float


class CostBreakdown(BaseModel):
    accommodation: float
    food: float
    fuel: float
    tolls: float
    sightseeing: float
    miscellaneous: float
    total: float
    budget_max: float
    amount_left: float


class CheapestFeasibleAlternative(BaseModel):
    suggested_budget: float
    transport_mode: str
    hotel_name: str
    hotel_tier: str
    estimated_cost: float
    savings_tips: List[str]


class TripOptimizationResponse(BaseModel):
    is_feasible: bool
    status_message: str
    cost_breakdown: CostBreakdown
    category_budgets: Dict[str, float]
    selected_hotel: Optional[HotelCandidate] = None
    rooms_needed: int = 1
    selected_restaurants: List[RestaurantCandidate] = []
    selected_attractions: List[AttractionCandidate] = []
    itinerary: List[DayPlan] = []
    cheapest_alternative: Optional[CheapestFeasibleAlternative] = None
    ranked_hotels: List[RankedHotel] = []
    ranked_restaurants: List[RankedRestaurant] = []
    ranked_attractions: List[RankedAttraction] = []


# -------------------------------------------------------------
# 5. Budget Re-allocation Helper
# -------------------------------------------------------------
class ReallocateBudgetRequest(BaseModel):
    changed_category: str  # 'accommodation', 'food', 'transport', 'sightseeing'
    new_share: float = Field(..., ge=5, le=80)
    current_shares: BudgetShares
    total_budget_max: float


class ReallocateBudgetResponse(BaseModel):
    new_shares: BudgetShares
    category_budgets: Dict[str, float]
    total_budget_max: float
    explanation: str


# -------------------------------------------------------------
# 6. Route Planning & Multiple Route Types Models
# -------------------------------------------------------------
class StopItem(BaseModel):
    id: Optional[int] = None
    name: str
    stop_type: str = "attraction"  # 'hotel', 'restaurant', 'attraction'
    latitude: float
    longitude: float
    opening_time: str = "06:00:00"
    closing_time: str = "22:00:00"
    avg_visit_duration_mins: int = 60
    ticket_price: float = 0.0
    meal_type: Optional[str] = None
    rating: float = 4.0
    scenic_score: float = 0.50
    category: Optional[str] = None
    address: Optional[str] = None


class RouteLeg(BaseModel):
    seq: int
    from_stop_name: str
    from_stop_type: str
    from_lat: float
    from_lng: float
    to_stop_name: str
    to_stop_type: str
    to_lat: float
    to_lng: float
    distance_km: float
    duration_mins: int
    toll_cost: float = 0.0
    fuel_cost: float = 0.0
    arrival_time: str
    departure_time: str
    stay_duration_mins: int = 60
    geometry: List[List[float]] = []  # [[lat, lng], [lat, lng], ...]
    instructions: Optional[str] = None
    closing_time_warning: Optional[str] = None


class RouteOption(BaseModel):
    route_type: str  # 'fastest', 'shortest', 'cheapest', 'scenic', 'easiest'
    tag: str
    total_distance_km: float
    total_time_mins: int
    total_cost: float
    fuel_cost: float
    toll_cost: float
    scenic_score: float
    summary: str
    ordered_stops: List[StopItem]
    legs: List[RouteLeg]
    warnings: List[str] = []


class MultiRoutePlanRequest(BaseModel):
    trip_id: Optional[int] = None
    city_name: str
    transport_mode: str = "car"  # car, bike, bus, train
    hotel: Optional[HotelCandidate] = None
    restaurants: List[RestaurantCandidate] = []
    attractions: List[AttractionCandidate] = []
    num_days: int = 1
    selected_day: Optional[int] = 1


class MultiRoutePlanResponse(BaseModel):
    city_name: str
    transport_mode: str
    routes: Dict[str, RouteOption]  # 'fastest', 'shortest', 'cheapest', 'scenic', 'easiest'
    comparison: List[Dict[str, Any]]

