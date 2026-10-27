package com.routewise.service;

import com.routewise.entity.City;
import com.routewise.repository.CityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CityService {

    private final CityRepository cityRepository;

    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    public Optional<City> getCityById(Long id) {
        return cityRepository.findById(id);
    }

    public Optional<City> getCityByName(String name) {
        return cityRepository.findByNameIgnoreCase(name);
    }
}
