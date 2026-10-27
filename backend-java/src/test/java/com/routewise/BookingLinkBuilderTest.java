package com.routewise;

import com.routewise.dto.BookingOptionDto;
import com.routewise.repository.BookingLinkRepository;
import com.routewise.service.BookingLinkBuilderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class BookingLinkBuilderTest {

    private BookingLinkRepository bookingLinkRepository;
    private BookingLinkBuilderService linkBuilderService;

    @BeforeEach
    void setUp() {
        bookingLinkRepository = Mockito.mock(BookingLinkRepository.class);
        linkBuilderService = new BookingLinkBuilderService(bookingLinkRepository);
    }

    @Test
    @DisplayName("Whitelisted domains must pass validation while unauthorized domains are rejected")
    void testDomainWhitelisting() {
        // Authorized partner domains
        assertTrue(linkBuilderService.isDomainWhitelisted("https://www.makemytrip.com/hotels/listing"));
        assertTrue(linkBuilderService.isDomainWhitelisted("https://booking.com/searchresults.html"));
        assertTrue(linkBuilderService.isDomainWhitelisted("https://www.google.com/maps/search/?api=1"));
        assertTrue(linkBuilderService.isDomainWhitelisted("https://www.zomato.com/chennai/restaurants"));
        assertTrue(linkBuilderService.isDomainWhitelisted("https://www.swiggy.com/search?query=Murugan"));
        assertTrue(linkBuilderService.isDomainWhitelisted("https://www.redbus.in/bus-tickets"));
        assertTrue(linkBuilderService.isDomainWhitelisted("https://www.irctc.co.in/nget/train-search"));

        // Malicious or unauthorized external domains
        assertFalse(linkBuilderService.isDomainWhitelisted("https://evil-phishing-site.com/steal"));
        assertFalse(linkBuilderService.isDomainWhitelisted("https://makemytrip.com.malicious.net/login"));
        assertFalse(linkBuilderService.isDomainWhitelisted(""));
        assertFalse(linkBuilderService.isDomainWhitelisted(null));
    }

    @Test
    @DisplayName("Dynamic domain registration successfully adds new provider to whitelist")
    void testRegisterAllowedDomain() {
        assertFalse(linkBuilderService.isDomainWhitelisted("https://www.agoda.com/hotel/listing"));
        linkBuilderService.registerAllowedDomain("agoda.com");
        assertTrue(linkBuilderService.isDomainWhitelisted("https://www.agoda.com/hotel/listing"));
    }

    @Test
    @DisplayName("URL parameters are properly encoded to prevent injection and corruption")
    void testUrlParameterEncoding() {
        String template = "https://www.google.com/maps/search/?api=1&query={name}+{city}&notes={notes}";
        Map<String, String> params = new HashMap<>();
        params.put("name", "Taj Coromandel & Spa");
        params.put("city", "Chennai (TN)");
        params.put("notes", "5* Luxury / Ocean & Sea");

        String built = linkBuilderService.buildUrlFromTemplate(template, params);

        assertNotNull(built);
        assertFalse(built.isBlank());
        // Verify spaces encoded as '+' or '%20' and ampersands/slashes properly handled
        assertTrue(built.contains("Taj+Coromandel+%26+Spa") || built.contains("Taj%20Coromandel%20%26%20Spa"));
        assertTrue(built.contains("Chennai+%28TN%29") || built.contains("Chennai%20%28TN%29"));
    }

    @Test
    @DisplayName("Hotel links build correct prefilled links for MakeMyTrip, Booking.com, and Google Maps")
    void testHotelLinksGeneration() {
        List<BookingOptionDto.ProviderLinkDto> links = linkBuilderService.buildHotelLinks(
                "Mylapore Heritage Inn", "Chennai", "2026-11-10", "2026-11-12", 3);

        assertEquals(3, links.size());

        BookingOptionDto.ProviderLinkDto mmt = links.stream()
                .filter(l -> "makemytrip".equals(l.getProvider())).findFirst().orElse(null);
        assertNotNull(mmt);
        assertTrue(mmt.getUrl().contains("Mylapore+Heritage+Inn") || mmt.getUrl().contains("Mylapore%20Heritage%20Inn"));
        assertTrue(mmt.getUrl().contains("2026-11-10"));
        assertTrue(mmt.getUrl().contains("roomStay=3") || mmt.getUrl().contains("3"));

        BookingOptionDto.ProviderLinkDto bdc = links.stream()
                .filter(l -> "booking.com".equals(l.getProvider())).findFirst().orElse(null);
        assertNotNull(bdc);
        assertTrue(bdc.getUrl().contains("group_adults=3"));

        BookingOptionDto.ProviderLinkDto gmaps = links.stream()
                .filter(l -> "google_maps".equals(l.getProvider())).findFirst().orElse(null);
        assertNotNull(gmaps);
        assertTrue(gmaps.getUrl().contains("google.com/maps"));
    }

    @Test
    @DisplayName("Restaurant links generate valid Google Maps, Zomato, and Swiggy links")
    void testRestaurantLinksGeneration() {
        List<BookingOptionDto.ProviderLinkDto> links = linkBuilderService.buildRestaurantLinks(
                "Murugan Idli Shop", "Chennai");

        assertEquals(3, links.size());
        assertTrue(links.stream().anyMatch(l -> "google_maps".equals(l.getProvider())));
        assertTrue(links.stream().anyMatch(l -> "zomato".equals(l.getProvider())));
        assertTrue(links.stream().anyMatch(l -> "swiggy".equals(l.getProvider())));

        for (BookingOptionDto.ProviderLinkDto l : links) {
            assertTrue(linkBuilderService.isDomainWhitelisted(l.getUrl()),
                    "Provider URL must belong to allowed domain: " + l.getUrl());
        }
    }

    @Test
    @DisplayName("Transport links generate prefilled RedBus and IRCTC URLs with source, dest, and date")
    void testTransportLinksGeneration() {
        List<BookingOptionDto.ProviderLinkDto> links = linkBuilderService.buildTransportLinks(
                "bus", "Chennai", "Pondicherry", "2026-11-15");

        assertFalse(links.isEmpty());
        BookingOptionDto.ProviderLinkDto redbus = links.stream()
                .filter(l -> "redbus".equals(l.getProvider())).findFirst().orElse(null);
        assertNotNull(redbus);
        assertTrue(redbus.getUrl().contains("Chennai-to-Pondicherry"));
        assertTrue(redbus.getUrl().contains("2026-11-15"));
    }
}
