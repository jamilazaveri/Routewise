-- =======================================================
-- Routewise: Seed Data
-- Cities: Chennai, Bengaluru, Pondicherry, Madurai, Coimbatore
-- Realistic INR Prices, Timings, Coordinates, Ratings & Scenic Scores
-- =======================================================

USE routewise_db;

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
-- 2. Attractions (with realistic scenic_score 0.0 - 1.0)
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
(8, 1, 'Besant Nagar Elliot Beach', 'Beach', 'Calm sandy beach near Karl Schmidt memorial, flanked by contemporary coastal cafes.', '06:00:00', '22:00:00', 60, 0.00, 4.50, 0.92, 12.9994, 80.2713)
ON DUPLICATE KEY UPDATE name=VALUES(name), scenic_score=VALUES(scenic_score);

-- BENGALURU (City 2)
INSERT INTO attractions (id, city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, scenic_score, latitude, longitude) VALUES
(9, 2, 'Lalbagh Botanical Garden', 'Nature', 'Sprawling 240-acre botanical haven with Victorian glasshouse, ancient bonsai, and serene lake.', '06:00:00', '19:00:00', 120, 30.00, 4.70, 0.95, 12.9507, 77.5848),
(10, 2, 'Bangalore Palace', 'Heritage', 'Tudor-revival royal palace built by Chamaraja Wadiyar featuring wood carvings and battlements.', '10:00:00', '17:30:00', 90, 250.00, 4.40, 0.85, 12.9988, 77.5921),
(11, 2, 'Cubbon Park', 'Nature', 'Picturesque 300-acre green lung with shady bamboo groves, library, and colonial statues.', '06:00:00', '18:00:00', 90, 0.00, 4.60, 0.92, 12.9763, 77.5929),
(12, 2, 'Visvesvaraya Industrial & Tech Museum', 'Museum', 'Hands-on interactive science exhibitions, rocket engine models, and dinosaur enclave.', '09:30:00', '18:00:00', 120, 85.00, 4.60, 0.65, 12.9753, 77.5963),
(13, 2, 'Bull Temple (Nandi Temple)', 'Religious', '16th-century Vijayanagara style temple housing a colossal monolithic Nandi carved in granite.', '06:00:00', '20:00:00', 45, 0.00, 4.50, 0.78, 12.9427, 77.5681),
(14, 2, 'Tipu Sultan Summer Palace', 'Heritage', 'Intricate teakwood palace from the 1790s with ornate arches, floral motifs, and history gallery.', '08:30:00', '17:30:00', 60, 25.00, 4.20, 0.80, 12.9593, 77.5737),
(15, 2, 'Bannerghatta Biological Park Safari', 'Nature', 'Grand zoo, rescue center, and tiger safari reserve nestled in the Bannerghatta hills.', '09:30:00', '17:00:00', 180, 350.00, 4.50, 0.90, 12.8009, 77.5777),
(16, 2, 'ISKCON Temple Bangalore', 'Religious', 'Imposing neo-classical Vedic temple on Hare Krishna Hill with scenic viewpoint and temple hall.', '07:15:00', '20:30:00', 90, 0.00, 4.70, 0.88, 13.0098, 77.5511)
ON DUPLICATE KEY UPDATE name=VALUES(name), scenic_score=VALUES(scenic_score);

-- PONDICHERRY (City 3)
INSERT INTO attractions (id, city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, scenic_score, latitude, longitude) VALUES
(17, 3, 'Promenade Beach & French Quarter', 'Beach', 'Goubert Avenue seafront with French colonial villas, Gandhi statue, and sea breeze.', '05:00:00', '23:00:00', 90, 0.00, 4.70, 0.98, 11.9329, 79.8359),
(18, 3, 'Auroville & Matrimandir Viewpoint', 'Heritage', 'Universal township dedicated to human unity featuring the golden globe meditation pavilion.', '09:00:00', '17:00:00', 150, 0.00, 4.60, 0.94, 12.0069, 79.8106),
(19, 3, 'Sri Aurobindo Ashram', 'Religious', 'Quiet ashram founded in 1926 with samadhi of Sri Aurobindo and the Mother.', '08:00:00', '18:00:00', 60, 0.00, 4.60, 0.82, 11.9366, 79.8344),
(20, 3, 'Paradise Beach & Chunnambar Boat', 'Beach', 'Golden sand island beach reached by backwater boat ride with water sports and beach shacks.', '09:00:00', '17:00:00', 120, 200.00, 4.50, 0.96, 11.8797, 79.8155),
(21, 3, 'Basilica of Sacred Heart of Jesus', 'Religious', 'Gothic revival basilica renowned for its 28 stained glass panels depicting Jesus life.', '06:00:00', '19:30:00', 45, 0.00, 4.60, 0.84, 11.9262, 79.8272),
(22, 3, 'Pondicherry Botanical Gardens', 'Nature', 'Historic French layout garden featuring rare exotic flora, a toy train, and musical fountain.', '09:00:00', '18:00:00', 60, 20.00, 4.20, 0.86, 11.9304, 79.8228),
(23, 3, 'Serenity Beach', 'Beach', 'Surfing hotspot with gentle turquoise waves, surf school, and shoreline rocks.', '06:00:00', '20:00:00', 75, 0.00, 4.40, 0.93, 11.9702, 79.8452),
(24, 3, 'Pondicherry Museum', 'Museum', 'Gallery of Arikamedu Roman trade relics, Chola bronzes, and French colonial furniture.', '09:00:00', '17:00:00', 60, 30.00, 4.10, 0.70, 11.9348, 79.8354)
ON DUPLICATE KEY UPDATE name=VALUES(name), scenic_score=VALUES(scenic_score);

-- MADURAI (City 4)
INSERT INTO attractions (id, city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, scenic_score, latitude, longitude) VALUES
(25, 4, 'Meenakshi Amman Temple', 'Religious', 'Pinnacle of Tamil temple architecture with 14 gopurams, thousand-pillar hall, and golden lotus pond.', '05:00:00', '21:30:00', 150, 50.00, 4.90, 0.95, 9.9195, 78.1193),
(26, 4, 'Thirumalai Nayakkar Palace', 'Heritage', '17th-century palace masterpiece blending Italian and Dravidian styles with towering pillars.', '09:00:00', '17:00:00', 75, 20.00, 4.50, 0.86, 9.9152, 78.1240),
(27, 4, 'Gandhi Memorial Museum', 'Museum', 'Historic Rani Mangammal palace housing Mahatma Gandhi personal blood-stained dhoti and artifacts.', '10:00:00', '17:30:00', 90, 10.00, 4.40, 0.78, 9.9300, 78.1400),
(28, 4, 'Alagar Kovil (Kallazhagar Temple)', 'Religious', 'Picturesque temple nestled against the Alagar hills surrounded by scenic nature trails.', '06:00:00', '19:00:00', 90, 0.00, 4.70, 0.92, 10.0760, 78.2140),
(29, 4, 'Vandiyur Mariamman Teppakulam', 'Religious', 'Colossal square temple tank with central island mandapam built in 1645 for float festivals.', '06:00:00', '20:00:00', 45, 0.00, 4.30, 0.80, 9.9110, 78.1510),
(30, 4, 'Koodal Azhagar Temple', 'Religious', 'Ancient temple dedicated to Vishnu featuring 3 postures: sitting, standing, and reclining.', '05:30:00', '21:00:00', 60, 0.00, 4.60, 0.82, 9.9150, 78.1130),
(31, 4, 'Samanar Hills (Jain Caves)', 'Heritage', 'Rock-cut hill caves with 9th-century Jain bas-relief sculptures and panoramic sunset views.', '06:00:00', '18:30:00', 90, 0.00, 4.50, 0.89, 9.9230, 78.0550),
(32, 4, 'Puthu Mandapam Market', 'Heritage', 'Historic 17th-century pillared hallway bustling with traditional tailor shops, textiles, and brassware.', '09:00:00', '21:00:00', 60, 0.00, 4.40, 0.72, 9.9189, 78.1202)
ON DUPLICATE KEY UPDATE name=VALUES(name), scenic_score=VALUES(scenic_score);

-- COIMBATORE (City 5)
INSERT INTO attractions (id, city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, scenic_score, latitude, longitude) VALUES
(33, 5, 'Adiyogi Shiva Bust & Isha Center', 'Religious', 'World largest bust sculpture of Lord Shiva (112 ft) situated at the foothills of Velliangiri.', '06:00:00', '20:00:00', 150, 0.00, 4.80, 0.97, 10.9733, 76.7405),
(34, 5, 'Marudhamalai Murugan Temple', 'Religious', 'Ancient hill temple surrounded by medicinal herbs, offering scenic views and peaceful vibe.', '06:00:00', '20:30:00', 90, 0.00, 4.70, 0.93, 11.0460, 76.8520),
(35, 5, 'Gass Forest Museum', 'Museum', 'Over a century-old natural history museum with preserved wildlife specimens and timber exhibits.', '09:00:00', '17:00:00', 60, 20.00, 4.30, 0.68, 11.0180, 76.9450),
(36, 5, 'VOC Park and Zoo', 'Park', 'Popular urban family park with gardens, animal enclosures, and children playground.', '09:00:00', '18:30:00', 75, 25.00, 4.10, 0.75, 11.0060, 76.9740),
(37, 5, 'Eachanari Vinayagar Temple', 'Religious', 'Revered 16th-century Ganesha temple featuring a massive 6-foot monolithic idol.', '05:00:00', '21:00:00', 45, 0.00, 4.60, 0.76, 10.9230, 76.9780),
(38, 5, 'GD Car Museum', 'Museum', 'Fascinating collection of vintage and modern automobiles from Britain, Germany, and India.', '09:00:00', '17:00:00', 90, 75.00, 4.70, 0.74, 11.0020, 76.9850),
(39, 5, 'Siruvani Waterfalls & Dam', 'Nature', 'Scenic waterfall in dense Western Ghats reserve, renowned for pristine sweet water.', '09:30:00', '15:30:00', 120, 100.00, 4.50, 0.96, 10.9500, 76.6900),
(40, 5, 'Perur Pateeswarar Temple', 'Religious', 'Magnificent temple built by Karikala Chola with Kanaka Sabha and stone pillar sculptures.', '06:00:00', '20:00:00', 60, 0.00, 4.70, 0.85, 10.9840, 76.9180)
ON DUPLICATE KEY UPDATE name=VALUES(name), scenic_score=VALUES(scenic_score);

-- -------------------------------------------------------
-- 3. Hotels (with Coordinates)
-- -------------------------------------------------------
-- CHENNAI (City 1)
INSERT INTO hotels (id, city_id, name, tier, price_per_night, rating, address, amenities, contact_phone, latitude, longitude) VALUES
(1, 1, 'Hostel Chennai Central', 'Budget', 850.00, 4.10, 'Poonamallee High Rd, Periamet', 'Free WiFi, AC dorms, Lockers, Hot Water', '+91 44 2538 1201', 13.0836, 80.2750),
(2, 1, 'Mylapore Heritage Inn', 'Budget', 1400.00, 4.30, 'South Mada St, Mylapore', 'Free WiFi, Breakfast, AC, Near Temple', '+91 44 2464 8820', 13.0330, 80.2690),
(3, 1, 'The Residency Towers', 'Mid-Range', 3200.00, 4.50, 'Sir Thyagaraya Rd, T. Nagar', 'Swimming Pool, Breakfast, Gym, Restaurant, WiFi', '+91 44 2825 3434', 13.0410, 80.2340),
(4, 1, 'Savera Hotel', 'Mid-Range', 3800.00, 4.40, 'Dr. Radhakrishnan Salai, Mylapore', 'Pool, Piano Bar, Fitness Centre, Multi-Cuisine', '+91 44 2811 4700', 13.0450, 80.2580),
(5, 1, 'Taj Coromandel', 'Premium', 8500.00, 4.80, 'Mahatma Gandhi Rd, Nungambakkam', 'Luxury Spa, Fine Dining, Pool, Butler Service', '+91 44 6600 2827', 13.0610, 80.2440),

-- BENGALURU (City 2)
(6, 2, 'Zostel Bangalore', 'Budget', 950.00, 4.40, '80 Feet Rd, Koramangala', 'Rooftop Cafe, High-Speed WiFi, Games Room, AC', '+91 80 4120 4455', 12.9352, 77.6245),
(7, 2, 'Octave Hotel & Spa', 'Budget', 1600.00, 4.20, 'Marathahalli Main Rd', 'Free WiFi, Room Service, Breakfast, AC', '+91 80 4350 7800', 12.9560, 77.7010),
(8, 2, 'Lemon Tree Hotel Premier', 'Mid-Range', 3500.00, 4.50, 'Ulsoor, Near MG Road', 'Pool, Gym, Free Breakfast, Citrus Cafe, Valet', '+91 80 4480 2000', 12.9750, 77.6200),
(9, 2, 'The Chancery Pavilion', 'Mid-Range', 4200.00, 4.40, 'Residency Road, Ashok Nagar', 'Outdoor Pool, 24/7 Dining, Business Center', '+91 80 4141 4141', 12.9690, 77.5990),
(10, 2, 'The Oberoi Bengaluru', 'Premium', 9500.00, 4.90, 'MG Road, Bangalore Central', 'Lush Tropical Gardens, Personal Butler, Spa', '+91 80 2558 5858', 12.9740, 77.6180),

-- PONDICHERRY (City 3)
(11, 3, 'Dune de L Orient Guest House', 'Budget', 1100.00, 4.30, 'Romain Rolland St, White Town', 'Heritage Verandah, Free WiFi, Cafe, AC', '+91 413 222 6600', 11.9335, 79.8340),
(12, 3, 'Pleasant Inn White Town', 'Budget', 1500.00, 4.20, 'Suffren Street, White Town', 'Cycle Rental, Free WiFi, Rooftop, AC', '+91 413 234 5090', 11.9310, 79.8320),
(13, 3, 'Villa Shanti', 'Mid-Range', 3900.00, 4.60, 'Rue Suffren, French Quarter', 'Courtyard Cafe, Boutique Rooms, French Cuisine', '+91 413 420 0028', 11.9320, 79.8335),
(14, 3, 'Promenade Beach Hotel', 'Mid-Range', 4600.00, 4.50, 'Goubert Avenue, Promenade', 'Ocean View, Rooftop Lounge, Swimming Pool', '+91 413 222 7750', 11.9340, 79.8360),
(15, 3, 'Palais de Mahe (CGH Earth)', 'Premium', 8800.00, 4.80, 'Bussy Street, French Quarter', 'Plunge Pool, Ayurvedic Center, Luxury Suites', '+91 413 230 0100', 11.9315, 79.8315),

-- MADURAI (City 4)
(16, 4, 'Temple View Stay', 'Budget', 800.00, 4.20, 'Town Hall Road, Near Meenakshi Temple', 'Clean Rooms, Hot Water, 24/7 Desk, WiFi', '+91 452 234 1199', 9.9180, 78.1150),
(17, 4, 'Hotel Supreme', 'Budget', 1350.00, 4.10, 'West Perumal Maistry St', 'Rooftop Surya Restaurant, AC, Travel Desk', '+91 452 234 3151', 9.9170, 78.1120),
(18, 4, 'Fortune Pandiyan Hotel', 'Mid-Range', 2800.00, 4.40, 'Race Course Colony, Madurai', 'Swimming Pool, Orchid Multi-Cuisine, Lawn', '+91 452 435 6789', 9.9360, 78.1380),
(19, 4, 'Courtyard by Marriott Madurai', 'Mid-Range', 4200.00, 4.60, 'Alagar Kovil Road', 'Infinity Pool, 24/7 Gym, Buffet Breakfast', '+91 452 425 5555', 9.9400, 78.1420),
(20, 4, 'Heritage Madurai', 'Premium', 7500.00, 4.80, 'Kochadai, Melakkal Main Rd', 'Banyan Tree Villas, Temple Pool, Spa, Luxury', '+91 452 238 5455', 9.9320, 78.0810),

-- COIMBATORE (City 5)
(21, 5, 'Coimbatore City Backpackers', 'Budget', 750.00, 4.00, 'Gandhipuram 2nd Street', 'WiFi, AC, Lockers, Common Lounge', '+91 422 252 8800', 11.0180, 76.9680),
(22, 5, 'Hotel Alankar Grande', 'Budget', 1600.00, 4.30, 'Sivasamy Road, Ram Nagar', 'Free Breakfast, Free WiFi, Travel Assistance', '+91 422 437 8888', 11.0150, 76.9610),
(23, 5, 'Zone by The Park Coimbatore', 'Mid-Range', 3100.00, 4.50, 'Avinashi Road, Lakshmi Mills', 'Trendy Lounge, Gym, Buffet, WiFi, Workspace', '+91 422 400 5000', 11.0120, 76.9850),
(24, 5, 'The Residency Towers Coimbatore', 'Mid-Range', 4000.00, 4.60, 'Avinashi Road, Race Course', 'Pool, Afghan Grill, 24-hr Coffee Shop', '+91 422 224 1414', 11.0080, 76.9790),
(25, 5, 'Radisson Blu Hotel Coimbatore', 'Premium', 7800.00, 4.70, 'Avinashi Road, Peelamedu', 'Rooftop Pool, Spa, Fine Dining, Bar, Butler', '+91 422 222 6000', 11.0280, 77.0050)
ON DUPLICATE KEY UPDATE name=VALUES(name), latitude=VALUES(latitude), longitude=VALUES(longitude);

-- -------------------------------------------------------
-- 4. Restaurants (with Coordinates)
-- -------------------------------------------------------
-- CHENNAI (City 1)
INSERT INTO restaurants (id, city_id, name, cuisine, avg_cost_per_person, rating, address, meal_type, latitude, longitude) VALUES
(1, 1, 'Murugan Idli Shop', 'South Indian', 140.00, 4.60, 'GN Chetty Rd, T. Nagar', 'Breakfast', 13.0425, 80.2335),
(2, 1, 'Saravana Bhavan Mylapore', 'Pure Veg South Indian', 180.00, 4.40, 'North Mada St, Mylapore', 'Breakfast', 13.0345, 80.2695),
(3, 1, 'Sangeetha Vegetarian Restaurant', 'Vegetarian Multi-Cuisine', 260.00, 4.30, 'Cathedral Road, Gopalapuram', 'Lunch', 13.0470, 80.2520),
(4, 1, 'Anjappar Chettinad Restaurant', 'Chettinad & Biryani', 420.00, 4.50, 'Anna Salai, Thousand Lights', 'Dinner', 13.0580, 80.2510),
(5, 1, 'Dakshin at Crowne Plaza', 'South Indian Fine Dining', 950.00, 4.80, 'TTK Road, Alwarpet', 'Dinner', 13.0315, 80.2505),

-- BENGALURU (City 2)
(6, 2, 'Vidyarthi Bhavan', 'Karnataka Tiffin & Dosa', 120.00, 4.70, 'Gandhi Bazaar, Basavanagudi', 'Breakfast', 12.9430, 77.5710),
(7, 2, 'MTR (Mavalli Tiffin Room)', 'Authentic South Indian', 190.00, 4.60, 'Lalbagh Road, Near Main Gate', 'Breakfast', 12.9550, 77.5870),
(8, 2, 'Nagarjuna Andhra Style', 'Andhra Meals & Biryani', 380.00, 4.50, 'Residency Road, Bangalore Central', 'Lunch', 12.9710, 77.6040),
(9, 2, 'Toit Brewpub & Kitchen', 'Continental & Pub Bites', 650.00, 4.70, '100 Feet Rd, Indiranagar', 'Dinner', 12.9790, 77.6400),
(10, 2, 'Karavalli (The Gateway Hotel)', 'Coastal South Indian Seafood', 1100.00, 4.90, 'Residency Road, Ashok Nagar', 'Dinner', 12.9695, 77.6015),

-- PONDICHERRY (City 3)
(11, 3, 'Indian Kaffe Express', 'Cafe & Pancakes', 180.00, 4.40, 'Dumas Street, White Town', 'Breakfast', 11.9325, 79.8345),
(12, 3, 'Surguru Vegetarian Restaurant', 'South Indian Thali', 160.00, 4.30, 'Sardar Vallabhai Patel Salai', 'Lunch', 11.9360, 79.8280),
(13, 3, 'Cafe des Arts', 'French Cafe & Crepes', 320.00, 4.60, 'Suffren Street, White Town', 'Lunch', 11.9318, 79.8330),
(14, 3, 'Coromandel Cafe', 'Continental & Artisan Bakery', 580.00, 4.70, 'Romain Rolland St, French Quarter', 'Dinner', 11.9340, 79.8340),
(15, 3, 'La Villa Dining', 'Contemporary French Gourmet', 900.00, 4.80, 'Surcouf Street, White Town', 'Dinner', 11.9310, 79.8325),

-- MADURAI (City 4)
(16, 4, 'Murugan Idli Shop West Masi', 'Madurai Ghee Idli & Chutneys', 130.00, 4.70, 'West Masi Street, Madurai Main', 'Breakfast', 9.9190, 78.1140),
(17, 4, 'Sree Sabarees Vegetarian', 'South Indian Traditional Meals', 170.00, 4.40, 'West Perumal Maistry Street', 'Lunch', 9.9175, 78.1130),
(18, 4, 'Amma Mess', 'Authentic Non-Veg Madurai Special', 350.00, 4.60, 'Alagar Kovil Road, Tallakulam', 'Lunch', 9.9380, 78.1390),
(19, 4, 'Kumar Mess', 'Chettinad & Mutton Biryani', 400.00, 4.50, '100 Feet Road, Madurai', 'Dinner', 9.9240, 78.1280),
(20, 4, 'Bells Plate Multi-Cuisine', 'North Indian & Kebabs', 600.00, 4.30, 'West Perumal Maistry St', 'Dinner', 9.9165, 78.1125),

-- COIMBATORE (City 5)
(21, 5, 'Sree Annapoorna Gowrishankar', 'Iconic Coimbatore Sambar & Coffee', 150.00, 4.70, 'East Arokiasamy Rd, RS Puram', 'Breakfast', 11.0110, 76.9510),
(22, 5, 'Aryas Pure Veg', 'South Indian Breakfast & Thali', 140.00, 4.30, 'Opposite Railway Station, Gandhipuram', 'Breakfast', 11.0175, 76.9690),
(23, 5, 'Haribhavanam Kongu Cuisine', 'Authentic Kongunadu Meals', 360.00, 4.60, 'Avinashi Road, Peelamedu', 'Lunch', 11.0260, 77.0010),
(24, 5, 'Bird On Tree', 'Continental & Fine Indian', 600.00, 4.50, 'Race Course Road, Thomas Park', 'Dinner', 11.0070, 76.9780),
(25, 5, 'The French Door Cafe', 'French Bistro & European Grill', 850.00, 4.70, 'Bashyakarlu Rd, RS Puram', 'Dinner', 11.0125, 76.9530)
ON DUPLICATE KEY UPDATE name=VALUES(name), latitude=VALUES(latitude), longitude=VALUES(longitude);

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

-- Anjappar Chettinad -> Mylapore Heritage Inn
(1, 'Anjappar Chettinad Restaurant', 'Mylapore Heritage Inn', 13.0580, 80.2510, 13.0330, 80.2690, 3.80, 13, 0.00, 0.75, 'Easy', 3, 2.50, 'Dr. Radhakrishnan Salai to Luz Church Rd', '[[13.0580, 80.2510], [13.0450, 80.2600], [13.0330, 80.2690]]'),
(1, 'Mylapore Heritage Inn', 'Anjappar Chettinad Restaurant', 13.0330, 80.2690, 13.0580, 80.2510, 3.80, 13, 0.00, 0.75, 'Easy', 3, 2.50, 'Dr. Radhakrishnan Salai to Luz Church Rd', '[[13.0330, 80.2690], [13.0450, 80.2600], [13.0580, 80.2510]]')
ON DUPLICATE KEY UPDATE distance_km=VALUES(distance_km), scenic_score=VALUES(scenic_score);
