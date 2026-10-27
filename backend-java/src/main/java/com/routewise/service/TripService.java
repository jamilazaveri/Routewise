package com.routewise.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.routewise.dto.*;
import com.routewise.entity.*;
import com.routewise.exception.InvalidTripRequestException;
import com.routewise.exception.ResourceNotFoundException;
import com.routewise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class TripService {

    private static final Logger log = LoggerFactory.getLogger(TripService.class);

    private final CityRepository cityRepository;
    private final RouteRepository routeRepository;
    private final HotelRepository hotelRepository;
    private final RestaurantRepository restaurantRepository;
    private final AttractionRepository attractionRepository;
    private final TripRepository tripRepository;
    private final TripItemRepository tripItemRepository;
    private final RouteOptionRepository routeOptionRepository;
    private final RouteLegRepository routeLegRepository;
    private final PythonMicroserviceClient pythonClient;
    private final ObjectMapper objectMapper;

    public TripService(
            CityRepository cityRepository,
            RouteRepository routeRepository,
            HotelRepository hotelRepository,
            RestaurantRepository restaurantRepository,
            AttractionRepository attractionRepository,
            TripRepository tripRepository,
            TripItemRepository tripItemRepository,
            RouteOptionRepository routeOptionRepository,
            RouteLegRepository routeLegRepository,
            PythonMicroserviceClient pythonClient,
            ObjectMapper objectMapper
    ) {
        this.cityRepository = cityRepository;
        this.routeRepository = routeRepository;
        this.hotelRepository = hotelRepository;
        this.restaurantRepository = restaurantRepository;
        this.attractionRepository = attractionRepository;
        this.tripRepository = tripRepository;
        this.tripItemRepository = tripItemRepository;
        this.routeOptionRepository = routeOptionRepository;
        this.routeLegRepository = routeLegRepository;
        this.pythonClient = pythonClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Main journey planning logic:
     * - Validates trip input parameters
     * - Retrieves city and route parameters
     * - Invokes Python microservice for greedy budget optimization and day-by-day scheduling
     * - Persists generated trip & events to MySQL
     */
    @Transactional
    public TripPlanResponse planTrip(TripPlanRequest request) {
        log.info("Generating journey plan: {} -> {}, Days: {}, Travellers: {}, Budget: ₹{} - ₹{}",
                request.getStartCity(), request.getDestinationCity(),
                request.getNumDays(), request.getNumTravellers(),
                request.getTotalBudgetMin(), request.getTotalBudgetMax());

        if (request.getStartCity().trim().equalsIgnoreCase(request.getDestinationCity().trim())) {
            throw new InvalidTripRequestException("Start location and destination city cannot be the same.");
        }

        if (request.getTotalBudgetMax().compareTo(request.getTotalBudgetMin()) < 0) {
            throw new InvalidTripRequestException("Maximum budget cannot be less than minimum budget.");
        }

        City startCity = cityRepository.findByNameIgnoreCase(request.getStartCity().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Start city '" + request.getStartCity() + "' not found in database."));

        City destCity = cityRepository.findByNameIgnoreCase(request.getDestinationCity().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Destination city '" + request.getDestinationCity() + "' not found in database."));

        // Lookup route (bidirectional fallback)
        Route route = routeRepository.findByOriginCityIdAndDestinationCityId(startCity.getId(), destCity.getId())
                .orElseGet(() -> routeRepository.findByOriginCityIdAndDestinationCityId(destCity.getId(), startCity.getId())
                        .orElse(null));

        if (route == null) {
            log.warn("No direct route entry in DB between {} and {}. Synthesizing estimated highway route.", startCity.getName(), destCity.getName());
            route = new Route();
            route.setOriginCity(startCity);
            route.setDestinationCity(destCity);
            route.setDistanceKm(new BigDecimal("300.00"));
            route.setTollCost(new BigDecimal("250.00"));
            route.setEstimatedTimeHours(new BigDecimal("5.50"));
            route.setHighwayName("National Highway Network");
        }

        // Fetch candidate hotels, restaurants, and attractions for the destination
        List<Hotel> hotels = hotelRepository.findByCityId(destCity.getId());
        List<Restaurant> restaurants = restaurantRepository.findByCityId(destCity.getId());
        List<Attraction> attractions = attractionRepository.findByCityId(destCity.getId());

        // Invoke Python microservice
        TripPlanResponse response = pythonClient.optimizeTrip(request, route, hotels, restaurants, attractions);

        // Fill trip name if not provided
        if (request.getTripName() == null || request.getTripName().isBlank()) {
            response.setTripName(request.getNumDays() + "-Day Journey to " + destCity.getName());
        } else {
            response.setTripName(request.getTripName());
        }

        // Persist the Trip and TripItems into MySQL
        Trip savedTrip = saveTripRecord(request, startCity, destCity, response);
        response.setTripId(savedTrip.getId());

        return response;
    }

    public ReallocateResponse reallocateBudget(BudgetReallocateRequest request) {
        return pythonClient.reallocateBudget(request);
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findByOrderByCreatedAtDesc();
    }

    public Optional<Trip> getTripById(Long id) {
        return tripRepository.findById(id);
    }

    /**
     * Plans multi-style ordered routes for a given trip.
     */
    @Transactional
    public MultiRoutePlanResponse planTripRoutes(Long tripId, MultiRoutePlanRequest customRequest) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + tripId + " not found."));

        MultiRoutePlanRequest request = new MultiRoutePlanRequest();
        request.setTripId(trip.getId());
        request.setCityName(trip.getDestinationCity().getName());
        request.setTransportMode(trip.getTransportMode());

        if (customRequest != null && customRequest.getStops() != null && !customRequest.getStops().isEmpty()) {
            request.setStops(customRequest.getStops());
        } else {
            List<MultiRoutePlanRequest.StopItemDto> stops = extractStopsForTrip(trip);
            request.setStops(stops);
        }

        MultiRoutePlanResponse response = pythonClient.planRoutes(request);
        response.setTripId(trip.getId());

        persistRouteOptions(trip, response);

        return response;
    }

    /**
     * Retrieves a specific route option (fastest, shortest, cheapest, scenic, easiest) for a trip.
     */
    public MultiRoutePlanResponse.RouteDetailDto getRouteOptionByType(Long tripId, String routeType) {
        Optional<RouteOption> optionOpt = routeOptionRepository.findByTripIdAndRouteType(tripId, routeType.toLowerCase());
        if (optionOpt.isEmpty()) {
            MultiRoutePlanResponse multi = planTripRoutes(tripId, null);
            return multi.getRoutes().get(routeType.toLowerCase());
        }

        RouteOption opt = optionOpt.get();
        MultiRoutePlanResponse.RouteDetailDto detail = new MultiRoutePlanResponse.RouteDetailDto();
        detail.setId(opt.getId());
        detail.setRouteType(opt.getRouteType());
        detail.setTag(opt.getTag());
        detail.setTotalDistanceKm(opt.getTotalDistanceKm());
        detail.setTotalTimeMins(opt.getTotalTimeMins());
        detail.setTotalCost(opt.getTotalCost());
        detail.setFuelCost(opt.getFuelCost());
        detail.setTollCost(opt.getTollCost());
        detail.setScenicScore(opt.getScenicScore());
        detail.setSummary(opt.getSummary());

        List<RouteLeg> legs = routeLegRepository.findByRouteOptionIdOrderBySeqAsc(opt.getId());
        List<MultiRoutePlanResponse.LegDto> legDtos = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        for (RouteLeg leg : legs) {
            MultiRoutePlanResponse.LegDto lDto = new MultiRoutePlanResponse.LegDto();
            lDto.setSeq(leg.getSeq());
            lDto.setFromStopName(leg.getFromStopName());
            lDto.setFromStopType(leg.getFromStopType());
            lDto.setFromLat(leg.getFromLat());
            lDto.setFromLng(leg.getFromLng());
            lDto.setToStopName(leg.getToStopName());
            lDto.setToStopType(leg.getToStopType());
            lDto.setToLat(leg.getToLat());
            lDto.setToLng(leg.getToLng());
            lDto.setDistanceKm(leg.getDistanceKm());
            lDto.setDurationMins(leg.getDurationMins());
            lDto.setTollCost(leg.getTollCost());
            lDto.setFuelCost(leg.getFuelCost());
            lDto.setArrivalTime(leg.getArrivalTime());
            lDto.setDepartureTime(leg.getDepartureTime());
            lDto.setStayDurationMins(leg.getStayDurationMins());
            lDto.setInstructions(leg.getInstructions());
            lDto.setClosingTimeWarning(leg.getClosingTimeWarning());

            if (leg.getClosingTimeWarning() != null && !leg.getClosingTimeWarning().isBlank()) {
                warnings.add(leg.getClosingTimeWarning());
            }

            try {
                if (leg.getGeometry() != null && !leg.getGeometry().isBlank()) {
                    List<List<Double>> geom = objectMapper.readValue(leg.getGeometry(), new TypeReference<List<List<Double>>>() {});
                    lDto.setGeometry(geom);
                }
            } catch (Exception ignored) {}

            legDtos.add(lDto);
        }

        detail.setLegs(legDtos);
        detail.setWarnings(warnings);
        return detail;
    }

    private List<MultiRoutePlanRequest.StopItemDto> extractStopsForTrip(Trip trip) {
        List<MultiRoutePlanRequest.StopItemDto> stops = new ArrayList<>();
        Long cityId = trip.getDestinationCity().getId();

        List<TripItem> items = trip.getItems();
        if (items != null && !items.isEmpty()) {
            for (TripItem item : items) {
                MultiRoutePlanRequest.StopItemDto stop = new MultiRoutePlanRequest.StopItemDto();
                stop.setId(item.getReferenceId());
                stop.setName(item.getTitle());
                stop.setType(item.getItemType().toLowerCase());

                if ("hotel".equalsIgnoreCase(item.getItemType())) {
                    if (item.getReferenceId() != null) {
                        hotelRepository.findById(item.getReferenceId()).ifPresent(h -> {
                            stop.setLatitude(h.getLatitude());
                            stop.setLongitude(h.getLongitude());
                            stop.setRating(h.getRating() != null ? h.getRating().doubleValue() : 4.0);
                            stop.setAddress(h.getAddress());
                        });
                    }
                    stop.setDurationHours(0.0);
                    stops.add(stop);
                } else if ("restaurant".equalsIgnoreCase(item.getItemType())) {
                    if (item.getReferenceId() != null) {
                        restaurantRepository.findById(item.getReferenceId()).ifPresent(r -> {
                            stop.setLatitude(r.getLatitude());
                            stop.setLongitude(r.getLongitude());
                            stop.setRating(r.getRating() != null ? r.getRating().doubleValue() : 4.0);
                            stop.setMealType(r.getMealType());
                            stop.setAddress(r.getAddress());
                        });
                    }
                    stop.setDurationHours(1.0);
                    stops.add(stop);
                } else if ("attraction".equalsIgnoreCase(item.getItemType())) {
                    if (item.getReferenceId() != null) {
                        attractionRepository.findById(item.getReferenceId()).ifPresent(a -> {
                            stop.setLatitude(a.getLatitude());
                            stop.setLongitude(a.getLongitude());
                            stop.setScenicScore(a.getScenicScore() != null ? a.getScenicScore().doubleValue() : 0.5);
                            stop.setOpeningTime(a.getOpeningTime() != null ? a.getOpeningTime().toString() : "09:00:00");
                            stop.setClosingTime(a.getClosingTime() != null ? a.getClosingTime().toString() : "18:00:00");
                            stop.setDurationHours(a.getAvgVisitDurationMins() != null ? a.getAvgVisitDurationMins() / 60.0 : 1.5);
                            stop.setRating(a.getRating() != null ? a.getRating().doubleValue() : 4.0);
                            stop.setCategory(a.getCategory());
                        });
                    }
                    stops.add(stop);
                }
            }
        }

        // If stops is empty or missing coordinates, populate from city database
        boolean missingCoords = stops.stream().anyMatch(s -> s.getLatitude() == null || s.getLongitude() == null);
        if (stops.size() < 2 || missingCoords) {
            stops.clear();
            List<Hotel> cityHotels = hotelRepository.findByCityId(cityId);
            List<Restaurant> cityRestaurants = restaurantRepository.findByCityId(cityId);
            List<Attraction> cityAttractions = attractionRepository.findByCityId(cityId);

            if (!cityHotels.isEmpty()) {
                Hotel h = cityHotels.get(0);
                MultiRoutePlanRequest.StopItemDto hStop = new MultiRoutePlanRequest.StopItemDto();
                hStop.setId(h.getId());
                hStop.setName(h.getName());
                hStop.setType("hotel");
                hStop.setLatitude(h.getLatitude());
                hStop.setLongitude(h.getLongitude());
                hStop.setRating(h.getRating() != null ? h.getRating().doubleValue() : 4.0);
                hStop.setAddress(h.getAddress());
                hStop.setDurationHours(0.0);
                stops.add(hStop);
            }

            for (int i = 0; i < Math.min(3, cityAttractions.size()); i++) {
                Attraction a = cityAttractions.get(i);
                MultiRoutePlanRequest.StopItemDto aStop = new MultiRoutePlanRequest.StopItemDto();
                aStop.setId(a.getId());
                aStop.setName(a.getName());
                aStop.setType("attraction");
                aStop.setLatitude(a.getLatitude());
                aStop.setLongitude(a.getLongitude());
                aStop.setScenicScore(a.getScenicScore() != null ? a.getScenicScore().doubleValue() : 0.5);
                aStop.setOpeningTime(a.getOpeningTime() != null ? a.getOpeningTime().toString() : "09:00:00");
                aStop.setClosingTime(a.getClosingTime() != null ? a.getClosingTime().toString() : "18:00:00");
                aStop.setDurationHours(a.getAvgVisitDurationMins() != null ? a.getAvgVisitDurationMins() / 60.0 : 1.5);
                aStop.setCategory(a.getCategory());
                stops.add(aStop);
            }

            if (!cityRestaurants.isEmpty()) {
                Restaurant r = cityRestaurants.get(0);
                MultiRoutePlanRequest.StopItemDto rStop = new MultiRoutePlanRequest.StopItemDto();
                rStop.setId(r.getId());
                rStop.setName(r.getName());
                rStop.setType("restaurant");
                rStop.setLatitude(r.getLatitude());
                rStop.setLongitude(r.getLongitude());
                rStop.setMealType(r.getMealType());
                rStop.setDurationHours(1.0);
                stops.add(rStop);
            }
        }

        return stops;
    }

    private void persistRouteOptions(Trip trip, MultiRoutePlanResponse response) {
        if (response.getRoutes() == null || response.getRoutes().isEmpty()) {
            return;
        }

        routeOptionRepository.deleteByTripId(trip.getId());

        for (Map.Entry<String, MultiRoutePlanResponse.RouteDetailDto> entry : response.getRoutes().entrySet()) {
            String routeType = entry.getKey();
            MultiRoutePlanResponse.RouteDetailDto detail = entry.getValue();

            RouteOption opt = new RouteOption();
            opt.setTrip(trip);
            opt.setRouteType(routeType);
            opt.setTag(detail.getTag());
            opt.setTotalDistanceKm(detail.getTotalDistanceKm());
            opt.setTotalTimeMins(detail.getTotalTimeMins());
            opt.setTotalCost(detail.getTotalCost());
            opt.setFuelCost(detail.getFuelCost());
            opt.setTollCost(detail.getTollCost());
            opt.setScenicScore(detail.getScenicScore());
            opt.setSummary(detail.getSummary());

            RouteOption savedOpt = routeOptionRepository.save(opt);
            detail.setId(savedOpt.getId());

            if (detail.getLegs() != null) {
                for (MultiRoutePlanResponse.LegDto legDto : detail.getLegs()) {
                    RouteLeg leg = new RouteLeg();
                    leg.setRouteOption(savedOpt);
                    leg.setSeq(legDto.getSeq());
                    leg.setFromStopName(legDto.getFromStopName());
                    leg.setFromStopType(legDto.getFromStopType());
                    leg.setFromLat(legDto.getFromLat());
                    leg.setFromLng(legDto.getFromLng());
                    leg.setToStopName(legDto.getToStopName());
                    leg.setToStopType(legDto.getToStopType());
                    leg.setToLat(legDto.getToLat());
                    leg.setToLng(legDto.getToLng());
                    leg.setDistanceKm(legDto.getDistanceKm());
                    leg.setDurationMins(legDto.getDurationMins());
                    leg.setTollCost(legDto.getTollCost());
                    leg.setFuelCost(legDto.getFuelCost());
                    leg.setArrivalTime(legDto.getArrivalTime());
                    leg.setDepartureTime(legDto.getDepartureTime());
                    leg.setStayDurationMins(legDto.getStayDurationMins());
                    leg.setInstructions(legDto.getInstructions());
                    leg.setClosingTimeWarning(legDto.getClosingTimeWarning());

                    try {
                        leg.setGeometry(objectMapper.writeValueAsString(legDto.getGeometry()));
                    } catch (Exception e) {
                        leg.setGeometry("[]");
                    }

                    routeLegRepository.save(leg);
                }
            }
        }
    }

    private Trip saveTripRecord(TripPlanRequest request, City startCity, City destCity, TripPlanResponse planResponse) {
        Trip trip = new Trip();
        trip.setTripName(planResponse.getTripName());
        trip.setStartCity(startCity);
        trip.setDestinationCity(destCity);

        LocalDate start = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().plusDays(7);
        LocalDate end = request.getEndDate() != null ? request.getEndDate() : start.plusDays(request.getNumDays());
        trip.setStartDate(start);
        trip.setEndDate(end);

        trip.setNumDays(request.getNumDays());
        trip.setNumTravellers(request.getNumTravellers());
        trip.setTransportMode(request.getTransportMode());
        trip.setTotalBudgetMin(request.getTotalBudgetMin());
        trip.setTotalBudgetMax(request.getTotalBudgetMax());

        trip.setShareAccommodation(request.getShareAccommodation());
        trip.setShareFood(request.getShareFood());
        trip.setShareTransport(request.getShareTransport());
        trip.setShareSightseeing(request.getShareSightseeing());

        if (planResponse.getCostBreakdown() != null) {
            trip.setTotalEstimatedCost(planResponse.getCostBreakdown().getTotal());
            trip.setCostAccommodation(planResponse.getCostBreakdown().getAccommodation());
            trip.setCostFood(planResponse.getCostBreakdown().getFood());
            trip.setCostFuel(planResponse.getCostBreakdown().getFuel());
            trip.setCostTolls(planResponse.getCostBreakdown().getTolls());
            trip.setCostTransport(planResponse.getCostBreakdown().getFuel().add(planResponse.getCostBreakdown().getTolls()));
            trip.setCostSightseeing(planResponse.getCostBreakdown().getSightseeing());
            trip.setCostMisc(planResponse.getCostBreakdown().getMiscellaneous());
            trip.setAmountLeft(planResponse.getCostBreakdown().getAmountLeft());
        }

        trip.setIsFeasible(planResponse.getIsFeasible() != null ? planResponse.getIsFeasible() : true);
        trip.setFeasibilityNotes(planResponse.getStatusMessage());

        Trip persistedTrip = tripRepository.save(trip);

        // Save Day Plan Items
        if (planResponse.getItinerary() != null) {
            for (TripPlanResponse.DayPlanDto day : planResponse.getItinerary()) {
                if (day.getItems() != null) {
                    for (TripPlanResponse.DayPlanItemDto itemDto : day.getItems()) {
                        TripItem item = new TripItem();
                        item.setTrip(persistedTrip);
                        item.setDayNumber(day.getDayNumber());
                        item.setItemOrder(itemDto.getItemOrder());
                        item.setItemType(itemDto.getItemType());
                        item.setTitle(itemDto.getTitle());
                        item.setCost(itemDto.getCost());
                        item.setDescription(itemDto.getNotes());
                        item.setReferenceId(itemDto.getReferenceId());

                        if (itemDto.getStartTime() != null) {
                            try { item.setStartTime(LocalTime.parse(itemDto.getStartTime())); } catch (Exception ignored) {}
                        }
                        if (itemDto.getEndTime() != null) {
                            try { item.setEndTime(LocalTime.parse(itemDto.getEndTime())); } catch (Exception ignored) {}
                        }

                        tripItemRepository.save(item);
                    }
                }
            }
        }

        return persistedTrip;
    }
}
