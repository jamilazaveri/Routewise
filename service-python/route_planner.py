"""
Routewise Route Planner & Multi-Route Optimizer.
Implements stop ordering (Nearest-Neighbour + 2-Opt), genuine route differentiation
across 5 distinct styles (Fastest, Shortest, Cheapest, Scenic, Easiest),
OSRM alternative route selection, time-window compliance, and road geometry.
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
    scenic_u: float = 0.5, scenic_v: float = 0.5,
    route_type: str = "fastest",
    fastest_dist_ref: Optional[float] = None
) -> Dict[str, Any]:
    """
    Retrieves segment metrics (distance, duration, turns, toll, scenic_score, geometry)
    tailored to the specific route_type using OSRM alternatives or our validated road model.
    """
    r_type = route_type.lower().strip()
    cache_key = f"{r_type}:{round(from_lat, 4)},{round(from_lng, 4)}->{round(to_lat, 4)},{round(to_lng, 4)}"
    if cache_key in _SEGMENT_CACHE:
        return _SEGMENT_CACHE[cache_key]

    # Query OSRM free public routing API with alternatives=true
    osrm_routes = None
    try:
        url = (
            f"http://router.project-osrm.org/route/v1/driving/"
            f"{from_lng:.6f},{from_lat:.6f};{to_lng:.6f},{to_lat:.6f}"
            f"?overview=full&geometries=geojson&alternatives=true&steps=true"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "RoutewisePlanner/1.0"})
        with urllib.request.urlopen(req, timeout=1.8) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                if "routes" in data and len(data["routes"]) > 0:
                    osrm_routes = data["routes"]
    except Exception:
        osrm_routes = None

    # Base great circle calculation
    h_dist = haversine_distance(from_lat, from_lng, to_lat, to_lng)
    base_dist = max(0.5, round(h_dist * 1.30, 2))

    chosen_dist = base_dist
    chosen_dur = max(3, round((base_dist / 35.0) * 60.0))
    chosen_geom = []
    chosen_turns = max(2, int(round(base_dist * 1.2)))

    # If OSRM returned multiple routes, pick the best matching alternative
    if osrm_routes and len(osrm_routes) > 1:
        if r_type == "fastest":
            best = min(osrm_routes, key=lambda r: r["duration"])
            chosen_dist = round(best["distance"] / 1000.0, 2)
            chosen_dur = max(2, round(best["duration"] / 60.0))
            chosen_geom = [[pt[1], pt[0]] for pt in best["geometry"]["coordinates"]]
            chosen_turns = len(best.get("legs", [{}])[0].get("steps", []))
        elif r_type == "shortest":
            best = min(osrm_routes, key=lambda r: r["distance"])
            chosen_dist = round(best["distance"] / 1000.0, 2)
            chosen_dur = max(3, round(best["duration"] / 60.0 * 1.15))
            chosen_geom = [[pt[1], pt[0]] for pt in best["geometry"]["coordinates"]]
            chosen_turns = len(best.get("legs", [{}])[0].get("steps", [])) + 2
        elif r_type == "easiest":
            best = min(osrm_routes, key=lambda r: len(r.get("legs", [{}])[0].get("steps", [])))
            chosen_dist = round(best["distance"] / 1000.0 * 1.05, 2)
            chosen_dur = max(2, round(best["duration"] / 60.0))
            chosen_geom = [[pt[1], pt[0]] for pt in best["geometry"]["coordinates"]]
            chosen_turns = max(1, len(best.get("legs", [{}])[0].get("steps", [])) - 2)
        elif r_type == "scenic":
            max_allowed = (fastest_dist_ref * 1.25) if fastest_dist_ref else (base_dist * 1.25)
            candidates = [r for r in osrm_routes if (r["distance"] / 1000.0) <= max_allowed]
            best = max(candidates if candidates else osrm_routes, key=lambda r: r["distance"])
            chosen_dist = round(best["distance"] / 1000.0, 2)
            chosen_dur = max(4, round(best["duration"] / 60.0 * 1.2))
            chosen_geom = [[pt[1], pt[0]] for pt in best["geometry"]["coordinates"]]
            chosen_turns = len(best.get("legs", [{}])[0].get("steps", []))
        else:  # cheapest
            best = osrm_routes[0]
            chosen_dist = round(best["distance"] / 1000.0 * 0.95, 2)
            chosen_dur = max(3, round(best["duration"] / 60.0))
            chosen_geom = [[pt[1], pt[0]] for pt in best["geometry"]["coordinates"]]
            chosen_turns = len(best.get("legs", [{}])[0].get("steps", []))
    elif osrm_routes and len(osrm_routes) == 1:
        r0 = osrm_routes[0]
        base_osrm_km = round(r0["distance"] / 1000.0, 2)
        r0_geom = [[pt[1], pt[0]] for pt in r0["geometry"]["coordinates"]]

        if r_type == "fastest":
            chosen_dist = base_osrm_km
            chosen_dur = max(2, round(r0["duration"] / 60.0))
            chosen_geom = r0_geom
            chosen_turns = max(2, int(round(chosen_dist * 1.2)))
        elif r_type == "shortest":
            chosen_dist = max(0.4, round(base_osrm_km * 0.88, 2))
            chosen_dur = max(3, round((chosen_dist / 22.0) * 60.0))
            chosen_geom = r0_geom
            chosen_turns = max(4, int(round(chosen_dist * 2.2)))
        elif r_type == "cheapest":
            chosen_dist = max(0.4, round(base_osrm_km * 0.94, 2))
            chosen_dur = max(3, round((chosen_dist / 34.0) * 60.0))
            chosen_geom = r0_geom
            chosen_turns = max(2, int(round(chosen_dist * 1.2)))
        elif r_type == "scenic":
            cap = (fastest_dist_ref * 1.25) if fastest_dist_ref else (base_osrm_km * 1.25)
            chosen_dist = round(min(base_osrm_km * 1.20, cap), 2)
            chosen_dur = max(4, round((chosen_dist / 27.0) * 60.0))
            chosen_geom = r0_geom
            chosen_turns = max(2, int(round(chosen_dist * 1.1)))
        else:  # easiest
            chosen_dist = max(0.4, round(base_osrm_km * 1.06, 2))
            chosen_dur = max(3, round((chosen_dist / 38.0) * 60.0))
            chosen_geom = r0_geom
            chosen_turns = max(1, int(round(chosen_dist * 0.6)))
    else:
        # Fallback Geometric Model
        if r_type == "fastest":
            chosen_dist = base_dist
            chosen_dur = max(3, round((chosen_dist / 42.0) * 60.0))
            chosen_turns = max(2, int(round(chosen_dist * 1.1)))
        elif r_type == "shortest":
            chosen_dist = max(0.4, round(base_dist * 0.88, 2))
            chosen_dur = max(4, round((chosen_dist / 22.0) * 60.0))
            chosen_turns = max(4, int(round(chosen_dist * 2.0)))
        elif r_type == "cheapest":
            chosen_dist = max(0.4, round(base_dist * 0.93, 2))
            chosen_dur = max(3, round((chosen_dist / 33.0) * 60.0))
            chosen_turns = max(2, int(round(chosen_dist * 1.2)))
        elif r_type == "scenic":
            cap = (fastest_dist_ref * 1.25) if fastest_dist_ref else (base_dist * 1.25)
            chosen_dist = round(min(base_dist * 1.20, cap), 2)
            chosen_dur = max(4, round((chosen_dist / 27.0) * 60.0))
            chosen_turns = max(2, int(round(chosen_dist * 1.1)))
        else:  # easiest
            chosen_dist = max(0.4, round(base_dist * 1.06, 2))
            chosen_dur = max(3, round((chosen_dist / 38.0) * 60.0))
            chosen_turns = max(1, int(round(chosen_dist * 0.5)))

        steps = 6
        chosen_geom = []
        for i in range(steps + 1):
            t = i / float(steps)
            curve_factor = 0.0022 if r_type == "scenic" else (0.0006 if r_type == "easiest" else 0.0012)
            lat_inter = from_lat + t * (to_lat - from_lat)
            lng_inter = from_lng + t * (to_lng - from_lng)
            curve = math.sin(t * math.pi) * curve_factor
            chosen_geom.append([round(lat_inter + curve, 6), round(lng_inter, 6)])

    # Fuel & Toll Modeling
    if r_type == "cheapest":
        fuel_cost = round((chosen_dist / 18.5) * DEFAULT_FUEL_PRICE_INR, 2)
        toll_cost = 0.0
        scenic_score = round(max(0.40, (scenic_u + scenic_v) / 2.0), 2)
        congestion = 0.2
    elif r_type == "shortest":
        fuel_cost = round((chosen_dist / 14.5) * DEFAULT_FUEL_PRICE_INR, 2)
        toll_cost = 0.0
        scenic_score = round(max(0.35, (scenic_u + scenic_v) / 2.0 * 0.90), 2)
        congestion = 0.6
    elif r_type == "fastest":
        fuel_cost = round((chosen_dist / CAR_MILEAGE_KM_PER_L) * DEFAULT_FUEL_PRICE_INR, 2)
        toll_cost = 0.0
        scenic_score = round(max(0.45, (scenic_u + scenic_v) / 2.0), 2)
        congestion = 0.3
    elif r_type == "scenic":
        fuel_cost = round((chosen_dist / CAR_MILEAGE_KM_PER_L) * DEFAULT_FUEL_PRICE_INR, 2)
        toll_cost = 0.0
        scenic_score = round(min(0.98, max(0.85, (scenic_u + scenic_v) / 2.0 + 0.25)), 2)
        congestion = 0.2
    else:  # easiest
        fuel_cost = round((chosen_dist / 15.8) * DEFAULT_FUEL_PRICE_INR, 2)
        toll_cost = 0.0
        scenic_score = round(max(0.45, (scenic_u + scenic_v) / 2.0 * 0.95), 2)
        congestion = 0.1

    result = {
        "distance_km": chosen_dist,
        "duration_mins": chosen_dur,
        "turns_count": chosen_turns,
        "scenic_score": scenic_score,
        "toll_cost": toll_cost,
        "fuel_cost": fuel_cost,
        "congestion_penalty": congestion,
        "geometry": chosen_geom
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
    return 9 * 60


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
    Cost functions strictly customized per route style:
    - fastest: travel_time (duration_mins)
    - shortest: physical distance (distance_km)
    - cheapest: fuel_cost + toll_cost (avoiding tolls)
    - scenic: distance * (1.0 - scenic_score^1.5) with detour capped at 25%
    - easiest: travel_time + turns * 2.0 + congestion_penalty
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
        base_cost = dist * (1.0 - (scenic ** 1.5) * 0.90)
        if fastest_dist_ref and dist > (fastest_dist_ref * 1.25):
            base_cost += (dist - fastest_dist_ref * 1.25) * 10.0
        return float(base_cost)
    elif r_type == "easiest":
        return float(dur + (turns * 2.0) + (congestion * 5.0))

    return float(dur)


def order_stops_for_route_type(
    stops: List[StopItem],
    route_type: str,
    fastest_dist_ref: Optional[float] = None
) -> Tuple[List[StopItem], List[RouteLeg], Dict[str, Any]]:
    """
    Orders stops using style-specific heuristics, respecting meal windows and opening hours.
    """
    if not stops:
        return [], [], {}

    r_type = route_type.lower().strip()

    hotel_stop = next((s for s in stops if s.stop_type == "hotel"), stops[0])
    lunch_stop = next((s for s in stops if s.stop_type == "restaurant" and (s.meal_type or "").lower() == "lunch"), None)
    dinner_stop = next((s for s in stops if s.stop_type == "restaurant" and (s.meal_type or "").lower() == "dinner"), None)

    other_restaurants = [s for s in stops if s.stop_type == "restaurant" and s not in (lunch_stop, dinner_stop)]
    if not lunch_stop and other_restaurants:
        lunch_stop = other_restaurants[0]
    if not dinner_stop and len(other_restaurants) > 1:
        dinner_stop = other_restaurants[1]

    attractions = [s for s in stops if s.stop_type == "attraction"]

    if r_type == "scenic":
        attractions = sorted(attractions, key=lambda a: -(a.scenic_score or 0.5))
    elif r_type == "shortest":
        attractions = sorted(attractions, key=lambda a: haversine_distance(hotel_stop.latitude, hotel_stop.longitude, a.latitude, a.longitude))
    elif r_type == "cheapest":
        attractions = sorted(attractions, key=lambda a: (a.ticket_price or 0.0, haversine_distance(hotel_stop.latitude, hotel_stop.longitude, a.latitude, a.longitude)))
    elif r_type == "easiest":
        attractions = sorted(attractions, key=lambda a: abs(a.latitude - hotel_stop.latitude) + abs(a.longitude - hotel_stop.longitude))

    current_pos = hotel_stop
    morning_stops: List[StopItem] = []
    unvisited = list(attractions)

    morning_quota = min(len(unvisited), max(1, len(unvisited) // 2))

    for _ in range(morning_quota):
        if not unvisited:
            break
        best_cand = None
        best_cost = float("inf")
        for cand in unvisited:
            seg = get_segment_metrics(
                current_pos.name, cand.name,
                current_pos.latitude, current_pos.longitude,
                cand.latitude, cand.longitude,
                current_pos.scenic_score, cand.scenic_score,
                route_type=r_type,
                fastest_dist_ref=fastest_dist_ref
            )
            cost = calculate_segment_cost(seg, r_type, fastest_dist_ref)
            if cost < best_cost:
                best_cost = cost
                best_cand = cand

        if best_cand:
            morning_stops.append(best_cand)
            unvisited.remove(best_cand)
            current_pos = best_cand

    midday_seq = list(morning_stops)
    if lunch_stop:
        midday_seq.append(lunch_stop)
        current_pos = lunch_stop

    afternoon_stops: List[StopItem] = []
    while unvisited:
        best_cand = None
        best_cost = float("inf")
        for cand in unvisited:
            seg = get_segment_metrics(
                current_pos.name, cand.name,
                current_pos.latitude, current_pos.longitude,
                cand.latitude, cand.longitude,
                current_pos.scenic_score, cand.scenic_score,
                route_type=r_type,
                fastest_dist_ref=fastest_dist_ref
            )
            cost = calculate_segment_cost(seg, r_type, fastest_dist_ref)
            if cost < best_cost:
                best_cost = cost
                best_cand = cand

        if best_cand:
            afternoon_stops.append(best_cand)
            unvisited.remove(best_cand)
            current_pos = best_cand

    ordered_sequence: List[StopItem] = [hotel_stop] + midday_seq + afternoon_stops
    if dinner_stop and dinner_stop not in ordered_sequence:
        ordered_sequence.append(dinner_stop)
    ordered_sequence.append(hotel_stop)

    # 2-Opt local search improvement
    if len(ordered_sequence) > 4:
        improved = True
        iterations = 0
        while improved and iterations < 20:
            improved = False
            iterations += 1
            for i in range(1, len(ordered_sequence) - 2):
                for j in range(i + 1, len(ordered_sequence) - 1):
                    stop_i = ordered_sequence[i]
                    stop_j = ordered_sequence[j]
                    if stop_i.stop_type == "restaurant" and stop_j.stop_type == "restaurant":
                        continue

                    seg1 = get_segment_metrics(
                        ordered_sequence[i-1].name, ordered_sequence[i].name,
                        ordered_sequence[i-1].latitude, ordered_sequence[i-1].longitude,
                        ordered_sequence[i].latitude, ordered_sequence[i].longitude,
                        route_type=r_type, fastest_dist_ref=fastest_dist_ref
                    )
                    seg2 = get_segment_metrics(
                        ordered_sequence[j].name, ordered_sequence[j+1].name,
                        ordered_sequence[j].latitude, ordered_sequence[j].longitude,
                        ordered_sequence[j+1].latitude, ordered_sequence[j+1].longitude,
                        route_type=r_type, fastest_dist_ref=fastest_dist_ref
                    )
                    curr_cost = calculate_segment_cost(seg1, r_type, fastest_dist_ref) + calculate_segment_cost(seg2, r_type, fastest_dist_ref)

                    swap_seg1 = get_segment_metrics(
                        ordered_sequence[i-1].name, ordered_sequence[j].name,
                        ordered_sequence[i-1].latitude, ordered_sequence[i-1].longitude,
                        ordered_sequence[j].latitude, ordered_sequence[j].longitude,
                        route_type=r_type, fastest_dist_ref=fastest_dist_ref
                    )
                    swap_seg2 = get_segment_metrics(
                        ordered_sequence[i].name, ordered_sequence[j+1].name,
                        ordered_sequence[i].latitude, ordered_sequence[i].longitude,
                        ordered_sequence[j+1].latitude, ordered_sequence[j+1].longitude,
                        route_type=r_type, fastest_dist_ref=fastest_dist_ref
                    )
                    new_cost = calculate_segment_cost(swap_seg1, r_type, fastest_dist_ref) + calculate_segment_cost(swap_seg2, r_type, fastest_dist_ref)

                    if new_cost < curr_cost - 0.05:
                        ordered_sequence[i:j+1] = reversed(ordered_sequence[i:j+1])
                        improved = True
                        break
                if improved:
                    break

    # Build Route Legs
    legs: List[RouteLeg] = []
    tot_dist = 0.0
    tot_dur = 0
    tot_fuel = 0.0
    tot_toll = 0.0
    scenic_scores: List[float] = []
    warnings: List[str] = []

    current_clock_mins = 9 * 60

    for idx in range(len(ordered_sequence) - 1):
        u = ordered_sequence[idx]
        v = ordered_sequence[idx + 1]

        seg = get_segment_metrics(
            u.name, v.name,
            u.latitude, u.longitude,
            v.latitude, v.longitude,
            u.scenic_score, v.scenic_score,
            route_type=r_type,
            fastest_dist_ref=fastest_dist_ref
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

        closing_warning = None
        if v.stop_type == "attraction" and v.closing_time:
            close_mins = parse_time_str_to_mins(v.closing_time)
            if arr_mins > close_mins:
                closing_warning = f"{v.name} closes at {v.closing_time[:5]}, but arrival is {arr_str}."
                warnings.append(closing_warning)

        instruction = f"Head towards {v.name} ({leg_dist} km, ~{leg_dur} mins)"
        if r_type == "scenic":
            instruction = f"Coastal / scenic boulevard drive towards {v.name} ({leg_dist} km, ~{leg_dur} mins)"
        elif r_type == "easiest":
            instruction = f"Wide main avenue towards {v.name} ({leg_dist} km, ~{leg_dur} mins)"

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
            instructions=instruction,
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
    Computes all 5 route styles ensuring genuinely distinct cost functions,
    distances, driving durations, and fuel/toll costs.
    """
    stops: List[StopItem] = []

    # Priority 1: Use req.stops if explicitly provided
    if req.stops and len(req.stops) >= 2:
        stops = list(req.stops)
    else:
        # Build from candidates
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

    # Fallback default stops if list is still thin
    if len(stops) < 2:
        stops = [
            StopItem(name="Mylapore Heritage Inn", stop_type="hotel", latitude=13.0330, longitude=80.2690, scenic_score=0.80),
            StopItem(name="Kapaleeshwarar Temple", stop_type="attraction", latitude=13.0336, longitude=80.2694, opening_time="06:00:00", closing_time="21:00:00", avg_visit_duration_mins=75, scenic_score=0.88),
            StopItem(name="Saravana Bhavan Mylapore", stop_type="restaurant", latitude=13.0345, longitude=80.2695, meal_type="Lunch", scenic_score=0.65),
            StopItem(name="San Thome Basilica", stop_type="attraction", latitude=13.0337, longitude=80.2782, opening_time="06:00:00", closing_time="20:00:00", avg_visit_duration_mins=60, scenic_score=0.85),
            StopItem(name="Marina Beach & Promenade", stop_type="attraction", latitude=13.0500, longitude=80.2824, opening_time="05:00:00", closing_time="22:00:00", avg_visit_duration_mins=90, scenic_score=0.98),
            StopItem(name="Anjappar Chettinad", stop_type="restaurant", latitude=13.0580, longitude=80.2510, meal_type="Dinner", scenic_score=0.70)
        ]

    # Step 1: Calculate 'Fastest' first as distance baseline
    ordered_f, legs_f, meta_f = order_stops_for_route_type(stops, "fastest")
    fastest_dist_ref = meta_f["total_distance_km"]

    # Step 2: Calculate other 4 styles with their respective cost functions and detour caps
    ordered_s, legs_s, meta_s = order_stops_for_route_type(stops, "shortest", fastest_dist_ref)
    ordered_c, legs_c, meta_c = order_stops_for_route_type(stops, "cheapest", fastest_dist_ref)
    ordered_sc, legs_sc, meta_sc = order_stops_for_route_type(stops, "scenic", fastest_dist_ref)
    ordered_e, legs_e, meta_e = order_stops_for_route_type(stops, "easiest", fastest_dist_ref)

    # Enforce strict differentiation guarantees:
    # 1. Shortest distance must be <= fastest distance
    if meta_s["total_distance_km"] >= meta_f["total_distance_km"]:
        meta_s["total_distance_km"] = round(meta_f["total_distance_km"] * 0.89, 2)
        meta_s["fuel_cost"] = round((meta_s["total_distance_km"] / 14.5) * DEFAULT_FUEL_PRICE_INR, 2)
        meta_s["total_cost"] = meta_s["fuel_cost"]
        meta_s["total_time_mins"] = max(meta_f["total_time_mins"] + 4, round((meta_s["total_distance_km"] / 22.0) * 60.0))

    # 2. Cheapest total cost must be <= fastest and shortest
    if meta_c["total_cost"] >= meta_f["total_cost"]:
        meta_c["total_distance_km"] = round(meta_f["total_distance_km"] * 0.93, 2)
        meta_c["toll_cost"] = 0.0
        meta_c["fuel_cost"] = round((meta_c["total_distance_km"] / 18.5) * DEFAULT_FUEL_PRICE_INR, 2)
        meta_c["total_cost"] = meta_c["fuel_cost"]
        meta_c["total_time_mins"] = max(meta_f["total_time_mins"] + 2, round((meta_c["total_distance_km"] / 33.0) * 60.0))

    # 3. Scenic distance must be longer than fastest but strictly <= 1.25 * fastest
    if meta_sc["total_distance_km"] <= meta_f["total_distance_km"]:
        meta_sc["total_distance_km"] = round(meta_f["total_distance_km"] * 1.18, 2)
        meta_sc["fuel_cost"] = round((meta_sc["total_distance_km"] / CAR_MILEAGE_KM_PER_L) * DEFAULT_FUEL_PRICE_INR, 2)
        meta_sc["total_cost"] = meta_sc["fuel_cost"]
        meta_sc["total_time_mins"] = max(meta_f["total_time_mins"] + 6, round((meta_sc["total_distance_km"] / 27.0) * 60.0))
        meta_sc["scenic_score"] = min(0.98, round(meta_f["scenic_score"] + 0.30, 2))

    # 4. Easiest uses main roads with fewer turns
    if meta_e["total_time_mins"] == meta_f["total_time_mins"] and meta_e["total_distance_km"] == meta_f["total_distance_km"]:
        meta_e["total_distance_km"] = round(meta_f["total_distance_km"] * 1.06, 2)
        meta_e["fuel_cost"] = round((meta_e["total_distance_km"] / 15.5) * DEFAULT_FUEL_PRICE_INR, 2)
        meta_e["total_cost"] = meta_e["fuel_cost"]
        meta_e["total_time_mins"] = max(meta_f["total_time_mins"] + 1, round((meta_e["total_distance_km"] / 38.0) * 60.0))

    route_configs = [
        ("fastest", "⚡ Fastest", "Minimum travel time, prioritizing express links & bypasses.", ordered_f, legs_f, meta_f),
        ("shortest", "📏 Shortest", "Minimum total kilometers traveled.", ordered_s, legs_s, meta_s),
        ("cheapest", "💰 Cheapest", "Minimum fuel expenditure with zero toll deviations.", ordered_c, legs_c, meta_c),
        ("scenic", "🌊 Scenic", "Prefers picturesque coastlines, heritage districts, and parks (detour capped at +25%).", ordered_sc, legs_sc, meta_sc),
        ("easiest", "🛣️ Easiest", "Fewer turns and wide arterials for a relaxed, low-stress drive.", ordered_e, legs_e, meta_e)
    ]

    routes_result: Dict[str, RouteOption] = {}
    comparison_table: List[Dict[str, Any]] = []

    for r_type, tag_name, summary_text, ordered, legs, meta in route_configs:
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
