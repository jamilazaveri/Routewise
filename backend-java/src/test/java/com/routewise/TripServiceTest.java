package com.routewise;

import com.routewise.dto.TripPlanRequest;
import com.routewise.dto.TripPlanResponse;
import com.routewise.entity.City;
import com.routewise.entity.Route;
import com.routewise.entity.Trip;
import com.routewise.exception.InvalidTripRequestException;
import com.routewise.repository.*;
import com.routewise.service.PythonMicroserviceClient;
import com.routewise.service.TripService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TripServiceTest {

    @Mock
    private CityRepository cityRepository;

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private AttractionRepository attractionRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripItemRepository tripItemRepository;

    @Mock
    private PythonMicroserviceClient pythonClient;

    @InjectMocks
    private TripService tripService;

    private City chennai;
    private City pondicherry;
    private Route route;

    @BeforeEach
    void setUp() {
        chennai = new City(1L, "Chennai", "Tamil Nadu", "Capital", new BigDecimal("13.08"), new BigDecimal("80.27"));
        pondicherry = new City(2L, "Pondicherry", "Puducherry", "French Town", new BigDecimal("11.94"), new BigDecimal("79.80"));

        route = new Route();
        route.setId(1L);
        route.setOriginCity(chennai);
        route.setDestinationCity(pondicherry);
        route.setDistanceKm(new BigDecimal("151.00"));
        route.setTollCost(new BigDecimal("115.00"));
        route.setEstimatedTimeHours(new BigDecimal("3.20"));
        route.setHighwayName("ECR");
    }

    @Test
    @DisplayName("Should reject trip when start and destination cities are identical")
    void testSameCityValidation() {
        TripPlanRequest request = new TripPlanRequest();
        request.setStartCity("Chennai");
        request.setDestinationCity("Chennai");
        request.setTotalBudgetMin(new BigDecimal("5000"));
        request.setTotalBudgetMax(new BigDecimal("10000"));

        assertThrows(InvalidTripRequestException.class, () -> tripService.planTrip(request));
    }

    @Test
    @DisplayName("Should reject trip when max budget is less than min budget")
    void testBudgetMinMaxValidation() {
        TripPlanRequest request = new TripPlanRequest();
        request.setStartCity("Chennai");
        request.setDestinationCity("Pondicherry");
        request.setTotalBudgetMin(new BigDecimal("15000"));
        request.setTotalBudgetMax(new BigDecimal("10000"));

        assertThrows(InvalidTripRequestException.class, () -> tripService.planTrip(request));
    }

    @Test
    @DisplayName("Should successfully plan trip and persist record")
    void testPlanTripSuccess() {
        TripPlanRequest request = new TripPlanRequest();
        request.setStartCity("Chennai");
        request.setDestinationCity("Pondicherry");
        request.setNumDays(2);
        request.setNumTravellers(2);
        request.setTransportMode("car");
        request.setTotalBudgetMin(new BigDecimal("10000"));
        request.setTotalBudgetMax(new BigDecimal("15000"));

        when(cityRepository.findByNameIgnoreCase("Chennai")).thenReturn(Optional.of(chennai));
        when(cityRepository.findByNameIgnoreCase("Pondicherry")).thenReturn(Optional.of(pondicherry));
        when(routeRepository.findByOriginCityIdAndDestinationCityId(1L, 2L)).thenReturn(Optional.of(route));

        when(hotelRepository.findByCityId(2L)).thenReturn(Collections.emptyList());
        when(restaurantRepository.findByCityId(2L)).thenReturn(Collections.emptyList());
        when(attractionRepository.findByCityId(2L)).thenReturn(Collections.emptyList());

        TripPlanResponse mockResp = new TripPlanResponse();
        mockResp.setIsFeasible(true);
        mockResp.setStatusMessage("Within Budget");
        TripPlanResponse.CostBreakdownDto cb = new TripPlanResponse.CostBreakdownDto();
        cb.setTotal(new BigDecimal("12000"));
        cb.setBudgetMax(new BigDecimal("15000"));
        cb.setAmountLeft(new BigDecimal("3000"));
        mockResp.setCostBreakdown(cb);

        when(pythonClient.optimizeTrip(any(), any(), any(), any(), any())).thenReturn(mockResp);

        Trip savedTrip = new Trip();
        savedTrip.setId(99L);
        savedTrip.setTripName("2-Day Journey to Pondicherry");
        when(tripRepository.save(any(Trip.class))).thenReturn(savedTrip);

        TripPlanResponse result = tripService.planTrip(request);

        assertNotNull(result);
        assertEquals(99L, result.getTripId());
        assertTrue(result.getIsFeasible());
        verify(tripRepository, times(1)).save(any(Trip.class));
    }
}
