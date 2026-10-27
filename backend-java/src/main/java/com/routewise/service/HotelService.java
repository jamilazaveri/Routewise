package com.routewise.service;

import com.routewise.entity.Hotel;
import com.routewise.repository.HotelRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;

    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    public List<Hotel> getHotelsByCity(Long cityId) {
        return hotelRepository.findByCityId(cityId);
    }

    public List<Hotel> getHotelsByCityAndMaxPrice(Long cityId, BigDecimal maxPrice) {
        return hotelRepository.findByCityIdAndPricePerNightLessThanEqual(cityId, maxPrice);
    }

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }
}
