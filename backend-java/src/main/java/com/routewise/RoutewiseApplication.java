package com.routewise;

import com.routewise.entity.*;
import com.routewise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@SpringBootApplication
public class RoutewiseApplication {

    private static final Logger log = LoggerFactory.getLogger(RoutewiseApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(RoutewiseApplication.class, args);
    }

    /**
     * Seeds initial database records if tables are empty.
     */
    @Bean
    public CommandLineRunner databaseSeeder(
            CityRepository cityRepository,
            AttractionRepository attractionRepository,
            HotelRepository hotelRepository,
            RestaurantRepository restaurantRepository,
            RouteRepository routeRepository
    ) {
        return args -> {
            if (cityRepository.count() == 0) {
                log.info("Database appears unseeded. Initializing default Routewise seed data...");

                // 1. Cities
                City chennai = cityRepository.save(new City(null, "Chennai", "Tamil Nadu",
                        "The cultural capital of South India, famous for Marina Beach, Kapaleeshwarar temple, and culinary traditions.",
                        new BigDecimal("13.0827"), new BigDecimal("80.2707")));
                City bengaluru = cityRepository.save(new City(null, "Bengaluru", "Karnataka",
                        "India Silicon Valley, known for lush gardens, pleasant climate, craft breweries, and royal heritage landmarks.",
                        new BigDecimal("12.9716"), new BigDecimal("77.5946")));
                City pondicherry = cityRepository.save(new City(null, "Pondicherry", "Puducherry",
                        "French colonial seaside town with cobblestone promenades, Auroville spiritual haven, and serene beaches.",
                        new BigDecimal("11.9416"), new BigDecimal("79.8083")));
                City madurai = cityRepository.save(new City(null, "Madurai", "Tamil Nadu",
                        "The ancient lotus city celebrated for the monumental Meenakshi Amman Temple and iconic food culture.",
                        new BigDecimal("9.9252"), new BigDecimal("78.1198")));
                City coimbatore = cityRepository.save(new City(null, "Coimbatore", "Tamil Nadu",
                        "The Manchester of South India, gateway to the Nilgiris, home to the massive Adiyogi Shiva statue.",
                        new BigDecimal("11.0168"), new BigDecimal("76.9558")));

                log.info("5 Cities seeded successfully.");

                // 2. Attractions for Chennai
                createAttraction(attractionRepository, chennai, "Marina Beach & Promenade", "Beach", "World second longest urban beach.", "05:00:00", "22:00:00", 90, "0.00", "4.60");
                createAttraction(attractionRepository, chennai, "Kapaleeshwarar Temple", "Religious", "7th-century Dravidian temple in Mylapore.", "06:00:00", "21:00:00", 75, "0.00", "4.80");
                createAttraction(attractionRepository, chennai, "Fort St. George & Museum", "Heritage", "British coastal stronghold with colonial relics.", "09:00:00", "17:00:00", 100, "50.00", "4.30");
                createAttraction(attractionRepository, chennai, "San Thome Basilica", "Religious", "Neo-gothic Roman Catholic minor basilica.", "06:00:00", "20:00:00", 60, "0.00", "4.60");
                createAttraction(attractionRepository, chennai, "Government Museum Egmore", "Museum", "Repository of Chola bronzes and Roman coins.", "09:30:00", "17:00:00", 120, "100.00", "4.40");
                createAttraction(attractionRepository, chennai, "Guindy National Park & Zoo", "Nature", "Urban wildlife sanctuary with blackbucks.", "09:00:00", "17:30:00", 90, "40.00", "4.20");
                createAttraction(attractionRepository, chennai, "DakshinaChitra Heritage Village", "Heritage", "Living-history open-air museum of South Indian crafts.", "10:00:00", "18:00:00", 150, "175.00", "4.70");
                createAttraction(attractionRepository, chennai, "Besant Nagar Elliot Beach", "Beach", "Calm sandy beach flanked by coastal cafes.", "06:00:00", "22:00:00", 60, "0.00", "4.50");

                // Attractions for Bengaluru
                createAttraction(attractionRepository, bengaluru, "Lalbagh Botanical Garden", "Nature", "240-acre botanical haven with Victorian glasshouse.", "06:00:00", "19:00:00", 120, "30.00", "4.70");
                createAttraction(attractionRepository, bengaluru, "Bangalore Palace", "Heritage", "Tudor-revival royal palace with wood carvings.", "10:00:00", "17:30:00", 90, "250.00", "4.40");
                createAttraction(attractionRepository, bengaluru, "Cubbon Park", "Nature", "Green lung with shaded bamboo groves and library.", "06:00:00", "18:00:00", 90, "0.00", "4.60");
                createAttraction(attractionRepository, bengaluru, "Visvesvaraya Science Museum", "Museum", "Interactive science exhibits and rocket engine models.", "09:30:00", "18:00:00", 120, "85.00", "4.60");
                createAttraction(attractionRepository, bengaluru, "Bull Temple (Nandi)", "Religious", "Granite monolithic Nandi from the 16th century.", "06:00:00", "20:00:00", 45, "0.00", "4.50");
                createAttraction(attractionRepository, bengaluru, "Tipu Sultan Summer Palace", "Heritage", "Teakwood palace with ornate floral arches.", "08:30:00", "17:30:00", 60, "25.00", "4.20");
                createAttraction(attractionRepository, bengaluru, "Bannerghatta Park Safari", "Nature", "Grand zoo and tiger safari reserve.", "09:30:00", "17:00:00", 180, "350.00", "4.50");
                createAttraction(attractionRepository, bengaluru, "ISKCON Temple Bangalore", "Religious", "Neo-classical Vedic temple on Hare Krishna Hill.", "07:15:00", "20:30:00", 90, "0.00", "4.70");

                // Attractions for Pondicherry
                createAttraction(attractionRepository, pondicherry, "Promenade Beach & French Quarter", "Beach", "Goubert Avenue seafront with colonial villas.", "05:00:00", "23:00:00", 90, "0.00", "4.70");
                createAttraction(attractionRepository, pondicherry, "Auroville & Matrimandir Viewpoint", "Heritage", "Golden globe meditation pavilion in experimental township.", "09:00:00", "17:00:00", 150, "0.00", "4.60");
                createAttraction(attractionRepository, pondicherry, "Sri Aurobindo Ashram", "Religious", "Quiet ashram with samadhi of Sri Aurobindo.", "08:00:00", "18:00:00", 60, "0.00", "4.60");
                createAttraction(attractionRepository, pondicherry, "Paradise Beach Boat Trip", "Beach", "Island beach reached by backwater boat cruise.", "09:00:00", "17:00:00", 120, "200.00", "4.50");
                createAttraction(attractionRepository, pondicherry, "Sacred Heart Basilica", "Religious", "Gothic revival basilica with stained glass panels.", "06:00:00", "19:30:00", 45, "0.00", "4.60");
                createAttraction(attractionRepository, pondicherry, "Pondicherry Botanical Gardens", "Nature", "French layout garden with rare flora and toy train.", "09:00:00", "18:00:00", 60, "20.00", "4.20");
                createAttraction(attractionRepository, pondicherry, "Serenity Beach", "Beach", "Surfing hotspot with gentle waves and beach shacks.", "06:00:00", "20:00:00", 75, "0.00", "4.40");
                createAttraction(attractionRepository, pondicherry, "Pondicherry Museum", "Museum", "Gallery of Arikamedu Roman relics and Chola bronzes.", "09:00:00", "17:00:00", 60, "30.00", "4.10");

                // Attractions for Madurai
                createAttraction(attractionRepository, madurai, "Meenakshi Amman Temple", "Religious", "14 gopurams and thousand-pillar hall.", "05:00:00", "21:30:00", 150, "50.00", "4.90");
                createAttraction(attractionRepository, madurai, "Thirumalai Nayakkar Palace", "Heritage", "17th-century palace blending Italian and Dravidian styles.", "09:00:00", "17:00:00", 75, "20.00", "4.50");
                createAttraction(attractionRepository, madurai, "Gandhi Memorial Museum", "Museum", "Historic palace housing Mahatma Gandhi artifacts.", "10:00:00", "17:30:00", 90, "10.00", "4.40");
                createAttraction(attractionRepository, madurai, "Alagar Kovil (Kallazhagar)", "Religious", "Temple nestled against the Alagar hills.", "06:00:00", "19:00:00", 90, "0.00", "4.70");
                createAttraction(attractionRepository, madurai, "Vandiyur Mariamman Teppakulam", "Religious", "Colossal square temple tank with island mandapam.", "06:00:00", "20:00:00", 45, "0.00", "4.30");
                createAttraction(attractionRepository, madurai, "Koodal Azhagar Temple", "Religious", "Ancient Vishnu temple with 3 postures.", "05:30:00", "21:00:00", 60, "0.00", "4.60");
                createAttraction(attractionRepository, madurai, "Samanar Hills (Jain Caves)", "Heritage", "Rock-cut caves with 9th-century Jain bas-reliefs.", "06:00:00", "18:30:00", 90, "0.00", "4.50");
                createAttraction(attractionRepository, madurai, "Puthu Mandapam Market", "Heritage", "17th-century pillared hallway with tailors and brassware.", "09:00:00", "21:00:00", 60, "0.00", "4.40");

                // Attractions for Coimbatore
                createAttraction(attractionRepository, coimbatore, "Adiyogi Shiva Bust & Isha Center", "Religious", "World largest 112-ft bust sculpture of Lord Shiva.", "06:00:00", "20:00:00", 150, "0.00", "4.80");
                createAttraction(attractionRepository, coimbatore, "Marudhamalai Murugan Temple", "Religious", "Hill temple surrounded by medicinal herbs.", "06:00:00", "20:30:00", 90, "0.00", "4.70");
                createAttraction(attractionRepository, coimbatore, "Gass Forest Museum", "Museum", "Century-old natural history museum with timber exhibits.", "09:00:00", "17:00:00", 60, "20.00", "4.30");
                createAttraction(attractionRepository, coimbatore, "VOC Park and Zoo", "Nature", "Urban family park with gardens and animal enclosures.", "09:00:00", "18:30:00", 75, "25.00", "4.10");
                createAttraction(attractionRepository, coimbatore, "Eachanari Vinayagar Temple", "Religious", "16th-century Ganesha temple with monolithic idol.", "05:00:00", "21:00:00", 45, "0.00", "4.60");
                createAttraction(attractionRepository, coimbatore, "GD Car Museum", "Museum", "Collection of vintage and classic automobiles.", "09:00:00", "17:00:00", 90, "75.00", "4.70");
                createAttraction(attractionRepository, coimbatore, "Siruvani Waterfalls & Dam", "Nature", "Scenic waterfall renowned for sweet mineral water.", "09:30:00", "15:30:00", 120, "100.00", "4.50");
                createAttraction(attractionRepository, coimbatore, "Perur Pateeswarar Temple", "Religious", "Karikala Chola temple with stone pillar carvings.", "06:00:00", "20:00:00", 60, "0.00", "4.70");

                // 3. Hotels (5 per city)
                createHotel(hotelRepository, chennai, "Hostel Chennai Central", "Budget", "850.00", "4.10", "Poonamallee High Rd", "Free WiFi, AC dorms, Lockers");
                createHotel(hotelRepository, chennai, "Mylapore Heritage Inn", "Budget", "1400.00", "4.30", "South Mada St", "Free WiFi, Breakfast, AC");
                createHotel(hotelRepository, chennai, "The Residency Towers", "Mid-Range", "3200.00", "4.50", "T. Nagar", "Pool, Breakfast, Gym, Restaurant");
                createHotel(hotelRepository, chennai, "Savera Hotel", "Mid-Range", "3800.00", "4.40", "Mylapore", "Pool, Piano Bar, Fitness Centre");
                createHotel(hotelRepository, chennai, "Taj Coromandel", "Premium", "8500.00", "4.80", "Nungambakkam", "Luxury Spa, Fine Dining, Pool");

                createHotel(hotelRepository, bengaluru, "Zostel Bangalore", "Budget", "950.00", "4.40", "Koramangala", "Rooftop Cafe, WiFi, Games Room");
                createHotel(hotelRepository, bengaluru, "Octave Hotel & Spa", "Budget", "1600.00", "4.20", "Marathahalli", "Free WiFi, Breakfast, AC");
                createHotel(hotelRepository, bengaluru, "Lemon Tree Hotel Premier", "Mid-Range", "3500.00", "4.50", "Ulsoor, Near MG Road", "Pool, Gym, Free Breakfast");
                createHotel(hotelRepository, bengaluru, "The Chancery Pavilion", "Mid-Range", "4200.00", "4.40", "Residency Road", "Outdoor Pool, 24/7 Dining");
                createHotel(hotelRepository, bengaluru, "The Oberoi Bengaluru", "Premium", "9500.00", "4.90", "MG Road", "Tropical Gardens, Personal Butler, Spa");

                createHotel(hotelRepository, pondicherry, "Dune de L Orient Guest House", "Budget", "1100.00", "4.30", "White Town", "Heritage Verandah, WiFi, AC");
                createHotel(hotelRepository, pondicherry, "Pleasant Inn White Town", "Budget", "1500.00", "4.20", "Suffren Street", "Cycle Rental, Free WiFi, AC");
                createHotel(hotelRepository, pondicherry, "Villa Shanti", "Mid-Range", "3900.00", "4.60", "French Quarter", "Courtyard Cafe, Boutique Rooms");
                createHotel(hotelRepository, pondicherry, "Promenade Beach Hotel", "Mid-Range", "4600.00", "4.50", "Goubert Avenue", "Ocean View, Rooftop Lounge, Pool");
                createHotel(hotelRepository, pondicherry, "Palais de Mahe (CGH Earth)", "Premium", "8800.00", "4.80", "Bussy Street", "Plunge Pool, Ayurvedic Center, Suites");

                createHotel(hotelRepository, madurai, "Temple View Stay", "Budget", "800.00", "4.20", "Town Hall Road", "Clean Rooms, Hot Water, 24/7 Desk");
                createHotel(hotelRepository, madurai, "Hotel Supreme", "Budget", "1350.00", "4.10", "West Perumal Maistry St", "Rooftop Restaurant, AC");
                createHotel(hotelRepository, madurai, "Fortune Pandiyan Hotel", "Mid-Range", "2800.00", "4.40", "Race Course Colony", "Swimming Pool, Orchid Multi-Cuisine");
                createHotel(hotelRepository, madurai, "Courtyard by Marriott Madurai", "Mid-Range", "4200.00", "4.60", "Alagar Kovil Road", "Infinity Pool, 24/7 Gym, Buffet");
                createHotel(hotelRepository, madurai, "Heritage Madurai", "Premium", "7500.00", "4.80", "Kochadai", "Banyan Tree Villas, Temple Pool, Spa");

                createHotel(hotelRepository, coimbatore, "City Backpackers Hostel", "Budget", "750.00", "4.00", "Gandhipuram", "WiFi, AC, Lockers, Lounge");
                createHotel(hotelRepository, coimbatore, "Hotel Alankar Grande", "Budget", "1600.00", "4.30", "Ram Nagar", "Free Breakfast, Free WiFi");
                createHotel(hotelRepository, coimbatore, "Zone by The Park Coimbatore", "Mid-Range", "3100.00", "4.50", "Avinashi Road", "Lounge, Gym, Buffet, WiFi");
                createHotel(hotelRepository, coimbatore, "The Residency Towers Coimbatore", "Mid-Range", "4000.00", "4.60", "Race Course", "Pool, Afghan Grill, 24-hr Cafe");
                createHotel(hotelRepository, coimbatore, "Radisson Blu Coimbatore", "Premium", "7800.00", "4.70", "Peelamedu", "Rooftop Pool, Spa, Fine Dining");

                // 4. Restaurants (5 per city)
                createRestaurant(restaurantRepository, chennai, "Murugan Idli Shop", "South Indian", "140.00", "4.60", "Breakfast", "GN Chetty Rd");
                createRestaurant(restaurantRepository, chennai, "Saravana Bhavan Mylapore", "Pure Veg South Indian", "180.00", "4.40", "Breakfast", "North Mada St");
                createRestaurant(restaurantRepository, chennai, "Sangeetha Veg", "Vegetarian Multi-Cuisine", "260.00", "4.30", "Lunch", "Cathedral Road");
                createRestaurant(restaurantRepository, chennai, "Anjappar Chettinad", "Chettinad & Biryani", "420.00", "4.50", "Dinner", "Anna Salai");
                createRestaurant(restaurantRepository, chennai, "Dakshin Fine Dining", "South Indian Coastal", "950.00", "4.80", "Dinner", "TTK Road");

                createRestaurant(restaurantRepository, bengaluru, "Vidyarthi Bhavan", "Karnataka Tiffin & Dosa", "120.00", "4.70", "Breakfast", "Gandhi Bazaar");
                createRestaurant(restaurantRepository, bengaluru, "MTR (Mavalli Tiffin Room)", "Authentic South Indian", "190.00", "4.60", "Breakfast", "Lalbagh Road");
                createRestaurant(restaurantRepository, bengaluru, "Nagarjuna Andhra Style", "Andhra Meals & Biryani", "380.00", "4.50", "Lunch", "Residency Road");
                createRestaurant(restaurantRepository, bengaluru, "Toit Brewpub", "Continental & Bites", "650.00", "4.70", "Dinner", "100 Feet Rd");
                createRestaurant(restaurantRepository, bengaluru, "Karavalli Seafood", "Coastal South Indian", "1100.00", "4.90", "Dinner", "Residency Road");

                createRestaurant(restaurantRepository, pondicherry, "Indian Kaffe Express", "Cafe & Pancakes", "180.00", "4.40", "Breakfast", "Dumas Street");
                createRestaurant(restaurantRepository, pondicherry, "Surguru Vegetarian", "South Indian Thali", "160.00", "4.30", "Lunch", "Sardar Patel Salai");
                createRestaurant(restaurantRepository, pondicherry, "Cafe des Arts", "French Cafe & Crepes", "320.00", "4.60", "Lunch", "Suffren Street");
                createRestaurant(restaurantRepository, pondicherry, "Coromandel Cafe", "Continental & Artisan", "580.00", "4.70", "Dinner", "Romain Rolland St");
                createRestaurant(restaurantRepository, pondicherry, "La Villa Dining", "French Gourmet", "900.00", "4.80", "Dinner", "Surcouf Street");

                createRestaurant(restaurantRepository, madurai, "Murugan Idli Shop West Masi", "Madurai Ghee Idli", "130.00", "4.70", "Breakfast", "West Masi Street");
                createRestaurant(restaurantRepository, madurai, "Sree Sabarees Vegetarian", "Traditional Meals", "170.00", "4.40", "Lunch", "West Perumal Maistry St");
                createRestaurant(restaurantRepository, madurai, "Amma Mess", "Madurai Non-Veg Special", "350.00", "4.60", "Lunch", "Alagar Kovil Road");
                createRestaurant(restaurantRepository, madurai, "Kumar Mess", "Chettinad & Mutton Biryani", "400.00", "4.50", "Dinner", "100 Feet Road");
                createRestaurant(restaurantRepository, madurai, "Bells Plate Multi-Cuisine", "North Indian & Kebabs", "600.00", "4.30", "Dinner", "West Perumal Maistry St");

                createRestaurant(restaurantRepository, coimbatore, "Sree Annapoorna", "Coimbatore Sambar & Coffee", "150.00", "4.70", "Breakfast", "RS Puram");
                createRestaurant(restaurantRepository, coimbatore, "Aryas Pure Veg", "South Indian Breakfast", "140.00", "4.30", "Breakfast", "Gandhipuram");
                createRestaurant(restaurantRepository, coimbatore, "Haribhavanam", "Kongunadu Meals", "360.00", "4.60", "Lunch", "Avinashi Road");
                createRestaurant(restaurantRepository, coimbatore, "Bird On Tree", "Continental & Fine Indian", "600.00", "4.50", "Dinner", "Race Course Road");
                createRestaurant(restaurantRepository, coimbatore, "The French Door Cafe", "French Bistro & Grill", "850.00", "4.70", "Dinner", "RS Puram");

                // 5. Inter-City Routes
                createRoute(routeRepository, chennai, bengaluru, "346.00", "385.00", "6.50", "NH48 Expressway");
                createRoute(routeRepository, bengaluru, chennai, "346.00", "385.00", "6.50", "NH48 Expressway");
                createRoute(routeRepository, chennai, pondicherry, "151.00", "115.00", "3.20", "East Coast Road (ECR)");
                createRoute(routeRepository, pondicherry, chennai, "151.00", "115.00", "3.20", "East Coast Road (ECR)");
                createRoute(routeRepository, chennai, madurai, "462.00", "460.00", "7.50", "NH38 / GST Road");
                createRoute(routeRepository, madurai, chennai, "462.00", "460.00", "7.50", "NH38 / GST Road");
                createRoute(routeRepository, chennai, coimbatore, "505.00", "510.00", "8.50", "NH79 & NH544 via Salem");
                createRoute(routeRepository, coimbatore, chennai, "505.00", "510.00", "8.50", "NH79 & NH544 via Salem");
                createRoute(routeRepository, bengaluru, pondicherry, "310.00", "320.00", "6.00", "NH77 via Hosur");
                createRoute(routeRepository, pondicherry, bengaluru, "310.00", "320.00", "6.00", "NH77 via Hosur");
                createRoute(routeRepository, bengaluru, coimbatore, "365.00", "390.00", "6.50", "NH44 & NH544");
                createRoute(routeRepository, coimbatore, bengaluru, "365.00", "390.00", "6.50", "NH44 & NH544");
                createRoute(routeRepository, bengaluru, madurai, "435.00", "440.00", "7.00", "NH44 via Dindigul");
                createRoute(routeRepository, madurai, bengaluru, "435.00", "440.00", "7.00", "NH44 via Dindigul");
                createRoute(routeRepository, pondicherry, madurai, "335.00", "280.00", "5.80", "NH38 via Trichy");
                createRoute(routeRepository, madurai, pondicherry, "335.00", "280.00", "5.80", "NH38 via Trichy");
                createRoute(routeRepository, pondicherry, coimbatore, "380.00", "340.00", "7.00", "NH79 via Salem");
                createRoute(routeRepository, coimbatore, pondicherry, "380.00", "340.00", "7.00", "NH79 via Salem");
                createRoute(routeRepository, madurai, coimbatore, "215.00", "190.00", "4.30", "NH83 via Dindigul");
                createRoute(routeRepository, coimbatore, madurai, "215.00", "190.00", "4.30", "NH83 via Dindigul");

                log.info("Routewise default database seeding completed successfully!");
            }
        };
    }

    private void createAttraction(AttractionRepository repo, City city, String name, String category, String desc,
                                  String open, String close, int duration, String price, String rating) {
        Attraction a = new Attraction();
        a.setCity(city);
        a.setName(name);
        a.setCategory(category);
        a.setDescription(desc);
        a.setOpeningTime(LocalTime.parse(open));
        a.setClosingTime(LocalTime.parse(close));
        a.setAvgVisitDurationMins(duration);
        a.setTicketPrice(new BigDecimal(price));
        a.setRating(new BigDecimal(rating));
        repo.save(a);
    }

    private void createHotel(HotelRepository repo, City city, String name, String tier, String price, String rating, String addr, String amenities) {
        Hotel h = new Hotel();
        h.setCity(city);
        h.setName(name);
        h.setTier(tier);
        h.setPricePerNight(new BigDecimal(price));
        h.setRating(new BigDecimal(rating));
        h.setAddress(addr);
        h.setAmenities(amenities);
        repo.save(h);
    }

    private void createRestaurant(RestaurantRepository repo, City city, String name, String cuisine, String cost, String rating, String mealType, String addr) {
        Restaurant r = new Restaurant();
        r.setCity(city);
        r.setName(name);
        r.setCuisine(cuisine);
        r.setAvgCostPerPerson(new BigDecimal(cost));
        r.setRating(new BigDecimal(rating));
        r.setMealType(mealType);
        r.setAddress(addr);
        repo.save(r);
    }

    private void createRoute(RouteRepository repo, City origin, City dest, String km, String toll, String hours, String highway) {
        Route r = new Route();
        r.setOriginCity(origin);
        r.setDestinationCity(dest);
        r.setDistanceKm(new BigDecimal(km));
        r.setTollCost(new BigDecimal(toll));
        r.setEstimatedTimeHours(new BigDecimal(hours));
        r.setHighwayName(highway);
        repo.save(r);
    }
}
