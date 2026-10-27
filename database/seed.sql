-- =======================================================
-- Routewise: Seed Data
-- Cities: Chennai, Bengaluru, Pondicherry, Madurai, Coimbatore
-- Realistic INR Prices, Timings, Coordinates, and Ratings
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
-- 2. Attractions (At least 8 per city = 40+ total)
-- -------------------------------------------------------
-- CHENNAI (City 1)
INSERT INTO attractions (city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, latitude, longitude) VALUES
(1, 'Marina Beach & Promenade', 'Beach', 'World second longest urban beach with historic lighthouse and bustling evening food stalls.', '05:00:00', '22:00:00', 90, 0.00, 4.60, 13.0500, 80.2824),
(1, 'Kapaleeshwarar Temple', 'Religious', 'Historic 7th-century Dravidian temple in Mylapore dedicated to Lord Shiva with ornate gopuram.', '06:00:00', '21:00:00', 75, 0.00, 4.80, 13.0336, 80.2694),
(1, 'Fort St. George & Museum', 'Heritage', '17th-century British coastal stronghold with a museum displaying colonial armaments and coins.', '09:00:00', '17:00:00', 100, 50.00, 4.30, 13.0784, 80.2872),
(1, 'San Thome Basilica', 'Religious', 'Stately neo-gothic Roman Catholic minor basilica built over the tomb of St. Thomas the Apostle.', '06:00:00', '20:00:00', 60, 0.00, 4.60, 13.0337, 80.2782),
(1, 'Government Museum Egmore', 'Museum', 'Major repository of Roman antiquities, bronzes from the Chola dynasty, and natural history.', '09:30:00', '17:00:00', 120, 100.00, 4.40, 13.0732, 80.2585),
(1, 'Guindy National Park & Snake Park', 'Nature', 'Protected forest sanctuary right in the heart of Chennai with blackbucks and reptile enclosure.', '09:00:00', '17:30:00', 90, 40.00, 4.20, 13.0067, 80.2206),
(1, 'DakshinaChitra Heritage Village', 'Heritage', 'Living-history open-air museum preserving classic architecture and crafts of South Indian states.', '10:00:00', '18:00:00', 150, 175.00, 4.70, 12.8228, 80.2415),
(1, 'Besant Nagar Elliot Beach', 'Beach', 'Calm sandy beach near Karl Schmidt memorial, flanked by contemporary coastal cafes.', '06:00:00', '22:00:00', 60, 0.00, 4.50, 12.9994, 80.2713);

-- BENGALURU (City 2)
INSERT INTO attractions (city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, latitude, longitude) VALUES
(2, 'Lalbagh Botanical Garden', 'Nature', 'Sprawling 240-acre botanical haven with Victorian glasshouse, ancient bonsai, and serene lake.', '06:00:00', '19:00:00', 120, 30.00, 4.70, 12.9507, 77.5848),
(2, 'Bangalore Palace', 'Heritage', 'Tudor-revival royal palace built by Chamaraja Wadiyar featuring wood carvings and battlements.', '10:00:00', '17:30:00', 90, 250.00, 4.40, 12.9988, 77.5921),
(2, 'Cubbon Park', 'Nature', 'Picturesque 300-acre green lung with shady bamboo groves, library, and colonial statues.', '06:00:00', '18:00:00', 90, 0.00, 4.60, 12.9763, 77.5929),
(2, 'Visvesvaraya Industrial & Tech Museum', 'Museum', 'Hands-on interactive science exhibitions, rocket engine models, and dinosaur enclave.', '09:30:00', '18:00:00', 120, 85.00, 4.60, 12.9753, 77.5963),
(2, 'Bull Temple (Nandi Temple)', 'Religious', '16th-century Vijayanagara style temple housing a colossal monolithic Nandi carved in granite.', '06:00:00', '20:00:00', 45, 0.00, 4.50, 12.9427, 77.5681),
(2, 'Tipu Sultan Summer Palace', 'Heritage', 'Intricate teakwood palace from the 1790s with ornate arches, floral motifs, and history gallery.', '08:30:00', '17:30:00', 60, 25.00, 4.20, 12.9593, 77.5737),
(2, 'Bannerghatta Biological Park Safari', 'Nature', 'Grand zoo, rescue center, and tiger safari reserve nestled in the Bannerghatta hills.', '09:30:00', '17:00:00', 180, 350.00, 4.50, 12.8009, 77.5777),
(2, 'ISKCON Temple Bangalore', 'Religious', 'Imposing neo-classical Vedic temple on Hare Krishna Hill with scenic viewpoint and temple hall.', '07:15:00', '20:30:00', 90, 0.00, 4.70, 13.0098, 77.5511);

-- PONDICHERRY (City 3)
INSERT INTO attractions (city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, latitude, longitude) VALUES
(3, 'Promenade Beach & French Quarter', 'Beach', 'Goubert Avenue seafront with French colonial villas, Gandhi statue, and sea breeze.', '05:00:00', '23:00:00', 90, 0.00, 4.70, 11.9329, 79.8359),
(3, 'Auroville & Matrimandir Viewpoint', 'Heritage', 'Universal township dedicated to human unity featuring the golden globe meditation pavilion.', '09:00:00', '17:00:00', 150, 0.00, 4.60, 12.0069, 79.8106),
(3, 'Sri Aurobindo Ashram', 'Religious', 'Quiet ashram founded in 1926 with samadhi of Sri Aurobindo and the Mother.', '08:00:00', '18:00:00', 60, 0.00, 4.60, 11.9366, 79.8344),
(3, 'Paradise Beach & Chunnambar Boat', 'Beach', 'Golden sand island beach reached by backwater boat ride with water sports and beach shacks.', '09:00:00', '17:00:00', 120, 200.00, 4.50, 11.8797, 79.8155),
(3, 'Basilica of Sacred Heart of Jesus', 'Religious', 'Gothic revival basilica renowned for its 28 stained glass panels depicting Jesus life.', '06:00:00', '19:30:00', 45, 0.00, 4.60, 11.9262, 79.8272),
(3, 'Pondicherry Botanical Gardens', 'Nature', 'Historic French layout garden featuring rare exotic flora, a toy train, and musical fountain.', '09:00:00', '18:00:00', 60, 20.00, 4.20, 11.9304, 79.8228),
(3, 'Serenity Beach', 'Beach', 'Surfing hotspot with gentle turquoise waves, surf school, and shoreline rocks.', '06:00:00', '20:00:00', 75, 0.00, 4.40, 11.9702, 79.8452),
(3, 'Pondicherry Museum', 'Museum', 'Gallery of Arikamedu Roman trade relics, Chola bronzes, and French colonial furniture.', '09:00:00', '17:00:00', 60, 30.00, 4.10, 11.9348, 79.8354);

-- MADURAI (City 4)
INSERT INTO attractions (city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, latitude, longitude) VALUES
(4, 'Meenakshi Amman Temple', 'Religious', 'Pinnacle of Tamil temple architecture with 14 gopurams, thousand-pillar hall, and golden lotus pond.', '05:00:00', '21:30:00', 150, 50.00, 4.90, 9.9195, 78.1193),
(4, 'Thirumalai Nayakkar Palace', 'Heritage', '17th-century palace masterpiece blending Italian and Dravidian styles with towering pillars.', '09:00:00', '17:00:00', 75, 20.00, 4.50, 9.9152, 78.1240),
(4, 'Gandhi Memorial Museum', 'Museum', 'Historic Rani Mangammal palace housing Mahatma Gandhi personal blood-stained dhoti and artifacts.', '10:00:00', '17:30:00', 90, 10.00, 4.40, 9.9300, 78.1400),
(4, 'Alagar Kovil (Kallazhagar Temple)', 'Religious', 'Picturesque temple nestled against the Alagar hills surrounded by scenic nature trails.', '06:00:00', '19:00:00', 90, 0.00, 4.70, 10.0760, 78.2140),
(4, 'Vandiyur Mariamman Teppakulam', 'Religious', 'Colossal square temple tank with central island mandapam built in 1645 for float festivals.', '06:00:00', '20:00:00', 45, 0.00, 4.30, 9.9110, 78.1510),
(4, 'Koodal Azhagar Temple', 'Religious', 'Ancient temple dedicated to Vishnu featuring 3 postures: sitting, standing, and reclining.', '05:30:00', '21:00:00', 60, 0.00, 4.60, 9.9150, 78.1130),
(4, 'Samanar Hills (Jain Caves)', 'Heritage', 'Rock-cut hill caves with 9th-century Jain bas-relief sculptures and panoramic sunset views.', '06:00:00', '18:30:00', 90, 0.00, 4.50, 9.9230, 78.0550),
(4, 'Puthu Mandapam Market', 'Heritage', 'Historic 17th-century pillared hallway bustling with traditional tailor shops, textiles, and brassware.', '09:00:00', '21:00:00', 60, 0.00, 4.40, 9.9189, 78.1202);

-- COIMBATORE (City 5)
INSERT INTO attractions (city_id, name, category, description, opening_time, closing_time, avg_visit_duration_mins, ticket_price, rating, latitude, longitude) VALUES
(5, 'Adiyogi Shiva Bust & Isha Center', 'Religious', 'World largest bust sculpture of Lord Shiva (112 ft) situated at the foothills of Velliangiri.', '06:00:00', '20:00:00', 150, 0.00, 4.80, 10.9733, 76.7405),
(5, 'Marudhamalai Murugan Temple', 'Religious', 'Ancient hill temple surrounded by medicinal herbs, offering scenic views and peaceful vibe.', '06:00:00', '20:30:00', 90, 0.00, 4.70, 11.0460, 76.8520),
(5, 'Gass Forest Museum', 'Museum', 'Over a century-old natural history museum with preserved wildlife specimens and timber exhibits.', '09:00:00', '17:00:00', 60, 20.00, 4.30, 11.0180, 76.9450),
(5, 'VOC Park and Zoo', 'Park', 'Popular urban family park with gardens, animal enclosures, and children playground.', '09:00:00', '18:30:00', 75, 25.00, 4.10, 11.0060, 76.9740),
(5, 'Eachanari Vinayagar Temple', 'Religious', 'Revered 16th-century Ganesha temple featuring a massive 6-foot monolithic idol.', '05:00:00', '21:00:00', 45, 0.00, 4.60, 10.9230, 76.9780),
(5, 'GD Car Museum', 'Museum', 'Fascinating collection of vintage and modern automobiles from Britain, Germany, and India.', '09:00:00', '17:00:00', 90, 75.00, 4.70, 11.0020, 76.9850),
(5, 'Siruvani Waterfalls & Dam', 'Nature', 'Scenic waterfall in dense Western Ghats reserve, renowned for pristine sweet water.', '09:30:00', '15:30:00', 120, 100.00, 4.50, 10.9500, 76.6900),
(5, 'Perur Pateeswarar Temple', 'Religious', 'Magnificent temple built by Karikala Chola with Kanaka Sabha and stone pillar sculptures.', '06:00:00', '20:00:00', 60, 0.00, 4.70, 10.9840, 76.9180);

-- -------------------------------------------------------
-- 3. Hotels (At least 5 per city = 25 total)
-- -------------------------------------------------------
-- CHENNAI (City 1)
INSERT INTO hotels (city_id, name, tier, price_per_night, rating, address, amenities, contact_phone) VALUES
(1, 'Hostel Chennai Central', 'Budget', 850.00, 4.10, 'Poonamallee High Rd, Periamet', 'Free WiFi, AC dorms, Lockers, Hot Water', '+91 44 2538 1201'),
(1, 'Mylapore Heritage Inn', 'Budget', 1400.00, 4.30, 'South Mada St, Mylapore', 'Free WiFi, Breakfast, AC, Near Temple', '+91 44 2464 8820'),
(1, 'The Residency Towers', 'Mid-Range', 3200.00, 4.50, 'Sir Thyagaraya Rd, T. Nagar', 'Swimming Pool, Breakfast, Gym, Restaurant, WiFi', '+91 44 2825 3434'),
(1, 'Savera Hotel', 'Mid-Range', 3800.00, 4.40, 'Dr. Radhakrishnan Salai, Mylapore', 'Pool, Piano Bar, Fitness Centre, Multi-Cuisine', '+91 44 2811 4700'),
(1, 'Taj Coromandel', 'Premium', 8500.00, 4.80, 'Mahatma Gandhi Rd, Nungambakkam', 'Luxury Spa, Fine Dining, Pool, Butler Service', '+91 44 6600 2827');

-- BENGALURU (City 2)
INSERT INTO hotels (city_id, name, tier, price_per_night, rating, address, amenities, contact_phone) VALUES
(2, 'Zostel Bangalore', 'Budget', 950.00, 4.40, '80 Feet Rd, Koramangala', 'Rooftop Cafe, High-Speed WiFi, Games Room, AC', '+91 80 4120 4455'),
(2, 'Octave Hotel & Spa', 'Budget', 1600.00, 4.20, 'Marathahalli Main Rd', 'Free WiFi, Room Service, Breakfast, AC', '+91 80 4350 7800'),
(2, 'Lemon Tree Hotel Premier', 'Mid-Range', 3500.00, 4.50, 'Ulsoor, Near MG Road', 'Pool, Gym, Free Breakfast, Citrus Cafe, Valet', '+91 80 4480 2000'),
(2, 'The Chancery Pavilion', 'Mid-Range', 4200.00, 4.40, 'Residency Road, Ashok Nagar', 'Outdoor Pool, 24/7 Dining, Business Center', '+91 80 4141 4141'),
(2, 'The Oberoi Bengaluru', 'Premium', 9500.00, 4.90, 'MG Road, Bangalore Central', 'Lush Tropical Gardens, Personal Butler, Spa', '+91 80 2558 5858');

-- PONDICHERRY (City 3)
INSERT INTO hotels (city_id, name, tier, price_per_night, rating, address, amenities, contact_phone) VALUES
(3, 'Dune de L Orient Guest House', 'Budget', 1100.00, 4.30, 'Romain Rolland St, White Town', 'Heritage Verandah, Free WiFi, Cafe, AC', '+91 413 222 6600'),
(3, 'Pleasant Inn White Town', 'Budget', 1500.00, 4.20, 'Suffren Street, White Town', 'Cycle Rental, Free WiFi, Rooftop, AC', '+91 413 234 5090'),
(3, 'Villa Shanti', 'Mid-Range', 3900.00, 4.60, 'Rue Suffren, French Quarter', 'Courtyard Cafe, Boutique Rooms, French Cuisine', '+91 413 420 0028'),
(3, 'Promenade Beach Hotel', 'Mid-Range', 4600.00, 4.50, 'Goubert Avenue, Promenade', 'Ocean View, Rooftop Lounge, Swimming Pool', '+91 413 222 7750'),
(3, 'Palais de Mahe (CGH Earth)', 'Premium', 8800.00, 4.80, 'Bussy Street, French Quarter', 'Plunge Pool, Ayurvedic Center, Luxury Suites', '+91 413 230 0100');

-- MADURAI (City 4)
INSERT INTO hotels (city_id, name, tier, price_per_night, rating, address, amenities, contact_phone) VALUES
(4, 'Temple View Stay', 'Budget', 800.00, 4.20, 'Town Hall Road, Near Meenakshi Temple', 'Clean Rooms, Hot Water, 24/7 Desk, WiFi', '+91 452 234 1199'),
(4, 'Hotel Supreme', 'Budget', 1350.00, 4.10, 'West Perumal Maistry St', 'Rooftop Surya Restaurant, AC, Travel Desk', '+91 452 234 3151'),
(4, 'Fortune Pandiyan Hotel', 'Mid-Range', 2800.00, 4.40, 'Race Course Colony, Madurai', 'Swimming Pool, Orchid Multi-Cuisine, Lawn', '+91 452 435 6789'),
(4, 'Courtyard by Marriott Madurai', 'Mid-Range', 4200.00, 4.60, 'Alagar Kovil Road', 'Infinity Pool, 24/7 Gym, Buffet Breakfast', '+91 452 425 5555'),
(4, 'Heritage Madurai', 'Premium', 7500.00, 4.80, 'Kochadai, Melakkal Main Rd', 'Banyan Tree Villas, Temple Pool, Spa, Luxury', '+91 452 238 5455');

-- COIMBATORE (City 5)
INSERT INTO hotels (city_id, name, tier, price_per_night, rating, address, amenities, contact_phone) VALUES
(5, 'Coimbatore City Backpackers', 'Budget', 750.00, 4.00, 'Gandhipuram 2nd Street', 'WiFi, AC, Lockers, Common Lounge', '+91 422 252 8800'),
(5, 'Hotel Alankar Grande', 'Budget', 1600.00, 4.30, 'Sivasamy Road, Ram Nagar', 'Free Breakfast, Free WiFi, Travel Assistance', '+91 422 437 8888'),
(5, 'Zone by The Park Coimbatore', 'Mid-Range', 3100.00, 4.50, 'Avinashi Road, Lakshmi Mills', 'Trendy Lounge, Gym, Buffet, WiFi, Workspace', '+91 422 400 5000'),
(5, 'The Residency Towers Coimbatore', 'Mid-Range', 4000.00, 4.60, 'Avinashi Road, Race Course', 'Pool, Afghan Grill, 24-hr Coffee Shop', '+91 422 224 1414'),
(5, 'Radisson Blu Hotel Coimbatore', 'Premium', 7800.00, 4.70, 'Avinashi Road, Peelamedu', 'Rooftop Pool, Spa, Fine Dining, Bar, Butler', '+91 422 222 6000');

-- -------------------------------------------------------
-- 4. Restaurants (At least 5 per city = 25 total)
-- -------------------------------------------------------
-- CHENNAI (City 1)
INSERT INTO restaurants (city_id, name, cuisine, avg_cost_per_person, rating, address, meal_type) VALUES
(1, 'Murugan Idli Shop', 'South Indian', 140.00, 4.60, 'GN Chetty Rd, T. Nagar', 'Breakfast'),
(1, 'Saravana Bhavan Mylapore', 'Pure Veg South Indian', 180.00, 4.40, 'North Mada St, Mylapore', 'Breakfast'),
(1, 'Sangeetha Vegetarian Restaurant', 'Vegetarian Multi-Cuisine', 260.00, 4.30, 'Cathedral Road, Gopalapuram', 'Lunch'),
(1, 'Anjappar Chettinad Restaurant', 'Chettinad & Biryani', 420.00, 4.50, 'Anna Salai, Thousand Lights', 'Dinner'),
(1, 'Dakshin at Crowne Plaza', 'South Indian Fine Dining', 950.00, 4.80, 'TTK Road, Alwarpet', 'Dinner');

-- BENGALURU (City 2)
INSERT INTO restaurants (city_id, name, cuisine, avg_cost_per_person, rating, address, meal_type) VALUES
(2, 'Vidyarthi Bhavan', 'Karnataka Tiffin & Dosa', 120.00, 4.70, 'Gandhi Bazaar, Basavanagudi', 'Breakfast'),
(2, 'MTR (Mavalli Tiffin Room)', 'Authentic South Indian', 190.00, 4.60, 'Lalbagh Road, Near Main Gate', 'Breakfast'),
(2, 'Nagarjuna Andhra Style', 'Andhra Meals & Biryani', 380.00, 4.50, 'Residency Road, Bangalore Central', 'Lunch'),
(2, 'Toit Brewpub & Kitchen', 'Continental & Pub Bites', 650.00, 4.70, '100 Feet Rd, Indiranagar', 'Dinner'),
(2, 'Karavalli (The Gateway Hotel)', 'Coastal South Indian Seafood', 1100.00, 4.90, 'Residency Road, Ashok Nagar', 'Dinner');

-- PONDICHERRY (City 3)
INSERT INTO restaurants (city_id, name, cuisine, avg_cost_per_person, rating, address, meal_type) VALUES
(3, 'Indian Kaffe Express', 'Cafe & Pancakes', 180.00, 4.40, 'Dumas Street, White Town', 'Breakfast'),
(3, 'Surguru Vegetarian Restaurant', 'South Indian Thali', 160.00, 4.30, 'Sardar Vallabhai Patel Salai', 'Lunch'),
(3, 'Cafe des Arts', 'French Cafe & Crepes', 320.00, 4.60, 'Suffren Street, White Town', 'Lunch'),
(3, 'Coromandel Cafe', 'Continental & Artisan Bakery', 580.00, 4.70, 'Romain Rolland St, French Quarter', 'Dinner'),
(3, 'La Villa Dining', 'Contemporary French Gourmet', 900.00, 4.80, 'Surcouf Street, White Town', 'Dinner');

-- MADURAI (City 4)
INSERT INTO restaurants (city_id, name, cuisine, avg_cost_per_person, rating, address, meal_type) VALUES
(4, 'Murugan Idli Shop West Masi', 'Madurai Ghee Idli & Chutneys', 130.00, 4.70, 'West Masi Street, Madurai Main', 'Breakfast'),
(4, 'Sree Sabarees Vegetarian', 'South Indian Traditional Meals', 170.00, 4.40, 'West Perumal Maistry Street', 'Lunch'),
(4, 'Amma Mess', 'Authentic Non-Veg Madurai Special', 350.00, 4.60, 'Alagar Kovil Road, Tallakulam', 'Lunch'),
(4, 'Kumar Mess', 'Chettinad & Mutton Biryani', 400.00, 4.50, '100 Feet Road, Madurai', 'Dinner'),
(4, 'Bells Plate Multi-Cuisine', 'North Indian & Kebabs', 600.00, 4.30, 'West Perumal Maistry St', 'Dinner');

-- COIMBATORE (City 5)
INSERT INTO restaurants (city_id, name, cuisine, avg_cost_per_person, rating, address, meal_type) VALUES
(5, 'Sree Annapoorna Gowrishankar', 'Iconic Coimbatore Sambar & Coffee', 150.00, 4.70, 'East Arokiasamy Rd, RS Puram', 'Breakfast'),
(5, 'Aryas Pure Veg', 'South Indian Breakfast & Thali', 140.00, 4.30, 'Opposite Railway Station, Gandhipuram', 'Breakfast'),
(5, 'Haribhavanam Kongu Cuisine', 'Authentic Kongunadu Meals', 360.00, 4.60, 'Avinashi Road, Peelamedu', 'Lunch'),
(5, 'Bird On Tree', 'Continental & Fine Indian', 600.00, 4.50, 'Race Course Road, Thomas Park', 'Dinner'),
(5, 'The French Door Cafe', 'French Bistro & European Grill', 850.00, 4.70, 'Bashyakarlu Rd, RS Puram', 'Dinner');

-- -------------------------------------------------------
-- 5. Inter-City Routes (Bidirectional distances & tolls)
-- -------------------------------------------------------
-- Major Highways: NH48, NH32, NH44, NH544, etc.
INSERT INTO routes (origin_city_id, destination_city_id, distance_km, toll_cost, estimated_time_hours, highway_name) VALUES
-- Chennai <-> Bengaluru
(1, 2, 346.00, 385.00, 6.50, 'NH48 / Bangalore-Chennai Expressway'),
(2, 1, 346.00, 385.00, 6.50, 'NH48 / Bangalore-Chennai Expressway'),

-- Chennai <-> Pondicherry
(1, 3, 151.00, 115.00, 3.20, 'East Coast Road (ECR) / NH32'),
(3, 1, 151.00, 115.00, 3.20, 'East Coast Road (ECR) / NH32'),

-- Chennai <-> Madurai
(1, 4, 462.00, 460.00, 7.50, 'NH38 / Grand Southern Trunk (GST)'),
(4, 1, 462.00, 460.00, 7.50, 'NH38 / Grand Southern Trunk (GST)'),

-- Chennai <-> Coimbatore
(1, 5, 505.00, 510.00, 8.50, 'NH79 & NH544 via Salem'),
(5, 1, 505.00, 510.00, 8.50, 'NH79 & NH544 via Salem'),

-- Bengaluru <-> Pondicherry
(2, 3, 310.00, 320.00, 6.00, 'NH77 via Hosur & Krishnagiri'),
(3, 2, 310.00, 320.00, 6.00, 'NH77 via Hosur & Krishnagiri'),

-- Bengaluru <-> Coimbatore
(2, 5, 365.00, 390.00, 6.50, 'NH44 & NH544 via Salem'),
(5, 2, 365.00, 390.00, 6.50, 'NH44 & NH544 via Salem'),

-- Bengaluru <-> Madurai
(2, 4, 435.00, 440.00, 7.00, 'NH44 via Salem & Dindigul'),
(4, 2, 435.00, 440.00, 7.00, 'NH44 via Salem & Dindigul'),

-- Pondicherry <-> Madurai
(3, 4, 335.00, 280.00, 5.80, 'NH38 via Trichy'),
(4, 3, 335.00, 280.00, 5.80, 'NH38 via Trichy'),

-- Pondicherry <-> Coimbatore
(3, 5, 380.00, 340.00, 7.00, 'NH79 via Villupuram & Salem'),
(5, 3, 380.00, 340.00, 7.00, 'NH79 via Villupuram & Salem'),

-- Madurai <-> Coimbatore
(4, 5, 215.00, 190.00, 4.30, 'NH83 via Dindigul & Dharapuram'),
(5, 4, 215.00, 190.00, 4.30, 'NH83 via Dindigul & Dharapuram')
ON DUPLICATE KEY UPDATE distance_km=VALUES(distance_km), toll_cost=VALUES(toll_cost);
