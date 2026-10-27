-- =======================================================
-- Routewise: Seed Data
-- Cities: Chennai, Bengaluru, Pondicherry, Madurai, Coimbatore
-- Expanded realistic seed data: 10 Attractions, 6 Hotels, 8 Restaurants per city
-- Realistic INR Prices, Timings, Coordinates, Ratings & Scenic Scores
-- =======================================================

USE routewise_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE route_segments;
TRUNCATE TABLE route_legs;
TRUNCATE TABLE route_options;
TRUNCATE TABLE trip_items;
TRUNCATE TABLE trips;
TRUNCATE TABLE routes;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE hotels;
TRUNCATE TABLE attractions;
TRUNCATE TABLE cities;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- 1. Cities
-- -------------------------------------------------------
INSERT INTO cities (id, name, state, description, latitude, longitude) VALUES
(1, 'Chennai', 'Tamil Nadu', 'The cultural capital of South India, famous for Marina Beach, Kapaleeshwarar temple, and vibrant Carnatic music & culinary traditions.', 13.0827, 80.2707),
(2, 'Bengaluru', 'Karnataka', 'India Silicon Valley, known for lush gardens, pleasant climate, craft breweries, and royal heritage landmarks.', 12.9716, 77.5946),
(3, 'Pondicherry', 'Puducherry', 'French colonial seaside town with cobblestone promenades, Auroville spiritual haven, bohemian cafes, and serene beaches.', 11.9416, 79.8083),
(4, 'Madurai', 'Tamil Nadu', 'The ancient lotus city celebrated for the monumental Meenakshi Amman Temple, jasmine blossoms, and iconic street food.', 9.9252, 78.1198),
(5, 'Coimbatore', 'Tamil Nadu', 'The Manchester of South India, gateway to the Nilgiris, home to the massive Adiyogi Shiva bust, and textile heritage.', 11.0168, 76.9558)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- -------------------------------------------------------
-- 2. Attractions (10 per city = 50 total, scenic_score 0.0 - 1.0)
-- -------------------------------------------------------
-- CHENNAI (City 1)
INSERT INTO attractions (id, city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, scenic_score, latitude, longitude) VALUES
(1, 1, 'Marina Beach & Promenade', 'Beach', 'World second longest urban beach with historic lighthouse and bustling evening food stalls.', '05:00:00', '22:00:00', 90, 0.00, 4.60, 0.95, 13.0500, 80.2824),
(2, 1, 'Kapaleeshwarar Temple', 'Religious', 'Historic 7th-century Dravidian temple in Mylapore dedicated to Lord Shiva with ornate gopuram.', '06:00:00', '21:00:00', 75, 0.00, 4.80, 0.85, 13.0336, 80.2694),
(3, 1, 'Fort St. George & Museum', 'Heritage', '17th-century British coastal stronghold with a museum displaying colonial armaments and coins.', '09:00:00', '17:00:00', 100, 50.00, 4.30, 0.75, 13.0784, 80.2872),
(4, 1, 'San Thome Basilica', 'Religious', 'Stately neo-gothic Roman Catholic minor basilica built over the tomb of St. Thomas the Apostle.', '06:00:00', '20:00:00', 60, 0.00, 4.60, 0.82, 13.0337, 80.2782),
(5, 1, 'Government Museum Egmore', 'Museum', 'Major repository of Roman antiquities, bronzes from the Chola dynasty, and natural history.', '09:30:00', '17:00:00', 120, 100.00, 4.40, 0.65, 13.0732, 80.2585),
(6, 1, 'Guindy National Park & Snake Park', 'Nature', 'Protected forest sanctuary right in the heart of Chennai with blackbucks and reptile enclosure.', '09:00:00', '17:30:00', 90, 40.00, 4.20, 0.88, 13.0067, 80.2206),
(7, 1, 'DakshinaChitra Heritage Village', 'Heritage', 'Living-history open-air museum preserving classic architecture and crafts of South Indian states.', '10:00:00', '18:00:00', 150, 175.00, 4.70, 0.90, 12.8228, 80.2415),
(8, 1, 'Besant Nagar Elliot Beach', 'Beach', 'Calm sandy beach near Karl Schmidt memorial, flanked by contemporary coastal cafes.', '06:00:00', '22:00:00', 60, 0.00, 4.50, 0.92, 12.9994, 80.2713),
(9, 1, 'Valluvar Kottam Memorial', 'Heritage', 'Iconic chariot-shaped monument dedicated to the ancient Tamil philosopher-poet Thiruvalluvar.', '08:30:00', '17:30:00', 60, 10.00, 4.30, 0.80, 13.0537, 80.2415),
(10, 1, 'Semmozhi Poonga Botanical Garden', 'Nature', 'Lush 20-acre urban oasis featuring rare exotic plant species, Bonsai collection, and vertical gardens.', '10:00:00', '19:00:00', 75, 30.00, 4.40, 0.87, 13.0515, 80.2505),

-- BENGALURU (City 2)
(11, 2, 'Lalbagh Botanical Garden', 'Nature', 'Sprawling 240-acre botanical haven with Victorian glasshouse, ancient bonsai, and serene lake.', '06:00:00', '19:00:00', 120, 30.00, 4.70, 0.95, 12.9507, 77.5848),
(12, 2, 'Bangalore Palace', 'Heritage', 'Tudor-revival royal palace built by Chamaraja Wadiyar featuring wood carvings and battlements.', '10:00:00', '17:30:00', 90, 250.00, 4.40, 0.85, 12.9988, 77.5921),
(13, 2, 'Cubbon Park', 'Nature', 'Picturesque 300-acre green lung with shady bamboo groves, library, and colonial statues.', '06:00:00', '18:00:00', 90, 0.00, 4.60, 0.92, 12.9763, 77.5929),
(14, 2, 'Visvesvaraya Industrial & Tech Museum', 'Museum', 'Hands-on interactive science exhibitions, rocket engine models, and dinosaur enclave.', '09:30:00', '18:00:00', 120, 85.00, 4.60, 0.65, 12.9753, 77.5963),
(15, 2, 'Bull Temple (Nandi Temple)', 'Religious', '16th-century Vijayanagara style temple housing a colossal monolithic Nandi carved in granite.', '06:00:00', '20:00:00', 45, 0.00, 4.50, 0.78, 12.9427, 77.5681),
(16, 2, 'Tipu Sultan Summer Palace', 'Heritage', 'Intricate teakwood palace from the 1790s with ornate arches, floral motifs, and history gallery.', '08:30:00', '17:30:00', 60, 25.00, 4.20, 0.80, 12.9593, 77.5737),
(17, 2, 'Bannerghatta Biological Park Safari', 'Nature', 'Grand zoo, rescue center, and tiger safari reserve nestled in the Bannerghatta hills.', '09:30:00', '17:00:00', 180, 350.00, 4.50, 0.90, 12.8009, 77.5777),
(18, 2, 'ISKCON Temple Bangalore', 'Religious', 'Imposing neo-classical Vedic temple on Hare Krishna Hill with scenic viewpoint and temple hall.', '07:15:00', '20:30:00', 90, 0.00, 4.70, 0.88, 13.0098, 77.5511),
(19, 2, 'HAL Heritage Centre & Aerospace Museum', 'Museum', 'India first aerospace museum displaying historic aircraft, jet engines, and flight simulators.', '09:00:00', '17:00:00', 90, 50.00, 4.50, 0.76, 12.9554, 77.6740),
(20, 2, 'Sankey Tank & Promenade', 'Nature', 'Peaceful man-made lake built in 1882 flanked by lush gardens, walking track, and sunset points.', '06:00:00', '20:00:00', 60, 10.00, 4.40, 0.91, 13.0075, 77.5742),

-- PONDICHERRY (City 3)
(21, 3, 'Promenade Beach & French Quarter', 'Beach', 'Goubert Avenue seafront with French colonial villas, Gandhi statue, and sea breeze.', '05:00:00', '23:00:00', 90, 0.00, 4.70, 0.98, 11.9329, 79.8359),
(22, 3, 'Auroville & Matrimandir Viewpoint', 'Heritage', 'Universal township dedicated to human unity featuring the golden globe meditation pavilion.', '09:00:00', '17:00:00', 150, 0.00, 4.60, 0.94, 12.0069, 79.8106),
(23, 3, 'Sri Aurobindo Ashram', 'Religious', 'Quiet ashram founded in 1926 with samadhi of Sri Aurobindo and the Mother.', '08:00:00', '18:00:00', 60, 0.00, 4.60, 0.82, 11.9366, 79.8344),
(24, 3, 'Paradise Beach & Chunnambar Boat', 'Beach', 'Golden sand island beach reached by backwater boat ride with water sports and beach shacks.', '09:00:00', '17:00:00', 120, 200.00, 4.50, 0.96, 11.8797, 79.8155),
(25, 3, 'Basilica of Sacred Heart of Jesus', 'Religious', 'Gothic revival basilica renowned for its 28 stained glass panels depicting Jesus life.', '06:00:00', '19:30:00', 45, 0.00, 4.60, 0.84, 11.9262, 79.8272),
(26, 3, 'Pondicherry Botanical Gardens', 'Nature', 'Historic French layout garden featuring rare exotic flora, a toy train, and musical fountain.', '09:00:00', '18:00:00', 60, 20.00, 4.20, 0.86, 11.9304, 79.8228),
(27, 3, 'Serenity Beach', 'Beach', 'Surfing hotspot with gentle turquoise waves, surf school, and shoreline rocks.', '06:00:00', '20:00:00', 75, 0.00, 4.40, 0.93, 11.9702, 79.8452),
(28, 3, 'Pondicherry Museum', 'Museum', 'Gallery of Arikamedu Roman trade relics, Chola bronzes, and French colonial furniture.', '09:00:00', '17:00:00', 60, 30.00, 4.10, 0.70, 11.9348, 79.8354),
(29, 3, 'Arikamedu Roman Archaeological Site', 'Heritage', 'Ancient Indo-Roman maritime port ruin with brick warehouse remains and river views.', '09:00:00', '17:00:00', 60, 0.00, 4.20, 0.85, 11.9020, 79.8190),
(30, 3, 'Ousteri Lake & Bird Sanctuary', 'Nature', 'Century-old freshwater lake sanctuary supporting over 40 migratory waterfowl species.', '09:00:00', '17:30:00', 75, 50.00, 4.30, 0.92, 11.9540, 79.7420),

-- MADURAI (City 4)
(31, 4, 'Meenakshi Amman Temple', 'Religious', 'Pinnacle of Tamil temple architecture with 14 gopurams, thousand-pillar hall, and golden lotus pond.', '05:00:00', '21:30:00', 150, 50.00, 4.90, 0.95, 9.9195, 78.1193),
(32, 4, 'Thirumalai Nayakkar Palace', 'Heritage', '17th-century palace masterpiece blending Italian and Dravidian styles with towering pillars.', '09:00:00', '17:00:00', 75, 20.00, 4.50, 0.86, 9.9152, 78.1240),
(33, 4, 'Gandhi Memorial Museum', 'Museum', 'Historic Rani Mangammal palace housing Mahatma Gandhi personal blood-stained dhoti and artifacts.', '10:00:00', '17:30:00', 90, 10.00, 4.40, 0.78, 9.9300, 78.1400),
(34, 4, 'Alagar Kovil (Kallazhagar Temple)', 'Religious', 'Picturesque temple nestled against the Alagar hills surrounded by scenic nature trails.', '06:00:00', '19:00:00', 90, 0.00, 4.70, 0.92, 10.0760, 78.2140),
(35, 4, 'Vandiyur Mariamman Teppakulam', 'Religious', 'Colossal square temple tank with central island mandapam built in 1645 for float festivals.', '06:00:00', '20:00:00', 45, 0.00, 4.30, 0.80, 9.9110, 78.1510),
(36, 4, 'Koodal Azhagar Temple', 'Religious', 'Ancient temple dedicated to Vishnu featuring 3 postures: sitting, standing, and reclining.', '05:30:00', '21:00:00', 60, 0.00, 4.60, 0.82, 9.9150, 78.1130),
(37, 4, 'Samanar Hills (Jain Caves)', 'Heritage', 'Rock-cut hill caves with 9th-century Jain bas-relief sculptures and panoramic sunset views.', '06:00:00', '18:30:00', 90, 0.00, 4.50, 0.89, 9.9230, 78.0550),
(38, 4, 'Puthu Mandapam Market', 'Heritage', 'Historic 17th-century pillared hallway bustling with traditional tailor shops, textiles, and brassware.', '09:00:00', '21:00:00', 60, 0.00, 4.40, 0.72, 9.9189, 78.1202),
(39, 4, 'Thiruparankundram Murugan Temple', 'Religious', 'Ancient rock-cut cave temple carving into a granite hill, the first abode of Lord Murugan.', '05:30:00', '19:30:00', 75, 0.00, 4.80, 0.91, 9.8790, 78.0710),
(40, 4, 'Pazhamudircholai Murugan Temple', 'Religious', 'Sacred forest temple perched atop lush Alagar hills with natural springs and divine flora.', '06:00:00', '19:00:00', 60, 0.00, 4.70, 0.94, 10.0930, 78.2250),

-- COIMBATORE (City 5)
(41, 5, 'Adiyogi Shiva Bust & Isha Center', 'Religious', 'World largest bust sculpture of Lord Shiva (112 ft) situated at the foothills of Velliangiri.', '06:00:00', '20:00:00', 150, 0.00, 4.80, 0.97, 10.9733, 76.7405),
(42, 5, 'Marudhamalai Murugan Temple', 'Religious', 'Ancient hill temple surrounded by medicinal herbs, offering scenic views and peaceful vibe.', '06:00:00', '20:30:00', 90, 0.00, 4.70, 0.93, 11.0460, 76.8520),
(43, 5, 'Gass Forest Museum', 'Museum', 'Over a century-old natural history museum with preserved wildlife specimens and timber exhibits.', '09:00:00', '17:00:00', 60, 20.00, 4.30, 0.68, 11.0180, 76.9450),
(44, 5, 'VOC Park and Zoo', 'Park', 'Popular urban family park with gardens, animal enclosures, and children playground.', '09:00:00', '18:30:00', 75, 25.00, 4.10, 0.75, 11.0060, 76.9740),
(45, 5, 'Eachanari Vinayagar Temple', 'Religious', 'Revered 16th-century Ganesha temple featuring a massive 6-foot monolithic idol.', '05:00:00', '21:00:00', 45, 0.00, 4.60, 0.76, 10.9230, 76.9780),
(46, 5, 'GD Car Museum', 'Museum', 'Fascinating collection of vintage and modern automobiles from Britain, Germany, and India.', '09:00:00', '17:00:00', 90, 75.00, 4.70, 0.74, 11.0020, 76.9850),
(47, 5, 'Siruvani Waterfalls & Dam', 'Nature', 'Scenic waterfall in dense Western Ghats reserve, renowned for pristine sweet water.', '09:30:00', '15:30:00', 120, 100.00, 4.50, 0.96, 10.9500, 76.6900),
(48, 5, 'Perur Pateeswarar Temple', 'Religious', 'Magnificent temple built by Karikala Chola with Kanaka Sabha and stone pillar sculptures.', '06:00:00', '20:00:00', 60, 0.00, 4.70, 0.85, 10.9840, 76.9180),
(49, 5, 'Valankulam Lake Promenade', 'Nature', 'Revitalized lakefront promenade featuring floating jetties, walking decks, and sunset views.', '06:00:00', '21:00:00', 60, 10.00, 4.40, 0.90, 10.9920, 76.9690),
(50, 5, 'Brookefields Urban Center', 'Heritage', 'Vibrant city lifestyle and entertainment center hosting artisanal local expos and dining.', '10:00:00', '22:00:00', 90, 0.00, 4.50, 0.72, 11.0110, 76.9600)
ON DUPLICATE KEY UPDATE name=VALUES(name), scenic_score=VALUES(scenic_score);

-- -------------------------------------------------------
-- 3. Hotels (6 per city = 30 total: Budget to Premium)
-- -------------------------------------------------------
INSERT INTO hotels (id, city_id, name, tier, price_per_night, rating, address, amenities, contact_phone, latitude, longitude) VALUES
-- CHENNAI (City 1)
(1, 1, 'Hostel Chennai Central', 'Budget', 850.00, 4.10, 'Poonamallee High Rd, Periamet', 'Free WiFi, AC dorms, Lockers, Hot Water', '+91 44 2538 1201', 13.0836, 80.2750),
(2, 1, 'Mylapore Heritage Inn', 'Budget', 1400.00, 4.30, 'South Mada St, Mylapore', 'Free WiFi, Breakfast, AC, Near Temple', '+91 44 2464 8820', 13.0330, 80.2690),
(3, 1, 'The Residency Towers', 'Mid-Range', 3200.00, 4.50, 'Sir Thyagaraya Rd, T. Nagar', 'Swimming Pool, Breakfast, Gym, Restaurant, WiFi', '+91 44 2825 3434', 13.0410, 80.2340),
(4, 1, 'Savera Hotel', 'Mid-Range', 3800.00, 4.40, 'Dr. Radhakrishnan Salai, Mylapore', 'Pool, Piano Bar, Fitness Centre, Multi-Cuisine', '+91 44 2811 4700', 13.0450, 80.2580),
(5, 1, 'Taj Coromandel', 'Premium', 8500.00, 4.80, 'Mahatma Gandhi Rd, Nungambakkam', 'Luxury Spa, Fine Dining, Pool, Butler Service', '+91 44 6600 2827', 13.0610, 80.2440),
(6, 1, 'ITC Grand Chola', 'Premium', 12500.00, 4.90, 'No 63 Anna Salai, Guindy', 'Palatial Architecture, 10 Dining Outlets, Kaya Kalp Spa, Butler', '+91 44 2220 0000', 13.0105, 80.2208),

-- BENGALURU (City 2)
(7, 2, 'Zostel Bangalore', 'Budget', 950.00, 4.40, '80 Feet Rd, Koramangala', 'Rooftop Cafe, High-Speed WiFi, Games Room, AC', '+91 80 4120 4455', 12.9352, 77.6245),
(8, 2, 'Octave Hotel & Spa', 'Budget', 1600.00, 4.20, 'Marathahalli Main Rd', 'Free WiFi, Room Service, Breakfast, AC', '+91 80 4350 7800', 12.9560, 77.7010),
(9, 2, 'Lemon Tree Hotel Premier', 'Mid-Range', 3500.00, 4.50, 'Ulsoor, Near MG Road', 'Pool, Gym, Free Breakfast, Citrus Cafe, Valet', '+91 80 4480 2000', 12.9750, 77.6200),
(10, 2, 'The Chancery Pavilion', 'Mid-Range', 4200.00, 4.40, 'Residency Road, Ashok Nagar', 'Outdoor Pool, 24/7 Dining, Business Center', '+91 80 4141 4141', 12.9690, 77.5990),
(11, 2, 'The Oberoi Bengaluru', 'Premium', 9500.00, 4.90, 'MG Road, Bangalore Central', 'Lush Tropical Gardens, Personal Butler, Spa', '+91 80 2558 5858', 12.9740, 77.6180),
(12, 2, 'The Leela Palace Bengaluru', 'Premium', 13500.00, 4.90, 'Old Airport Road, Kodihalli', 'Royal Vijayanagara Grandeur, 6 Fine Dining venues, Spa, Butler', '+91 80 2521 1234', 12.9606, 77.6484),

-- PONDICHERRY (City 3)
(13, 3, 'Dune de L Orient Guest House', 'Budget', 1100.00, 4.30, 'Romain Rolland St, White Town', 'Heritage Verandah, Free WiFi, Cafe, AC', '+91 413 222 6600', 11.9335, 79.8340),
(14, 3, 'Pleasant Inn White Town', 'Budget', 1500.00, 4.20, 'Suffren Street, White Town', 'Cycle Rental, Free WiFi, Rooftop, AC', '+91 413 234 5090', 11.9310, 79.8320),
(15, 3, 'Villa Shanti', 'Mid-Range', 3900.00, 4.60, 'Rue Suffren, French Quarter', 'Courtyard Cafe, Boutique Rooms, French Cuisine', '+91 413 420 0028', 11.9320, 79.8335),
(16, 3, 'Promenade Beach Hotel', 'Mid-Range', 4600.00, 4.50, 'Goubert Avenue, Promenade', 'Ocean View, Rooftop Lounge, Swimming Pool', '+91 413 222 7750', 11.9340, 79.8360),
(17, 3, 'Palais de Mahe (CGH Earth)', 'Premium', 8800.00, 4.80, 'Bussy Street, French Quarter', 'Plunge Pool, Ayurvedic Center, Luxury Suites', '+91 413 230 0100', 11.9315, 79.8315),
(18, 3, 'Accord Puducherry', 'Premium', 6200.00, 4.60, 'Tilagar Nagar, Ellaipillaichavady', 'Large Pool, Season Multi-Cuisine, Zodiac Lounge, Gym & Spa', '+91 413 229 9000', 11.9440, 79.8080),

-- MADURAI (City 4)
(19, 4, 'Temple View Stay', 'Budget', 800.00, 4.20, 'Town Hall Road, Near Meenakshi Temple', 'Clean Rooms, Hot Water, 24/7 Desk, WiFi', '+91 452 234 1199', 9.9180, 78.1150),
(20, 4, 'Hotel Supreme', 'Budget', 1350.00, 4.10, 'West Perumal Maistry St', 'Rooftop Surya Restaurant, AC, Travel Desk', '+91 452 234 3151', 9.9170, 78.1120),
(21, 4, 'Fortune Pandiyan Hotel', 'Mid-Range', 2800.00, 4.40, 'Race Course Colony, Madurai', 'Swimming Pool, Orchid Multi-Cuisine, Lawn', '+91 452 435 6789', 9.9360, 78.1380),
(22, 4, 'Courtyard by Marriott Madurai', 'Mid-Range', 4200.00, 4.60, 'Alagar Kovil Road', 'Infinity Pool, 24/7 Gym, Buffet Breakfast', '+91 452 425 5555', 9.9400, 78.1420),
(23, 4, 'Heritage Madurai', 'Premium', 7500.00, 4.80, 'Kochadai, Melakkal Main Rd', 'Banyan Tree Villas, Temple Pool, Spa, Luxury', '+91 452 238 5455', 9.9320, 78.0810),
(24, 4, 'Gateway Hotel Pasumalai Madurai', 'Premium', 6800.00, 4.70, 'No 40 TPK Road, Pasumalai', 'Colonial Hilltop Estate, Peacocks, Pool, GReaT Buffets, Spa', '+91 452 663 3000', 9.8970, 78.0890),

-- COIMBATORE (City 5)
(25, 5, 'Coimbatore City Backpackers', 'Budget', 750.00, 4.00, 'Gandhipuram 2nd Street', 'WiFi, AC, Lockers, Common Lounge', '+91 422 252 8800', 11.0180, 76.9680),
(26, 5, 'Hotel Alankar Grande', 'Budget', 1600.00, 4.30, 'Sivasamy Road, Ram Nagar', 'Free Breakfast, Free WiFi, Travel Assistance', '+91 422 437 8888', 11.0150, 76.9610),
(27, 5, 'Zone by The Park Coimbatore', 'Mid-Range', 3100.00, 4.50, 'Avinashi Road, Lakshmi Mills', 'Trendy Lounge, Gym, Buffet, WiFi, Workspace', '+91 422 400 5000', 11.0120, 76.9850),
(28, 5, 'The Residency Towers Coimbatore', 'Mid-Range', 4000.00, 4.60, 'Avinashi Road, Race Course', 'Pool, Afghan Grill, 24-hr Coffee Shop', '+91 422 224 1414', 11.0080, 76.9790),
(29, 5, 'Radisson Blu Hotel Coimbatore', 'Premium', 7800.00, 4.70, 'Avinashi Road, Peelamedu', 'Rooftop Pool, Spa, Fine Dining, Bar, Butler', '+91 422 222 6000', 11.0280, 77.0050),
(30, 5, 'Vivanta Coimbatore', 'Premium', 7200.00, 4.70, 'Race Course Road, Gopalapuram', 'Taj Hospitality, Outdoor Pool, Jiva Spa, Latitude Dining', '+91 422 668 1000', 11.0015, 76.9760)
ON DUPLICATE KEY UPDATE name=VALUES(name), price_per_night=VALUES(price_per_night), latitude=VALUES(latitude), longitude=VALUES(longitude);

-- -------------------------------------------------------
-- 4. Restaurants (8 per city = 40 total: Breakfast, Lunch, Dinner)
-- -------------------------------------------------------
INSERT INTO restaurants (id, city_id, name, cuisine, avg_cost_per_person, rating, address, meal_type, latitude, longitude) VALUES
-- CHENNAI (City 1)
(1, 1, 'Murugan Idli Shop', 'South Indian', 140.00, 4.60, 'GN Chetty Rd, T. Nagar', 'Breakfast', 13.0425, 80.2335),
(2, 1, 'Saravana Bhavan Mylapore', 'Pure Veg South Indian', 180.00, 4.40, 'North Mada St, Mylapore', 'Breakfast', 13.0345, 80.2695),
(3, 1, 'Rayar Mess', 'Traditional Mylapore Tiffin', 110.00, 4.70, 'Arundale St, Mylapore', 'Breakfast', 13.0335, 80.2705),
(4, 1, 'Sangeetha Vegetarian Restaurant', 'Vegetarian Multi-Cuisine', 260.00, 4.30, 'Cathedral Road, Gopalapuram', 'Lunch', 13.0470, 80.2520),
(5, 1, 'Junior Kuppanna', 'Kongu & Seeraga Samba Biryani', 380.00, 4.50, 'Cathedral Road, Teynampet', 'Lunch', 13.0485, 80.2480),
(6, 1, 'Anjappar Chettinad Restaurant', 'Chettinad & Biryani', 420.00, 4.50, 'Anna Salai, Thousand Lights', 'Dinner', 13.0580, 80.2510),
(7, 1, 'The Marina Seafood', 'Fresh Coastal Seafood & Grills', 750.00, 4.70, 'College Road, Nungambakkam', 'Dinner', 13.0645, 80.2435),
(8, 1, 'Dakshin at Crowne Plaza', 'South Indian Fine Dining', 950.00, 4.80, 'TTK Road, Alwarpet', 'Dinner', 13.0315, 80.2505),

-- BENGALURU (City 2)
(9, 2, 'Vidyarthi Bhavan', 'Karnataka Tiffin & Dosa', 120.00, 4.70, 'Gandhi Bazaar, Basavanagudi', 'Breakfast', 12.9430, 77.5710),
(10, 2, 'MTR (Mavalli Tiffin Room)', 'Authentic South Indian', 190.00, 4.60, 'Lalbagh Road, Near Main Gate', 'Breakfast', 12.9550, 77.5870),
(11, 2, 'Brahmin Coffee Bar', 'Traditional Idli & Vada', 90.00, 4.80, 'Ranga Rao Rd, Shankarapura', 'Breakfast', 12.9538, 77.5694),
(12, 2, 'Nagarjuna Andhra Style', 'Andhra Meals & Biryani', 380.00, 4.50, 'Residency Road, Bangalore Central', 'Lunch', 12.9710, 77.6040),
(13, 2, 'Shivaji Military Hotel', 'Famous Donne Biryani', 320.00, 4.60, '8th Block, Jayanagar', 'Lunch', 12.9230, 77.5815),
(14, 2, 'Toit Brewpub & Kitchen', 'Continental & Pub Bites', 650.00, 4.70, '100 Feet Rd, Indiranagar', 'Dinner', 12.9790, 77.6400),
(15, 2, 'Windmills Craftworks', 'Artisan Craft Beer & Gourmet Grill', 850.00, 4.80, 'EPIP Zone, Whitefield', 'Dinner', 12.9820, 77.7215),
(16, 2, 'Karavalli (The Gateway Hotel)', 'Coastal South Indian Seafood', 1100.00, 4.90, 'Residency Road, Ashok Nagar', 'Dinner', 12.9695, 77.6015),

-- PONDICHERRY (City 3)
(17, 3, 'Indian Kaffe Express', 'Cafe & Pancakes', 180.00, 4.40, 'Dumas Street, White Town', 'Breakfast', 11.9325, 79.8345),
(18, 3, 'Baker Street French Bakery', 'Artisanal Croissants & Espresso', 220.00, 4.60, 'Bussy Street, MG Road Area', 'Breakfast', 11.9328, 79.8285),
(19, 3, 'Surguru Vegetarian Restaurant', 'South Indian Thali', 160.00, 4.30, 'Sardar Vallabhai Patel Salai', 'Lunch', 11.9360, 79.8280),
(20, 3, 'Cafe des Arts', 'French Cafe & Crepes', 320.00, 4.60, 'Suffren Street, White Town', 'Lunch', 11.9318, 79.8330),
(21, 3, 'Appachi Chettinad Traditional Mess', 'Authentic Chettinad Meals', 350.00, 4.50, 'Ranga Pillai St, MG Road', 'Lunch', 11.9355, 79.8260),
(22, 3, 'Coromandel Cafe', 'Continental & Artisan Bakery', 580.00, 4.70, 'Romain Rolland St, French Quarter', 'Dinner', 11.9340, 79.8340),
(23, 3, 'Carte Blanche', 'Creole French Seafood Cuisine', 780.00, 4.70, 'Romain Rolland St, White Town', 'Dinner', 11.9330, 79.8348),
(24, 3, 'La Villa Dining', 'Contemporary French Gourmet', 900.00, 4.80, 'Surcouf Street, White Town', 'Dinner', 11.9310, 79.8325),

-- MADURAI (City 4)
(25, 4, 'Murugan Idli Shop West Masi', 'Madurai Ghee Idli & Chutneys', 130.00, 4.70, 'West Masi Street, Madurai Main', 'Breakfast', 9.9190, 78.1140),
(26, 4, 'Modern Restaurant', 'Authentic Madurai Pongal & Coffee', 120.00, 4.50, 'Netaji Road, Madurai Main', 'Breakfast', 9.9180, 78.1160),
(27, 4, 'Sree Sabarees Vegetarian', 'South Indian Traditional Meals', 170.00, 4.40, 'West Perumal Maistry Street', 'Lunch', 9.9175, 78.1130),
(28, 4, 'Amma Mess', 'Authentic Non-Veg Madurai Special', 350.00, 4.60, 'Alagar Kovil Road, Tallakulam', 'Lunch', 9.9380, 78.1390),
(29, 4, 'Konar Mess', 'Legendary Kari Dosa & Kola Urundai', 340.00, 4.70, 'North Veli Street, Simmakkal', 'Lunch', 9.9260, 78.1180),
(30, 4, 'Kumar Mess', 'Chettinad & Mutton Biryani', 400.00, 4.50, '100 Feet Road, Madurai', 'Dinner', 9.9240, 78.1280),
(31, 4, 'Sree Chitra Mess', 'Traditional Pure Veg Plantain Leaf Meals', 190.00, 4.40, 'West Perumal Maistry St', 'Dinner', 9.9160, 78.1120),
(32, 4, 'Bells Plate Multi-Cuisine', 'North Indian & Kebabs', 600.00, 4.30, 'West Perumal Maistry St', 'Dinner', 9.9165, 78.1125),

-- COIMBATORE (City 5)
(33, 5, 'Sree Annapoorna Gowrishankar', 'Iconic Coimbatore Sambar & Coffee', 150.00, 4.70, 'East Arokiasamy Rd, RS Puram', 'Breakfast', 11.0110, 76.9510),
(34, 5, 'Aryas Pure Veg', 'South Indian Breakfast & Thali', 140.00, 4.30, 'Opposite Railway Station, Gandhipuram', 'Breakfast', 11.0175, 76.9690),
(35, 5, 'Geetha Cafe', 'Heritage Ghee Roast & Vadai', 110.00, 4.50, 'Geetha Hall Road, Near Railway Station', 'Breakfast', 11.0010, 76.9650),
(36, 5, 'Haribhavanam Kongu Cuisine', 'Authentic Kongunadu Meals', 360.00, 4.60, 'Avinashi Road, Peelamedu', 'Lunch', 11.0260, 77.0010),
(37, 5, 'Junior Kuppanna Coimbatore', 'Kongu Mutton Biryani & Nalli Fry', 370.00, 4.60, 'Gandhipuram 7th Cross', 'Lunch', 11.0185, 76.9695),
(38, 5, 'Bird On Tree', 'Continental & Fine Indian', 600.00, 4.50, 'Race Course Road, Thomas Park', 'Dinner', 11.0070, 76.9780),
(39, 5, 'Afghan Grill at Residency', 'Rooftop Frontier Cuisine & Kebabs', 750.00, 4.70, 'Avinashi Rd, Race Course', 'Dinner', 11.0080, 76.9790),
(40, 5, 'The French Door Cafe', 'French Bistro & European Grill', 850.00, 4.70, 'Bashyakarlu Rd, RS Puram', 'Dinner', 11.0125, 76.9530)
ON DUPLICATE KEY UPDATE name=VALUES(name), avg_cost_per_person=VALUES(avg_cost_per_person), latitude=VALUES(latitude), longitude=VALUES(longitude);

-- -------------------------------------------------------
-- 5. Inter-City Routes (Bidirectional distances & tolls)
-- -------------------------------------------------------
INSERT INTO routes (origin_city_id, destination_city_id, distance_km, toll_cost, estimated_time_hours, highway_name) VALUES
(1, 2, 346.00, 385.00, 6.50, 'NH48 / Bangalore-Chennai Expressway'),
(2, 1, 346.00, 385.00, 6.50, 'NH48 / Bangalore-Chennai Expressway'),
(1, 3, 151.00, 115.00, 3.20, 'East Coast Road (ECR) / NH32'),
(3, 1, 151.00, 115.00, 3.20, 'East Coast Road (ECR) / NH32'),
(1, 4, 462.00, 460.00, 7.50, 'NH38 / Grand Southern Trunk (GST)'),
(4, 1, 462.00, 460.00, 7.50, 'NH38 / Grand Southern Trunk (GST)'),
(1, 5, 505.00, 510.00, 8.50, 'NH79 & NH544 via Salem'),
(5, 1, 505.00, 510.00, 8.50, 'NH79 & NH544 via Salem'),
(2, 3, 310.00, 320.00, 6.00, 'NH77 via Hosur & Krishnagiri'),
(3, 2, 310.00, 320.00, 6.00, 'NH77 via Hosur & Krishnagiri'),
(2, 5, 365.00, 390.00, 6.50, 'NH44 & NH544 via Salem'),
(5, 2, 365.00, 390.00, 6.50, 'NH44 & NH544 via Salem'),
(2, 4, 435.00, 440.00, 7.00, 'NH44 via Salem & Dindigul'),
(4, 2, 435.00, 440.00, 7.00, 'NH44 via Salem & Dindigul'),
(3, 4, 335.00, 280.00, 5.80, 'NH38 via Trichy'),
(4, 3, 335.00, 280.00, 5.80, 'NH38 via Trichy'),
(3, 5, 380.00, 340.00, 7.00, 'NH79 via Villupuram & Salem'),
(5, 3, 380.00, 340.00, 7.00, 'NH79 via Villupuram & Salem'),
(4, 5, 215.00, 190.00, 4.30, 'NH83 via Dindigul & Dharapuram'),
(5, 4, 215.00, 190.00, 4.30, 'NH83 via Dindigul & Dharapuram')
ON DUPLICATE KEY UPDATE distance_km=VALUES(distance_km), toll_cost=VALUES(toll_cost);

-- -------------------------------------------------------
-- 6. Cached Intra-City Route Segments for Chennai (City 1)
-- Connecting Key Stops with Scenic Scores, Difficulty, Turns, Geometry
-- -------------------------------------------------------
INSERT INTO route_segments (city_id, from_name, to_name, from_lat, from_lng, to_lat, to_lng, distance_km, duration_mins, toll_cost, scenic_score, difficulty, turns_count, congestion_penalty, road_name, geometry_json) VALUES
-- Mylapore Heritage Inn -> Kapaleeshwarar Temple
(1, 'Mylapore Heritage Inn', 'Kapaleeshwarar Temple', 13.0330, 80.2690, 13.0336, 80.2694, 0.40, 3, 0.00, 0.88, 'Easy', 1, 0.50, 'South Mada Street', '[[13.0330, 80.2690], [13.0336, 80.2694]]'),
(1, 'Kapaleeshwarar Temple', 'Mylapore Heritage Inn', 13.0336, 80.2694, 13.0330, 80.2690, 0.40, 3, 0.00, 0.88, 'Easy', 1, 0.50, 'South Mada Street', '[[13.0336, 80.2694], [13.0330, 80.2690]]'),

-- Kapaleeshwarar Temple -> San Thome Basilica
(1, 'Kapaleeshwarar Temple', 'San Thome Basilica', 13.0336, 80.2694, 13.0337, 80.2782, 1.20, 6, 0.00, 0.85, 'Easy', 2, 1.00, 'Kutchery Rd & Santhome High Rd', '[[13.0336, 80.2694], [13.0340, 80.2730], [13.0337, 80.2782]]'),
(1, 'San Thome Basilica', 'Kapaleeshwarar Temple', 13.0337, 80.2782, 13.0336, 80.2694, 1.20, 6, 0.00, 0.85, 'Easy', 2, 1.00, 'Kutchery Rd & Santhome High Rd', '[[13.0337, 80.2782], [13.0340, 80.2730], [13.0336, 80.2694]]'),

-- San Thome Basilica -> Marina Beach & Promenade (Coastline Scenic Drive)
(1, 'San Thome Basilica', 'Marina Beach & Promenade', 13.0337, 80.2782, 13.0500, 80.2824, 2.30, 8, 0.00, 0.98, 'Easy', 2, 1.50, 'Kamarajar Promenade (Coastal Road)', '[[13.0337, 80.2782], [13.0420, 80.2805], [13.0500, 80.2824]]'),
(1, 'Marina Beach & Promenade', 'San Thome Basilica', 13.0500, 80.2824, 13.0337, 80.2782, 2.30, 8, 0.00, 0.98, 'Easy', 2, 1.50, 'Kamarajar Promenade (Coastal Road)', '[[13.0500, 80.2824], [13.0420, 80.2805], [13.0337, 80.2782]]'),

-- Marina Beach -> Fort St. George & Museum
(1, 'Marina Beach & Promenade', 'Fort St. George & Museum', 13.0500, 80.2824, 13.0784, 80.2872, 3.80, 11, 0.00, 0.90, 'Easy', 3, 2.00, 'Kamarajar Salai Seaside Boulevard', '[[13.0500, 80.2824], [13.0650, 80.2850], [13.0784, 80.2872]]'),
(1, 'Fort St. George & Museum', 'Marina Beach & Promenade', 13.0784, 80.2872, 13.0500, 80.2824, 3.80, 11, 0.00, 0.90, 'Easy', 3, 2.00, 'Kamarajar Salai Seaside Boulevard', '[[13.0784, 80.2872], [13.0650, 80.2850], [13.0500, 80.2824]]'),

-- Fort St. George -> Government Museum Egmore
(1, 'Fort St. George & Museum', 'Government Museum Egmore', 13.0784, 80.2872, 13.0732, 80.2585, 3.90, 14, 0.00, 0.70, 'Normal', 5, 3.50, 'EVR Periyar Salai (Poonamallee High Rd)', '[[13.0784, 80.2872], [13.0810, 80.2750], [13.0732, 80.2585]]'),
(1, 'Government Museum Egmore', 'Fort St. George & Museum', 13.0732, 80.2585, 13.0784, 80.2872, 3.90, 14, 0.00, 0.70, 'Normal', 5, 3.50, 'EVR Periyar Salai (Poonamallee High Rd)', '[[13.0732, 80.2585], [13.0810, 80.2750], [13.0784, 80.2872]]'),

-- Government Museum Egmore -> Saravana Bhavan Mylapore
(1, 'Government Museum Egmore', 'Saravana Bhavan Mylapore', 13.0732, 80.2585, 13.0345, 80.2695, 5.10, 17, 0.00, 0.65, 'Normal', 6, 4.00, 'Radhakrishnan Salai & Royapettah High Rd', '[[13.0732, 80.2585], [13.0550, 80.2610], [13.0345, 80.2695]]'),
(1, 'Saravana Bhavan Mylapore', 'Government Museum Egmore', 13.0345, 80.2695, 13.0732, 80.2585, 5.10, 17, 0.00, 0.65, 'Normal', 6, 4.00, 'Radhakrishnan Salai & Royapettah High Rd', '[[13.0345, 80.2695], [13.0550, 80.2610], [13.0732, 80.2585]]'),

-- Saravana Bhavan Mylapore -> Besant Nagar Elliot Beach
(1, 'Saravana Bhavan Mylapore', 'Besant Nagar Elliot Beach', 13.0345, 80.2695, 12.9994, 80.2713, 4.40, 15, 0.00, 0.88, 'Easy', 3, 2.00, 'Adyar Bridge & Sardar Patel Rd', '[[13.0345, 80.2695], [13.0120, 80.2680], [12.9994, 80.2713]]'),
(1, 'Besant Nagar Elliot Beach', 'Saravana Bhavan Mylapore', 12.9994, 80.2713, 13.0345, 80.2695, 4.40, 15, 0.00, 0.88, 'Easy', 3, 2.00, 'Adyar Bridge & Sardar Patel Rd', '[[12.9994, 80.2713], [13.0120, 80.2680], [13.0345, 80.2695]]'),

-- Besant Nagar Elliot Beach -> Guindy National Park & Snake Park
(1, 'Besant Nagar Elliot Beach', 'Guindy National Park & Snake Park', 12.9994, 80.2713, 13.0067, 80.2206, 6.20, 19, 0.00, 0.82, 'Normal', 4, 3.00, 'Sardar Patel Road Artery', '[[12.9994, 80.2713], [13.0070, 80.2450], [13.0067, 80.2206]]'),
(1, 'Guindy National Park & Snake Park', 'Besant Nagar Elliot Beach', 13.0067, 80.2206, 12.9994, 80.2713, 6.20, 19, 0.00, 0.82, 'Normal', 4, 3.00, 'Sardar Patel Road Artery', '[[13.0067, 80.2206], [13.0070, 80.2450], [12.9994, 80.2713]]'),

-- Guindy National Park -> Anjappar Chettinad Restaurant
(1, 'Guindy National Park & Snake Park', 'Anjappar Chettinad Restaurant', 13.0067, 80.2206, 13.0580, 80.2510, 7.80, 24, 0.00, 0.68, 'Normal', 5, 4.50, 'Anna Salai Grand Trunk', '[[13.0067, 80.2206], [13.0320, 80.2380], [13.0580, 80.2510]]'),
(1, 'Anjappar Chettinad Restaurant', 'Guindy National Park & Snake Park', 13.0580, 80.2510, 13.0067, 80.2206, 7.80, 24, 0.00, 0.68, 'Normal', 5, 4.50, 'Anna Salai Grand Trunk', '[[13.0580, 80.2510], [13.0320, 80.2380], [13.0067, 80.2206]]'),

-- -------------------------------------------------------
-- 7. Booking Links Templates
-- -------------------------------------------------------
INSERT INTO booking_links (stop_type, stop_id, provider, url_template) VALUES
('hotel', NULL, 'makemytrip', 'https://www.makemytrip.com/hotels/hotel-listing/?city={city}&hotelName={name}&checkin={checkin}&checkout={checkout}&roomStay={guests}'),
('hotel', NULL, 'booking.com', 'https://www.booking.com/searchresults.html?ss={name}+{city}&checkin={checkin}&checkout={checkout}&group_adults={guests}'),
('hotel', NULL, 'google_maps', 'https://www.google.com/maps/search/?api=1&query={name}+{city}'),
('restaurant', NULL, 'google_maps', 'https://www.google.com/maps/search/?api=1&query={name}+{city}'),
('restaurant', NULL, 'zomato', 'https://www.zomato.com/{city_slug}/restaurants?q={name}'),
('restaurant', NULL, 'swiggy', 'https://www.swiggy.com/search?query={name}'),
('attraction', NULL, 'google_maps', 'https://www.google.com/maps/search/?api=1&query={name}+{city}'),
('attraction', NULL, 'official', 'https://www.google.com/search?q={name}+{city}+official+tickets'),
('transport', NULL, 'redbus', 'https://www.redbus.in/bus-tickets/{source}-to-{destination}?date={date}'),
('transport', NULL, 'irctc', 'https://www.irctc.co.in/nget/train-search?src={source}&dst={destination}&date={date}')
ON DUPLICATE KEY UPDATE url_template=VALUES(url_template);

