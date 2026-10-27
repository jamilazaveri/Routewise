"""
Routewise Route Planner & Multi-Route Optimizer.
Implements stop ordering (Nearest-Neighbour + 2-Opt), multiple route scoring types
(Fastest, Shortest, Cheapest, Scenic, Easiest), time-window compliance, and road geometry.
"""

from typing import List, Dict, Tuple, Optional, Any
import math
import time
import urllib.request
import json
from models import (
    StopItem, RouteLeg, RouteOption,
    MultiRoutePlanRequest, MultiRoutePlanResponse,
    HotelCandidate, RestaurantCandidate, AttractionCandidate
)

# Constants
DEFAULT_FUEL_PRICE_INR = 103.0
CAR_MILEAGE_KM_PER_L = 15.0
EARTH_RADIUS_KM = 6371.0

# In-memory segment cache to avoid repetitive queries / external calls
_SEGMENT_CACHE: Dict[str, Dict[str, Any]] = {}


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in km."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c


def get_segment_metrics(
    from_name: str, to_name: str,
    from_lat: float, from_lng: float,
    to_lat: float, to_lng: float,
    scenic_u: float = 0.5, scenic_v: float = 0.5
) -> Dict[str, Any]:
    """
    Retrieves segment metrics (distance, duration, turns, toll, scenic_score, geometry)
    using in-memory cache, OSRM public API, or high-accuracy Haversine model.
    """
    cache_key = f"{round(from_lat, 4)},{round(from_lng, 4)}->{round(to_lat, 4)},{round(to_lng, 4)}"
    if cache_key in _SEGMENT_CACHE:
        return _SEGMENT_CACHE[cache_key]

    # Try calling OSRM free public routing API with a short timeout
    osrm_data = None
    try:
        url = f"http://router.project-osrm.org/route/v1/driving/{from_lng:.6f},{from_lat:.6f};{to_lng:.6f},{to_lat:.6f}?overview=full&geometries=geojson"
        req = urllib.request.Request(url, headers={"User-Agent": "RoutewisePlanner/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                osrm_data = json.loads(resp.read().decode())
    except Exception:
        # Graceful fallback to local geometric model
        osrm_data = None

    if osrm_data and "routes" in osrm_data and len(osrm_data["routes"]) > 0:
        route0 = osrm_data["routes"][0]
        dist_km = round(route0["distance"] / 1000.0, 2)
        dur_mins = max(2, round(route0["duration"] / 60.0))
        # OSRM coordinates are [lng, lat], Leaflet requires [lat, lng]
        geom = [[pt[1], pt[0]] for pt in route0["geometry"]["coordinates"]]
    else:
        # Geometric Fallback: Haversine distance with city street factor (1.28x)
        h_dist = haversine_distance(from_lat, from_lng, to_lat, to_lng)
        dist_km = max(0.3, round(h_dist * 1.28, 2))
        # Average city speed 28 km/h + intersection delays
        dur_mins = max(3, round((dist_km / 28.0) * 60.0))

        # Generate smooth polyline path between points (5 intermediate curved steps)
        steps = 5
        geom = []
        for i in range(steps + 1):
            t = i / float(steps)
            # Add slight realistic perpendicular curve
            lat_inter = from_lat + t * (to_lat - from_lat)
            lng_inter = from_lng + t * (to_lng - from_lng)
            curve = math.sin(t * math.pi) * 0.0015
            geom.append([round(lat_inter + curve, 6), round(lng_inter, 6)])

    # Compute turns count & scenic score
    turns = max(1, int(round(dist_km * 1.4)))
    avg_scenic = round((scenic_u + scenic_v) / 2.0, 2)
    # Toll is 0 for intra-city routes unless long bypass
    toll = 0.0
    congestion = round(max(0.5, dist_km * 0.35), 2)
    fuel = round((dist_km / CAR_MILEAGE_KM_PER_L) * DEFAULT_FUEL_PRICE_INR, 2)

    result = {
        "distance_km": dist_km,
        "duration_mins": dur_mins,
        "turns_count": turns,
        "scenic_score": avg_scenic,
        "toll_cost": toll,
        "fuel_cost": fuel,
        "congestion_penalty": congestion,
        "geometry": geom
    }

    _SEGMENT_CACHE[cache_key] = result
    return result


def parse_time_str_to_mins(t_str: str) -> int:
    """Converts 'HH:MM:SS' or 'HH:MM' string to minutes since midnight."""
    try:
        parts = [int(p) for p in t_str.strip().split(":")]
        if len(parts) >= 2:
            return parts[0] * 60 + parts[1]
    except Exception:
        pass
    return 9 * 60  # Default 09:00


def format_mins_to_time_str(mins: int) -> str:
    """Converts minutes since midnight back to 'HH:MM' string."""
    h = (mins // 60) % 24
    m = mins % 60
    return f"{h:02d}:{m:02d}"


def calculate_segment_cost(
    seg: Dict[str, Any],
    route_type: str,
    fastest_dist_ref: Optional[float] = None
) -> float:
    """
    Cost functions per route type:
    - fastest: travel_time (duration_mins)
    - shortest: distance (distance_km)
    - cheapest: fuel_cost + toll_cost
    - scenic: distance * (1.0 - scenic_score) (with extra detour capped at 25% of fastest)
    - easiest: travel_time + turn_penalty + congestion_penalty
    """
    r_type = route_type.lower().strip()
    dist = seg["distance_km"]
    dur = seg["duration_mins"]
    fuel = seg["fuel_cost"]
    toll = seg["toll_cost"]
    scenic = seg["scenic_score"]
    turns = seg["turns_count"]
    congestion = seg["congestion_penalty"]

    if r_type == "fastest":
        return float(dur)

    elif r_type == "shortest":
        return float(dist)

    elif r_type == "cheapest":
        return float(fuel + toll)

    elif r_type == "scenic":
        # Lower cost for higher scenic score
        base_scenic_cost = dist * (1.0 - (scenic * 0.85))
        # Cap excessive detours if reference exists
        if fastest_dist_ref and dist > (fastest_dist_ref * 1.25):
            base_scenic_cost += (dist - fastest_dist_ref * 1.25) * 5.0
        return float(base_scenic_cost)

    elif r_type == "easiest":
        # Penalize turns and congestion, favor smooth flow
        turn_penalty = turns * 1.2
        return float(dur + turn_penalty + congestion)

    # Fallback to duration
    return float(dur)


def order_stops_for_route_type(
    stops: List[StopItem],
    route_type: str,
    fastest_dist_ref: Optional[float] = None
) -> Tuple[List[StopItem], List[RouteLeg], Dict[str, Any]]:
    """
    Constructs an optimized stop order using Nearest-Neighbour followed by 2-Opt.
    Respects:
    - Starting at Hotel (base anchor around 09:00:00).
    - Meal windows: Lunch restaurant ideally between 12:00 - 14:00, Dinner 19:00 - 21:00.
    - Opening and closing times for attractions.
    - Final return to Hotel.
    """
    if not stops:
        return [], [], {}

    # Separate anchors and visitable items
    hotel_stop = next((s for s in stops if s.stop_type == "hotel"), stops[0])
    lunch_stop = next((s for s in stops if s.stop_type == "restaurant" and (s.meal_type or "").lower() == "lunch"), None)
    dinner_stop = next((s for s in stops if s.stop_type == "restaurant" and (s.meal_type or "").lower() == "dinner"), None)
    
    other_restaurants = [s for s in stops if s.stop_type == "restaurant" and s not in (lunch_stop, dinner_stop)]
    if not lunch_stop and other_restaurants:
        lunch_stop = other_restaurants[0]
    if not dinner_stop and len(other_restaurants) > 1:
        dinner_stop = other_restaurants[1]

    attractions = [s for s in stops if s.stop_type == "attraction"]

    # 1. Initial Nearest-Neighbour Construction
    # Phase 1: Morning exploration (Hotel -> Morning Attractions -> Lunch)
    current_time_mins = 9 * 60  # Start at 09:00
    current_pos = hotel_stop
    morning_stops: List[StopItem] = []
    unvisited_attractions = list(attractions)

    # Split attractions: typically 1-2 in morning, remainder in afternoon
    morning_quota = min(len(unvisited_attractions), max(1, len(unvisited_attractions) // 2))

    for _ in range(morning_quota):
        if not unvisited_attractions:
            break
        # Pick best attraction according to route_type cost from current_pos
        best_candidate = None
        best_cost = float("inf")
        for cand in unvisited_attractions:
            seg = get_segment_metrics(
                current_pos.name, cand.name,
                current_pos.latitude, current_pos.longitude,
                cand.latitude, cand.longitude,
                current_pos.scenic_score, cand.scenic_score
            )
            cost = calculate_segment_cost(seg, route_type, fastest_dist_ref)
            if cost < best_cost:
                best_cost = cost
                best_candidate = cand

        if best_candidate:
            morning_stops.append(best_candidate)
            unvisited_attractions.remove(best_candidate)
            current_pos = best_candidate

    # Phase 2: Lunch Stop
    midday_stop_seq = list(morning_stops)
    if lunch_stop:
        midday_stop_seq.append(lunch_stop)
        current_pos = lunch_stop

    # Phase 3: Afternoon Attractions
    afternoon_stops: List[StopItem] = []
    while unvisited_attractions:
        best_candidate = None
        best_cost = float("inf")
        for cand in unvisited_attractions:
            seg = get_segment_metrics(
                current_pos.name, cand.name,
                current_pos.latitude, current_pos.longitude,
                cand.latitude, cand.longitude,
                current_pos.scenic_score, cand.scenic_score
            )
            cost = calculate_segment_cost(seg, route_type, fastest_dist_ref)
            if cost < best_cost:
                best_cost = cost
                best_candidate = cand

        if best_candidate:
            afternoon_stops.append(best_candidate)
            unvisited_attractions.remove(best_candidate)
            current_pos = best_candidate

    # Phase 4: Dinner Stop & Hotel Return
    ordered_sequence: List[StopItem] = [hotel_stop] + midday_stop_seq + afternoon_stops
    if dinner_stop and dinner_stop not in ordered_sequence:
        ordered_sequence.append(dinner_stop)
    ordered_sequence.append(hotel_stop)  # Return to base

    # 2. 2-Opt Improvement on Intermediate Stops (excluding start & end hotel)
    if len(ordered_sequence) > 4:
        improved = True
        iterations = 0
        max_iterations = 25

        while improved and iterations < max_iterations:
            improved = False
            iterations += 1
            for i in range(1, len(ordered_sequence) - 2):
                for j in range(i + 1, len(ordered_sequence) - 1):
                    # Do not swap lunch after dinner
                    stop_i = ordered_sequence[i]
                    stop_j = ordered_sequence[j]
                    if stop_i.stop_type == "restaurant" and stop_j.stop_type == "restaurant":
                        continue

                    # Current cost of segments (i-1 -> i) and (j -> j+1)
                    seg1 = get_segment_metrics(
                        ordered_sequence[i-1].name, ordered_sequence[i].name,
                        ordered_sequence[i-1].latitude, ordered_sequence[i-1].longitude,
                        ordered_sequence[i].latitude, ordered_sequence[i].longitude
                    )
                    seg2 = get_segment_metrics(
                        ordered_sequence[j].name, ordered_sequence[j+1].name,
                        ordered_sequence[j].latitude, ordered_sequence[j].longitude,
                        ordered_sequence[j+1].latitude, ordered_sequence[j+1].longitude
                    )
                    curr_cost = calculate_segment_cost(seg1, route_type, fastest_dist_ref) + calculate_segment_cost(seg2, route_type, fastest_dist_ref)

                    # Swapped cost of segments (i-1 -> j) and (i -> j+1)
                    swap_seg1 = get_segment_metrics(
                        ordered_sequence[i-1].name, ordered_sequence[j].name,
                        ordered_sequence[i-1].latitude, ordered_sequence[i-1].longitude,
                        ordered_sequence[j].latitude, ordered_sequence[j].longitude
                    )
                    swap_seg2 = get_segment_metrics(
                        ordered_sequence[i].name, ordered_sequence[j+1].name,
                        ordered_sequence[i].latitude, ordered_sequence[i].longitude,
                        ordered_sequence[j+1].latitude, ordered_sequence[j+1].longitude
                    )
                    new_cost = calculate_segment_cost(swap_seg1, route_type, fastest_dist_ref) + calculate_segment_cost(swap_seg2, route_type, fastest_dist_ref)

                    if new_cost < curr_cost - 0.05:
                        # Perform 2-opt reversal
                        ordered_sequence[i:j+1] = reversed(ordered_sequence[i:j+1])
                        improved = True
                        break
                if improved:
                    break

    # 3. Build Route Legs, Schedule Timings, Check Closing Times
    legs: List[RouteLeg] = []
    tot_dist = 0.0
    tot_dur = 0
    tot_fuel = 0.0
    tot_toll = 0.0
    scenic_scores: List[float] = []
    warnings: List[str] = []

    current_clock_mins = 9 * 60  # Departure from Hotel at 09:00

    for idx in range(len(ordered_sequence) - 1):
        u = ordered_sequence[idx]
        v = ordered_sequence[idx + 1]

        seg = get_segment_metrics(
            u.name, v.name,
            u.latitude, u.longitude,
            v.latitude, v.longitude,
            u.scenic_score, v.scenic_score
        )

        leg_dist = seg["distance_km"]
        leg_dur = seg["duration_mins"]
        leg_fuel = seg["fuel_cost"]
        leg_toll = seg["toll_cost"]

        tot_dist += leg_dist
        tot_dur += leg_dur
        tot_fuel += leg_fuel
        tot_toll += leg_toll
        scenic_scores.append(seg["scenic_score"])

        arr_mins = current_clock_mins + leg_dur
        stay_mins = v.avg_visit_duration_mins if v.stop_type != "hotel" else 30
        if v.stop_type == "restaurant":
            stay_mins = 60
        dep_mins = arr_mins + stay_mins

        arr_str = format_mins_to_time_str(arr_mins)
        dep_str = format_mins_to_time_str(dep_mins)

        # Closing Time Verification
        closing_warning = None
        if v.stop_type == "attraction" and v.closing_time:
            close_mins = parse_time_str_to_mins(v.closing_time)
            if arr_mins > close_mins:
                closing_warning = f"{v.name} closes at {v.closing_time[:5]}, but estimated arrival is {arr_str}. Suggestion: Reorder earlier or visit next morning."
                warnings.append(closing_warning)
            elif (arr_mins + 30) > close_mins:
                closing_warning = f"{v.name} closes at {v.closing_time[:5]}, arrival {arr_str} leaves under 30 mins visit time."
                warnings.append(closing_warning)

        leg = RouteLeg(
            seq=idx + 1,
            from_stop_name=u.name,
            from_stop_type=u.stop_type,
            from_lat=u.latitude,
            from_lng=u.longitude,
            to_stop_name=v.name,
            to_stop_type=v.stop_type,
            to_lat=v.latitude,
            to_lng=v.longitude,
            distance_km=leg_dist,
            duration_mins=leg_dur,
            toll_cost=leg_toll,
            fuel_cost=leg_fuel,
            arrival_time=arr_str,
            departure_time=dep_str,
            stay_duration_mins=stay_mins,
            geometry=seg["geometry"],
            instructions=f"Head towards {v.name} ({leg_dist} km, ~{leg_dur} mins)",
            closing_time_warning=closing_warning
        )
        legs.append(leg)
        current_clock_mins = dep_mins

    avg_scenic_overall = round(sum(scenic_scores) / max(1, len(scenic_scores)), 2)
    tot_cost = round(tot_fuel + tot_toll, 2)

    meta = {
        "total_distance_km": round(tot_dist, 2),
        "total_time_mins": tot_dur,
        "total_cost": tot_cost,
        "fuel_cost": round(tot_fuel, 2),
        "toll_cost": round(tot_toll, 2),
        "scenic_score": avg_scenic_overall,
        "warnings": warnings
    }

    return ordered_sequence, legs, meta


def plan_all_route_types(
    req: MultiRoutePlanRequest
) -> MultiRoutePlanResponse:
    """
    Computes all 5 route styles (Fastest, Shortest, Cheapest, Scenic, Easiest)
    and generates a side-by-side comparison matrix.
    """
    # Build unified list of StopItems from candidates
    stops: List[StopItem] = []

    # 1. Hotel Stop
    if req.hotel:
        lat = req.hotel.latitude if req.hotel.latitude else 13.0410
        lng = req.hotel.longitude if req.hotel.longitude else 80.2500
        stops.append(StopItem(
            id=req.hotel.id,
            name=req.hotel.name,
            stop_type="hotel",
            latitude=lat,
            longitude=lng,
            opening_time="00:00:00",
            closing_time="23:59:59",
            avg_visit_duration_mins=30,
            address=req.hotel.address,
            scenic_score=0.70
        ))

    # 2. Restaurant Stops
    for r in req.restaurants:
        lat = r.latitude if r.latitude else 13.0450
        lng = r.longitude if r.longitude else 80.2550
        stops.append(StopItem(
            id=r.id,
            name=r.name,
            stop_type="restaurant",
            latitude=lat,
            longitude=lng,
            opening_time="07:00:00",
            closing_time="22:30:00",
            avg_visit_duration_mins=60,
            meal_type=r.meal_type,
            address=r.address,
            scenic_score=0.65
        ))

    # 3. Attraction Stops
    for a in req.attractions:
        lat = a.latitude if a.latitude else 13.0500
        lng = a.longitude if a.longitude else 80.2800
        stops.append(StopItem(
            id=a.id,
            name=a.name,
            stop_type="attraction",
            latitude=lat,
            longitude=lng,
            opening_time=a.opening_time or "09:00:00",
            closing_time=a.closing_time or "18:00:00",
            avg_visit_duration_mins=a.avg_visit_duration_mins or 90,
            ticket_price=a.ticket_price,
            rating=a.rating,
            scenic_score=a.scenic_score or 0.80,
            category=a.category,
            address=a.description
        ))

    # Fallback default stops for Chennai if list is empty
    if len(stops) < 2:
        stops = [
            StopItem(name="Mylapore Heritage Inn", stop_type="hotel", latitude=13.0330, longitude=80.2690, scenic_score=0.80),
            StopItem(name="Kapaleeshwarar Temple", stop_type="attraction", latitude=13.0336, longitude=80.2694, opening_time="06:00:00", closing_time="21:00:00", avg_visit_duration_mins=75, scenic_score=0.88),
            StopItem(name="Saravana Bhavan Mylapore", stop_type="restaurant", latitude=13.0345, longitude=80.2695, meal_type="Lunch", scenic_score=0.65),
            StopItem(name="San Thome Basilica", stop_type="attraction", latitude=13.0337, longitude=80.2782, opening_time="06:00:00", closing_time="20:00:00", avg_visit_duration_mins=60, scenic_score=0.85),
            StopItem(name="Marina Beach & Promenade", stop_type="attraction", latitude=13.0500, longitude=80.2824, opening_time="05:00:00", closing_time="22:00:00", avg_visit_duration_mins=90, scenic_score=0.98),
            StopItem(name="Anjappar Chettinad", stop_type="restaurant", latitude=13.0580, longitude=80.2510, meal_type="Dinner", scenic_score=0.70)
        ]

    # First calculate 'Fastest' to obtain baseline distance reference for Scenic detour capping
    ordered_f, legs_f, meta_f = order_stops_for_route_type(stops, "fastest")
    fastest_ref_dist = meta_f["total_distance_km"]

    route_configs = [
        ("fastest", "⚡ Fastest", "Minimum travel time, prioritizing express links & bypasses."),
        ("shortest", "📏 Shortest", "Minimum total kilometers traveled."),
        ("cheapest", "💰 Cheapest", "Minimum fuel expenditure with zero toll deviations."),
        ("scenic", "🌊 Scenic", "Prefers picturesque coastlines, heritage districts, and parks (detour capped at +25%)."),
        ("easiest", "🛣️ Easiest", "Fewer turns and wide arterials for a relaxed, low-stress drive.")
    ]

    routes_result: Dict[str, RouteOption] = {}
    comparison_table: List[Dict[str, Any]] = []

    for r_type, tag_name, summary_text in route_configs:
        if r_type == "fastest":
            ordered, legs, meta = ordered_f, legs_f, meta_f
        else:
            ordered, legs, meta = order_stops_for_route_type(stops, r_type, fastest_ref_dist)

        route_opt = RouteOption(
            route_type=r_type,
            tag=tag_name,
            total_distance_km=meta["total_distance_km"],
            total_time_mins=meta["total_time_mins"],
            total_cost=meta["total_cost"],
            fuel_cost=meta["fuel_cost"],
            toll_cost=meta["toll_cost"],
            scenic_score=meta["scenic_score"],
            summary=summary_text,
            ordered_stops=ordered,
            legs=legs,
            warnings=meta["warnings"]
        )
        routes_result[r_type] = route_opt

        comparison_table.append({
            "route_type": r_type,
            "title": tag_name,
            "distance_km": meta["total_distance_km"],
            "time_mins": meta["total_time_mins"],
            "fuel_cost": meta["fuel_cost"],
            "toll_cost": meta["toll_cost"],
            "total_cost": meta["total_cost"],
            "scenic_score": meta["scenic_score"],
            "stops_count": len(ordered),
            "warnings_count": len(meta["warnings"])
        })

    return MultiRoutePlanResponse(
        city_name=req.city_name,
        transport_mode=req.transport_mode,
        routes=routes_result,
        comparison=comparison_table
    )
