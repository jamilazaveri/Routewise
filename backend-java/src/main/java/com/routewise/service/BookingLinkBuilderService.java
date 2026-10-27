package com.routewise.service;

import com.routewise.dto.BookingOptionDto;
import com.routewise.entity.BookingLink;
import com.routewise.repository.BookingLinkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class BookingLinkBuilderService {

    private static final Logger log = LoggerFactory.getLogger(BookingLinkBuilderService.class);

    // Whitelist of allowed partner/provider host domains for security
    private final Set<String> allowedDomains = new HashSet<>(Arrays.asList(
            "makemytrip.com",
            "booking.com",
            "google.com",
            "google.co.in",
            "zomato.com",
            "swiggy.com",
            "redbus.in",
            "redbus.com",
            "irctc.co.in",
            "tamilnadutourism.tn.gov.in",
            "karnatakatourism.org"
    ));

    private final BookingLinkRepository bookingLinkRepository;

    public BookingLinkBuilderService(BookingLinkRepository bookingLinkRepository) {
        this.bookingLinkRepository = bookingLinkRepository;
    }

    /**
     * Checks if a URL's host belongs to the authorized whitelist of domains.
     */
    public boolean isDomainWhitelisted(String urlStr) {
        if (urlStr == null || urlStr.isBlank()) {
            return false;
        }
        try {
            URI uri = URI.create(urlStr);
            String host = uri.getHost();
            if (host == null) {
                return false;
            }
            host = host.toLowerCase();
            for (String domain : allowedDomains) {
                if (host.equals(domain) || host.endsWith("." + domain)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.warn("Invalid URI provided for domain validation: {}", urlStr);
            return false;
        }
    }

    /**
     * Registers a new provider domain to the runtime whitelist.
     */
    public void registerAllowedDomain(String domain) {
        if (domain != null && !domain.isBlank()) {
            allowedDomains.add(domain.trim().toLowerCase());
        }
    }

    public Set<String> getAllowedDomains() {
        return Collections.unmodifiableSet(allowedDomains);
    }

    /**
     * Safely constructs a URL by substituting place-holders with UTF-8 URL-encoded parameter values.
     */
    public String buildUrlFromTemplate(String template, Map<String, String> params) {
        if (template == null || template.isBlank()) {
            return "";
        }
        String result = template;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = "{" + entry.getKey() + "}";
            String rawVal = entry.getValue() != null ? entry.getValue() : "";
            String encodedVal = URLEncoder.encode(rawVal, StandardCharsets.UTF_8);
            result = result.replace(key, encodedVal);
        }

        // Validate domain whitelist
        if (!isDomainWhitelisted(result)) {
            log.warn("Generated URL host is not in allowed domain whitelist: {}", result);
            return "";
        }
        return result;
    }

    /**
     * Generates booking and map deep links for a hotel.
     */
    public List<BookingOptionDto.ProviderLinkDto> buildHotelLinks(
            String hotelName, String cityName, String checkin, String checkout, Integer guests) {
        List<BookingOptionDto.ProviderLinkDto> links = new ArrayList<>();
        int g = (guests != null && guests > 0) ? guests : 2;
        String inDate = (checkin != null && !checkin.isBlank()) ? checkin : "";
        String outDate = (checkout != null && !checkout.isBlank()) ? checkout : "";

        Map<String, String> params = new HashMap<>();
        params.put("name", hotelName);
        params.put("city", cityName != null ? cityName : "");
        params.put("checkin", inDate);
        params.put("checkout", outDate);
        params.put("guests", String.valueOf(g));

        // 1. MakeMyTrip
        String mmtUrl = getTemplateOrDefault("hotel", "makemytrip",
                "https://www.makemytrip.com/hotels/hotel-listing/?city={city}&hotelName={name}&checkin={checkin}&checkout={checkout}&roomStay={guests}");
        String builtMmt = buildUrlFromTemplate(mmtUrl, params);
        if (!builtMmt.isBlank()) {
            links.add(new BookingOptionDto.ProviderLinkDto("makemytrip", "MakeMyTrip", builtMmt, "🏨", "Search & book rooms on MakeMyTrip"));
        }

        // 2. Booking.com
        String bdcUrl = getTemplateOrDefault("hotel", "booking.com",
                "https://www.booking.com/searchresults.html?ss={name}+{city}&checkin={checkin}&checkout={checkout}&group_adults={guests}");
        String builtBdc = buildUrlFromTemplate(bdcUrl, params);
        if (!builtBdc.isBlank()) {
            links.add(new BookingOptionDto.ProviderLinkDto("booking.com", "Booking.com", builtBdc, "🛌", "Check availability & rates on Booking.com"));
        }

        // 3. Google Maps
        String gmapsUrl = getTemplateOrDefault("hotel", "google_maps",
                "https://www.google.com/maps/search/?api=1&query={name}+{city}");
        String builtGmaps = buildUrlFromTemplate(gmapsUrl, params);
        if (!builtGmaps.isBlank()) {
            links.add(new BookingOptionDto.ProviderLinkDto("google_maps", "Google Maps", builtGmaps, "📍", "View location & reviews on Google Maps"));
        }

        return links;
    }

    /**
     * Generates reservation, delivery, and map links for a restaurant.
     */
    public List<BookingOptionDto.ProviderLinkDto> buildRestaurantLinks(String restaurantName, String cityName) {
        List<BookingOptionDto.ProviderLinkDto> links = new ArrayList<>();
        String citySlug = (cityName != null) ? cityName.toLowerCase().trim() : "chennai";

        Map<String, String> params = new HashMap<>();
        params.put("name", restaurantName);
        params.put("city", cityName != null ? cityName : "");
        params.put("city_slug", citySlug);

        // 1. Google Maps
        String gmapsUrl = getTemplateOrDefault("restaurant", "google_maps",
                "https://www.google.com/maps/search/?api=1&query={name}+{city}");
        String builtGmaps = buildUrlFromTemplate(gmapsUrl, params);
        if (!builtGmaps.isBlank()) {
            links.add(new BookingOptionDto.ProviderLinkDto("google_maps", "Google Maps", builtGmaps, "📍", "View location, menus & photos on Google Maps"));
        }

        // 2. Zomato
        String zomatoUrl = getTemplateOrDefault("restaurant", "zomato",
                "https://www.zomato.com/{city_slug}/restaurants?q={name}");
        String builtZomato = buildUrlFromTemplate(zomatoUrl, params);
        if (!builtZomato.isBlank()) {
            links.add(new BookingOptionDto.ProviderLinkDto("zomato", "Zomato", builtZomato, "🍽️", "Check menu, table booking & reviews on Zomato"));
        }

        // 3. Swiggy
        String swiggyUrl = getTemplateOrDefault("restaurant", "swiggy",
                "https://www.swiggy.com/search?query={name}");
        String builtSwiggy = buildUrlFromTemplate(swiggyUrl, params);
        if (!builtSwiggy.isBlank()) {
            links.add(new BookingOptionDto.ProviderLinkDto("swiggy", "Swiggy", builtSwiggy, "🛵", "Find restaurant outlet & menu on Swiggy"));
        }

        return links;
    }

    /**
     * Generates tickets, directions, and official partner links for an attraction.
     */
    public List<BookingOptionDto.ProviderLinkDto> buildAttractionLinks(
            String attractionName, String cityName, String bookingUrl) {
        List<BookingOptionDto.ProviderLinkDto> links = new ArrayList<>();

        Map<String, String> params = new HashMap<>();
        params.put("name", attractionName);
        params.put("city", cityName != null ? cityName : "");

        // 1. Official or Partner Ticket Link (if available and whitelisted)
        if (bookingUrl != null && !bookingUrl.isBlank() && isDomainWhitelisted(bookingUrl)) {
            links.add(new BookingOptionDto.ProviderLinkDto("official", "Book Official Tickets", bookingUrl, "🎟️", "Official portal ticket reservation"));
        } else {
            String officialSearchUrl = getTemplateOrDefault("attraction", "official",
                    "https://www.google.com/search?q={name}+{city}+official+tickets");
            String builtSearch = buildUrlFromTemplate(officialSearchUrl, params);
            if (!builtSearch.isBlank()) {
                links.add(new BookingOptionDto.ProviderLinkDto("official", "Official Ticket Portal", builtSearch, "🎟️", "Find official ticket booking"));
            }
        }

        // 2. Google Maps Directions
        String gmapsUrl = getTemplateOrDefault("attraction", "google_maps",
                "https://www.google.com/maps/search/?api=1&query={name}+{city}");
        String builtGmaps = buildUrlFromTemplate(gmapsUrl, params);
        if (!builtGmaps.isBlank()) {
            links.add(new BookingOptionDto.ProviderLinkDto("google_maps", "Get Directions", builtGmaps, "📍", "Navigate & get directions on Google Maps"));
        }

        return links;
    }

    /**
     * Generates RedBus and IRCTC prefilled links for transit legs.
     */
    public List<BookingOptionDto.ProviderLinkDto> buildTransportLinks(
            String transportMode, String sourceCity, String destCity, String travelDate) {
        List<BookingOptionDto.ProviderLinkDto> links = new ArrayList<>();
        String s = (sourceCity != null) ? sourceCity.trim() : "Chennai";
        String d = (destCity != null) ? destCity.trim() : "Pondicherry";
        String dt = (travelDate != null && !travelDate.isBlank()) ? travelDate : "";

        Map<String, String> params = new HashMap<>();
        params.put("source", s);
        params.put("destination", d);
        params.put("date", dt);

        String mode = (transportMode != null) ? transportMode.toLowerCase().trim() : "bus";

        if (mode.contains("bus") || mode.contains("car")) {
            String redbusUrl = getTemplateOrDefault("transport", "redbus",
                    "https://www.redbus.in/bus-tickets/{source}-to-{destination}?date={date}");
            String builtRedbus = buildUrlFromTemplate(redbusUrl, params);
            if (!builtRedbus.isBlank()) {
                links.add(new BookingOptionDto.ProviderLinkDto("redbus", "RedBus", builtRedbus, "🚌", "Search & book bus tickets on RedBus"));
            }
        }

        if (mode.contains("train") || mode.contains("bus") || mode.contains("car")) {
            String irctcUrl = getTemplateOrDefault("transport", "irctc",
                    "https://www.irctc.co.in/nget/train-search?src={source}&dst={destination}&date={date}");
            String builtIrctc = buildUrlFromTemplate(irctcUrl, params);
            if (!builtIrctc.isBlank()) {
                links.add(new BookingOptionDto.ProviderLinkDto("irctc", "IRCTC Trains", builtIrctc, "🚆", "Book train tickets on official IRCTC portal"));
            }
        }

        return links;
    }

    private String getTemplateOrDefault(String stopType, String provider, String defaultTemplate) {
        try {
            return bookingLinkRepository.findByStopTypeAndProvider(stopType, provider)
                    .map(BookingLink::getUrlTemplate)
                    .orElse(defaultTemplate);
        } catch (Exception e) {
            return defaultTemplate;
        }
    }
}
