package com.routewise.service;

import com.routewise.dto.BudgetReallocateRequest;
import com.routewise.dto.ReallocateResponse;
import com.routewise.dto.TripPlanRequest;
import com.routewise.dto.TripPlanResponse;
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
import java.util.List;
import java.util.Optional;

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
    private final PythonMicroserviceClient pythonClient;

    public TripService(
            CityRepository cityRepository,
            RouteRepository routeRepository,
            HotelRepository hotelRepository,
            RestaurantRepository restaurantRepository,
            AttractionRepository attractionRepository,
            TripRepository tripRepository,
            TripItemRepository tripItemRepository,
            PythonMicroserviceClient pythonClient
    ) {
        this.cityRepository = cityRepository;
        this.routeRepository = routeRepository;
        this.hotelRepository = hotelRepository;
        this.restaurantRepository = restaurantRepository;
        this.attractionRepository = attractionRepository;
        this.tripRepository = tripRepository;
        this.tripItemRepository = tripItemRepository;
        this.pythonClient = pythonClient;
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
