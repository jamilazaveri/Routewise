package com.routewise.service;

import com.routewise.entity.Attraction;
import com.routewise.repository.AttractionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AttractionService {

    private final AttractionRepository attractionRepository;

    public AttractionService(AttractionRepository attractionRepository) {
        this.attractionRepository = attractionRepository;
    }

    public List<Attraction> getAttractionsByCity(Long cityId) {
        return attractionRepository.findByCityId(cityId);
    }

    public List<Attraction> getAttractionsByCityAndMaxPrice(Long cityId, BigDecimal maxTicketPrice) {
        return attractionRepository.findByCityIdAndTicketPriceLessThanEqual(cityId, maxTicketPrice);
    }

    public List<Attraction> getAllAttractions() {
        return attractionRepository.findAll();
    }
}
