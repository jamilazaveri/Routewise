package com.routewise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.routewise.dto.BudgetReallocateRequest;
import com.routewise.dto.ReallocateResponse;
import com.routewise.dto.TripPlanRequest;
import com.routewise.dto.TripPlanResponse;
import com.routewise.entity.Attraction;
import com.routewise.entity.Hotel;
import com.routewise.entity.Restaurant;
import com.routewise.entity.Route;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class PythonMicroserviceClient {

    private static final Logger log = LoggerFactory.getLogger(PythonMicroserviceClient.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${routewise.microservice.url:http://localhost:8000}")
    private String microserviceUrl;

    public PythonMicroserviceClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Calls the FastAPI microservice to optimize the trip plan and greedy budget-fitting.
     */
    public TripPlanResponse optimizeTrip(
            TripPlanRequest request,
            Route route,
            List<Hotel> hotels,
            List<Restaurant> restaurants,
            List<Attraction> attractions
    ) {
        String endpoint = microserviceUrl + "/optimize-trip";

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("start_city", request.getStartCity());
            payload.put("destination_city", request.getDestinationCity());
            payload.put("num_days", request.getNumDays());
            payload.put("num_travellers", request.getNumTravellers());
            payload.put("transport_mode", request.getTransportMode());
            payload.put("total_budget_min", request.getTotalBudgetMin());
            payload.put("total_budget_max", request.getTotalBudgetMax());

            Map<String, Object> shares = new HashMap<>();
            shares.put("accommodation", request.getShareAccommodation());
            shares.put("food", request.getShareFood());
            shares.put("transport", request.getShareTransport());
            shares.put("sightseeing", request.getShareSightseeing());
            payload.put("shares", shares);

            payload.put("route_distance_km", route != null ? route.getDistanceKm() : new BigDecimal("250.00"));
            payload.put("route_toll_cost", route != null ? route.getTollCost() : BigDecimal.ZERO);

            // Candidate hotels
            List<Map<String, Object>> hotelList = new ArrayList<>();
            for (Hotel h : hotels) {
                Map<String, Object> hm = new HashMap<>();
                hm.put("id", h.getId());
                hm.put("name", h.getName());
                hm.put("tier", h.getTier());
                hm.put("price_per_night", h.getPricePerNight());
                hm.put("rating", h.getRating());
                hm.put("address", h.getAddress());
                hm.put("amenities", h.getAmenities());
                hotelList.add(hm);
            }
            payload.put("hotels", hotelList);

            // Candidate restaurants
            List<Map<String, Object>> restList = new ArrayList<>();
            for (Restaurant r : restaurants) {
                Map<String, Object> rm = new HashMap<>();
                rm.put("id", r.getId());
                rm.put("name", r.getName());
                rm.put("cuisine", r.getCuisine());
                rm.put("avg_cost_per_person", r.getAvgCostPerPerson());
                rm.put("rating", r.getRating());
                rm.put("meal_type", r.getMealType());
                rm.put("address", r.getAddress());
                restList.add(rm);
            }
            payload.put("restaurants", restList);

            // Candidate attractions
            List<Map<String, Object>> attrList = new ArrayList<>();
            for (Attraction a : attractions) {
                Map<String, Object> am = new HashMap<>();
                am.put("id", a.getId());
                am.put("name", a.getName());
                am.put("category", a.getCategory());
                am.put("ticket_price", a.getTicketPrice());
                am.put("rating", a.getRating());
                am.put("avg_visit_duration_mins", a.getAvgVisitDurationMins());
                am.put("opening_time", a.getOpeningTime() != null ? a.getOpeningTime().toString() : "09:00:00");
                am.put("closing_time", a.getClosingTime() != null ? a.getClosingTime().toString() : "18:00:00");
                am.put("description", a.getDescription());
                attrList.add(am);
            }
            payload.put("attractions", attrList);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            log.info("Dispatching optimization request to Python Microservice: {}", endpoint);
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseMicroserviceResponse(response.getBody(), request, route);
            }
        } catch (Exception ex) {
            log.warn("Python microservice call failed ({}), activating fallback optimization engine: {}", endpoint, ex.getMessage());
        }

        // Fallback engine if Python service is recovering
        return runFallbackOptimization(request, route, hotels, restaurants, attractions);
    }

    /**
     * Feature 5: Budget Reallocation call to Python Microservice.
     */
    public ReallocateResponse reallocateBudget(BudgetReallocateRequest request) {
        String endpoint = microserviceUrl + "/reallocate-budget";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<BudgetReallocateRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ReallocateResponse> response = restTemplate.postForEntity(endpoint, entity, ReallocateResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception ex) {
            log.warn("Microservice reallocate call failed: {}. Executing local fallback.", ex.getMessage());
        }

        // Local Fallback calculation
        return computeLocalReallocation(request);
    }

    private TripPlanResponse parseMicroserviceResponse(String jsonStr, TripPlanRequest req, Route route) {
        TripPlanResponse res = new TripPlanResponse();
        try {
            JsonNode root = objectMapper.readTree(jsonStr);

            res.setIsFeasible(root.path("is_feasible").asBoolean(true));
            res.setStatusMessage(root.path("status_message").asText("Trip optimized successfully"));
            res.setStartCity(req.getStartCity());
            res.setDestinationCity(req.getDestinationCity());
            res.setNumDays(req.getNumDays());
            res.setNumTravellers(req.getNumTravellers());
            res.setTransportMode(req.getTransportMode());
            res.setRoomsNeeded(root.path("rooms_needed").asInt(1));

            if (route != null) {
                res.setRouteDistanceKm(route.getDistanceKm());
                res.setRouteTollCost(route.getTollCost());
                res.setHighwayName(route.getHighwayName());
            }

            // Category Budgets
            JsonNode catBudgets = root.path("category_budgets");
            Map<String, BigDecimal> catMap = new HashMap<>();
            catBudgets.fields().forEachRemaining(entry -> catMap.put(entry.getKey(), BigDecimal.valueOf(entry.getValue().asDouble())));
            res.setCategoryBudgets(catMap);

            // Cost Breakdown
            JsonNode cbNode = root.path("cost_breakdown");
            TripPlanResponse.CostBreakdownDto cb = new TripPlanResponse.CostBreakdownDto();
            cb.setAccommodation(BigDecimal.valueOf(cbNode.path("accommodation").asDouble()));
            cb.setFood(BigDecimal.valueOf(cbNode.path("food").asDouble()));
            cb.setFuel(BigDecimal.valueOf(cbNode.path("fuel").asDouble()));
            cb.setTolls(BigDecimal.valueOf(cbNode.path("tolls").asDouble()));
            cb.setSightseeing(BigDecimal.valueOf(cbNode.path("sightseeing").asDouble()));
            cb.setMiscellaneous(BigDecimal.valueOf(cbNode.path("miscellaneous").asDouble()));
            cb.setTotal(BigDecimal.valueOf(cbNode.path("total").asDouble()));
            cb.setBudgetMax(BigDecimal.valueOf(cbNode.path("budget_max").asDouble()));
            cb.setAmountLeft(BigDecimal.valueOf(cbNode.path("amount_left").asDouble()));
            res.setCostBreakdown(cb);

            // Selected Hotel
            JsonNode hotelNode = root.path("selected_hotel");
            if (!hotelNode.isMissingNode() && !hotelNode.isNull()) {
                TripPlanResponse.HotelSummaryDto hd = new TripPlanResponse.HotelSummaryDto();
                hd.setId(hotelNode.path("id").asLong());
                hd.setName(hotelNode.path("name").asText());
                hd.setTier(hotelNode.path("tier").asText("Mid-Range"));
                hd.setPricePerNight(BigDecimal.valueOf(hotelNode.path("price_per_night").asDouble()));
                hd.setRating(BigDecimal.valueOf(hotelNode.path("rating").asDouble()));
                hd.setAddress(hotelNode.path("address").asText(""));
                hd.setAmenities(hotelNode.path("amenities").asText(""));
                res.setSelectedHotel(hd);
            }

            // Selected/Recommended Restaurants
            JsonNode restNodes = root.path("selected_restaurants");
            if (restNodes.isArray()) {
                List<TripPlanResponse.RestaurantSummaryDto> restList = new ArrayList<>();
                for (JsonNode r : restNodes) {
                    TripPlanResponse.RestaurantSummaryDto rd = new TripPlanResponse.RestaurantSummaryDto();
                    rd.setId(r.path("id").asLong());
                    rd.setName(r.path("name").asText());
                    rd.setCuisine(r.path("cuisine").asText());
                    rd.setAvgCostPerPerson(BigDecimal.valueOf(r.path("avg_cost_per_person").asDouble()));
                    rd.setRating(BigDecimal.valueOf(r.path("rating").asDouble()));
                    rd.setMealType(r.path("meal_type").asText("All"));
                    rd.setAddress(r.path("address").asText(""));
                    restList.add(rd);
                }
                res.setRecommendedRestaurants(restList);
            }

            // Selected Attractions
            JsonNode attrNodes = root.path("selected_attractions");
            if (attrNodes.isArray()) {
                List<TripPlanResponse.AttractionSummaryDto> attrList = new ArrayList<>();
                for (JsonNode a : attrNodes) {
                    TripPlanResponse.AttractionSummaryDto ad = new TripPlanResponse.AttractionSummaryDto();
                    ad.setId(a.path("id").asLong());
                    ad.setName(a.path("name").asText());
                    ad.setCategory(a.path("category").asText());
                    ad.setTicketPrice(BigDecimal.valueOf(a.path("ticket_price").asDouble()));
                    ad.setRating(BigDecimal.valueOf(a.path("rating").asDouble()));
                    ad.setAvgVisitDurationMins(a.path("avg_visit_duration_mins").asInt(90));
                    ad.setOpeningTime(a.path("opening_time").asText());
                    ad.setClosingTime(a.path("closing_time").asText());
                    ad.setDescription(a.path("description").asText(""));
                    attrList.add(ad);
                }
                res.setRecommendedAttractions(attrList);
            }

            // Itinerary Day Plans
            JsonNode itinNodes = root.path("itinerary");
            if (itinNodes.isArray()) {
                List<TripPlanResponse.DayPlanDto> days = new ArrayList<>();
                for (JsonNode d : itinNodes) {
                    TripPlanResponse.DayPlanDto dp = new TripPlanResponse.DayPlanDto();
                    dp.setDayNumber(d.path("day_number").asInt());
                    dp.setDateLabel(d.path("date_label").asText("Day " + dp.getDayNumber()));
                    dp.setDayTotalCost(BigDecimal.valueOf(d.path("day_total_cost").asDouble()));

                    JsonNode itemNodes = d.path("items");
                    if (itemNodes.isArray()) {
                        List<TripPlanResponse.DayPlanItemDto> items = new ArrayList<>();
                        for (JsonNode it : itemNodes) {
                            TripPlanResponse.DayPlanItemDto item = new TripPlanResponse.DayPlanItemDto();
                            item.setItemOrder(it.path("item_order").asInt());
                            item.setItemType(it.path("item_type").asText());
                            item.setTitle(it.path("title").asText());
                            item.setStartTime(it.path("start_time").asText());
                            item.setEndTime(it.path("end_time").asText());
                            item.setCost(BigDecimal.valueOf(it.path("cost").asDouble()));
                            item.setNotes(it.path("notes").asText(""));
                            if (it.has("reference_id") && !it.get("reference_id").isNull()) {
                                item.setReferenceId(it.get("reference_id").asLong());
                            }
                            items.add(item);
                        }
                        dp.setItems(items);
                    }
                    days.add(dp);
                }
                res.setItinerary(days);
            }

            // Cheapest Alternative if infeasible
            JsonNode caNode = root.path("cheapest_alternative");
            if (!caNode.isMissingNode() && !caNode.isNull()) {
                TripPlanResponse.CheapestAlternativeDto ca = new TripPlanResponse.CheapestAlternativeDto();
                ca.setSuggestedBudget(BigDecimal.valueOf(caNode.path("suggested_budget").asDouble()));
                ca.setTransportMode(caNode.path("transport_mode").asText());
                ca.setHotelName(caNode.path("hotel_name").asText());
                ca.setHotelTier(caNode.path("hotel_tier").asText());
                ca.setEstimatedCost(BigDecimal.valueOf(caNode.path("estimated_cost").asDouble()));

                List<String> tips = new ArrayList<>();
                JsonNode tipsNode = caNode.path("savings_tips");
                if (tipsNode.isArray()) {
                    for (JsonNode t : tipsNode) tips.add(t.asText());
                }
                ca.setSavingsTips(tips);
                res.setCheapestAlternative(ca);
            }

        } catch (Exception e) {
            log.error("Failed to parse Python service response: {}", e.getMessage(), e);
        }
        return res;
    }

    private TripPlanResponse runFallbackOptimization(
            TripPlanRequest req, Route route, List<Hotel> hotels, List<Restaurant> restaurants, List<Attraction> attractions) {
        // Fallback calculations for robust offline / decoupling support
        TripPlanResponse res = new TripPlanResponse();
        res.setStartCity(req.getStartCity());
        res.setDestinationCity(req.getDestinationCity());
        res.setNumDays(req.getNumDays());
        res.setNumTravellers(req.getNumTravellers());
        res.setTransportMode(req.getTransportMode());

        BigDecimal distance = route != null ? route.getDistanceKm() : new BigDecimal("250.00");
        BigDecimal toll = route != null ? route.getTollCost() : BigDecimal.ZERO;
        res.setRouteDistanceKm(distance);
        res.setRouteTollCost(toll);

        int rooms = (int) Math.ceil(req.getNumTravellers() / 2.0);
        res.setRoomsNeeded(rooms);

        // Budget split
        BigDecimal maxB = req.getTotalBudgetMax();
        Map<String, BigDecimal> catBudgets = new HashMap<>();
        catBudgets.put("accommodation", maxB.multiply(req.getShareAccommodation()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        catBudgets.put("food", maxB.multiply(req.getShareFood()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        catBudgets.put("transport", maxB.multiply(req.getShareTransport()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        catBudgets.put("sightseeing", maxB.multiply(req.getShareSightseeing()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        res.setCategoryBudgets(catBudgets);

        // Pick lowest cost hotel
        Hotel selectedH = hotels.stream().min(Comparator.comparing(Hotel::getPricePerNight)).orElse(null);
        BigDecimal hotelStay = selectedH != null ? selectedH.getPricePerNight().multiply(BigDecimal.valueOf(rooms * (req.getNumDays() - 1))) : BigDecimal.ZERO;

        // Transport
        BigDecimal fuel = distance.multiply(BigDecimal.valueOf(2 * 103.0 / 15.0)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tollsTotal = toll.multiply(BigDecimal.valueOf(2));

        // Food
        BigDecimal foodTotal = BigDecimal.valueOf(180L * 3 * req.getNumDays() * req.getNumTravellers());
        BigDecimal sightTotal = BigDecimal.valueOf(50L * req.getNumTravellers());
        BigDecimal misc = BigDecimal.valueOf(300);

        BigDecimal total = hotelStay.add(fuel).add(tollsTotal).add(foodTotal).add(sightTotal).add(misc);
        BigDecimal left = maxB.subtract(total);

        TripPlanResponse.CostBreakdownDto cb = new TripPlanResponse.CostBreakdownDto();
        cb.setAccommodation(hotelStay);
        cb.setFuel(fuel);
        cb.setTolls(tollsTotal);
        cb.setFood(foodTotal);
        cb.setSightseeing(sightTotal);
        cb.setMiscellaneous(misc);
        cb.setTotal(total);
        cb.setBudgetMax(maxB);
        cb.setAmountLeft(left);
        res.setCostBreakdown(cb);

        boolean fits = total.compareTo(maxB) <= 0;
        res.setIsFeasible(fits);
        res.setStatusMessage(fits ? "Trip planned within estimated limits" : "Budget too low for requested options");

        return res;
    }

    private ReallocateResponse computeLocalReallocation(BudgetReallocateRequest req) {
        String cat = req.getChangedCategory().toLowerCase().trim();
        BigDecimal newShare = req.getNewShare();
        BigDecimal remaining = BigDecimal.valueOf(100.0).subtract(newShare);

        Map<String, BigDecimal> current = new HashMap<>();
        current.put("accommodation", req.getCurrentShares().getAccommodation());
        current.put("food", req.getCurrentShares().getFood());
        current.put("transport", req.getCurrentShares().getTransport());
        current.put("sightseeing", req.getCurrentShares().getSightseeing());

        current.put(cat, newShare);
        List<String> others = new ArrayList<>(Arrays.asList("accommodation", "food", "transport", "sightseeing"));
        others.remove(cat);

        BigDecimal otherSum = others.stream().map(current::get).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (otherSum.compareTo(BigDecimal.ZERO) > 0) {
            for (String o : others) {
                BigDecimal rebalanced = current.get(o).multiply(remaining).divide(otherSum, 2, RoundingMode.HALF_UP);
                current.put(o, rebalanced);
            }
        }

        Map<String, BigDecimal> catBudgets = new HashMap<>();
        for (Map.Entry<String, BigDecimal> entry : current.entrySet()) {
            catBudgets.put(entry.getKey(), req.getTotalBudgetMax().multiply(entry.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        }

        return new ReallocateResponse(
                current,
                catBudgets,
                req.getTotalBudgetMax(),
                "Reallocated " + cat + " to " + newShare + "%. Remaining shares adjusted proportionally."
        );
    }
}
