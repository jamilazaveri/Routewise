-- =======================================================
-- Routewise: Budget-based Journey Planner
-- Database Schema Definition (MySQL 8.0+ / 9.0+)
-- =======================================================

CREATE DATABASE IF NOT EXISTS routewise_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE routewise_db;

-- Drop dependent tables first
DROP TABLE IF EXISTS route_legs;
DROP TABLE IF EXISTS route_options;
DROP TABLE IF EXISTS route_segments;
DROP TABLE IF EXISTS trip_items;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS attractions;
DROP TABLE IF EXISTS cities;

-- 1. Cities Table
CREATE TABLE cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Attractions Table (with scenic_score)
CREATE TABLE attractions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Heritage', 'Beach', 'Nature', 'Museum', 'Religious', 'Park', etc.
    description TEXT,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    avg_visit_duration_mins INT NOT NULL DEFAULT 90,
    ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 4.00,
    scenic_score DECIMAL(3, 2) NOT NULL DEFAULT 0.50, -- 0.0 to 1.0 scenic rating
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    image_url VARCHAR(500),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_attraction_city (city_id),
    INDEX idx_attraction_price (ticket_price)
) ENGINE=InnoDB;

-- 3. Hotels Table (with coordinates)
CREATE TABLE hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'Budget', -- 'Budget', 'Mid-Range', 'Premium'
    price_per_night DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 4.00,
    address VARCHAR(255),
    amenities VARCHAR(255),
    contact_phone VARCHAR(50),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_hotel_city (city_id),
    INDEX idx_hotel_price (price_per_night)
) ENGINE=InnoDB;

-- 4. Restaurants Table (with coordinates)
CREATE TABLE restaurants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    avg_cost_per_person DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 4.00,
    address VARCHAR(255),
    meal_type VARCHAR(50) NOT NULL DEFAULT 'All', -- 'Breakfast', 'Lunch', 'Dinner', 'All'
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_restaurant_city (city_id),
    INDEX idx_restaurant_cost (avg_cost_per_person)
) ENGINE=InnoDB;

-- 5. Inter-City Routes Table
CREATE TABLE routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    origin_city_id BIGINT NOT NULL,
    destination_city_id BIGINT NOT NULL,
    distance_km DECIMAL(8, 2) NOT NULL,
    toll_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estimated_time_hours DECIMAL(5, 2) NOT NULL,
    highway_name VARCHAR(100),
    FOREIGN KEY (origin_city_id) REFERENCES cities(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_city_id) REFERENCES cities(id) ON DELETE CASCADE,
    UNIQUE KEY uk_route_origin_dest (origin_city_id, destination_city_id)
) ENGINE=InnoDB;

-- 6. Trips Table
CREATE TABLE trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_name VARCHAR(150) NOT NULL,
    start_city_id BIGINT NOT NULL,
    destination_city_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    num_days INT NOT NULL,
    num_travellers INT NOT NULL DEFAULT 1,
    transport_mode VARCHAR(20) NOT NULL, -- 'car', 'bike', 'bus', 'train'
    total_budget_min DECIMAL(12, 2) NOT NULL,
    total_budget_max DECIMAL(12, 2) NOT NULL,
    share_accommodation DECIMAL(5, 2) NOT NULL DEFAULT 35.00,
    share_food DECIMAL(5, 2) NOT NULL DEFAULT 25.00,
    share_transport DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    share_sightseeing DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    total_estimated_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_accommodation DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_food DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_transport DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_fuel DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_tolls DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_sightseeing DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost_misc DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    amount_left DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    is_feasible BOOLEAN NOT NULL DEFAULT TRUE,
    feasibility_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (start_city_id) REFERENCES cities(id),
    FOREIGN KEY (destination_city_id) REFERENCES cities(id)
) ENGINE=InnoDB;

-- 7. Trip Items Table (Itinerary Events)
CREATE TABLE trip_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    day_number INT NOT NULL,
    item_order INT NOT NULL,
    item_type VARCHAR(30) NOT NULL, -- 'attraction', 'hotel', 'restaurant', 'transport'
    reference_id BIGINT,
    title VARCHAR(150) NOT NULL,
    start_time TIME,
    end_time TIME,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_trip_day (trip_id, day_number)
) ENGINE=InnoDB;

-- 8. Route Segments (Cached Stop-to-Stop Geometry & Metrics)
CREATE TABLE route_segments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT NOT NULL,
    from_name VARCHAR(150) NOT NULL,
    to_name VARCHAR(150) NOT NULL,
    from_lat DECIMAL(10, 7) NOT NULL,
    from_lng DECIMAL(10, 7) NOT NULL,
    to_lat DECIMAL(10, 7) NOT NULL,
    to_lng DECIMAL(10, 7) NOT NULL,
    distance_km DECIMAL(8, 2) NOT NULL,
    duration_mins INT NOT NULL,
    toll_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    scenic_score DECIMAL(3, 2) NOT NULL DEFAULT 0.50,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'Normal', -- 'Easy', 'Normal', 'Challenging'
    turns_count INT NOT NULL DEFAULT 4,
    congestion_penalty DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    road_name VARCHAR(100),
    geometry_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_segment_lookup (city_id, from_name, to_name)
) ENGINE=InnoDB;

-- 9. Route Options Table (Fastest, Shortest, Cheapest, Scenic, Easiest)
CREATE TABLE route_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    route_type VARCHAR(30) NOT NULL, -- 'fastest', 'shortest', 'cheapest', 'scenic', 'easiest'
    total_distance_km DECIMAL(10, 2) NOT NULL,
    total_time_mins INT NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    fuel_cost DECIMAL(10, 2) NOT NULL,
    toll_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    scenic_score DECIMAL(3, 2) NOT NULL,
    tag VARCHAR(100),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_route_trip_type (trip_id, route_type)
) ENGINE=InnoDB;

-- 10. Route Legs Table (Individual Hops in an Ordered Route)
CREATE TABLE route_legs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_option_id BIGINT NOT NULL,
    seq INT NOT NULL,
    from_stop_name VARCHAR(150) NOT NULL,
    from_stop_type VARCHAR(30) NOT NULL,
    from_lat DECIMAL(10, 7),
    from_lng DECIMAL(10, 7),
    to_stop_name VARCHAR(150) NOT NULL,
    to_stop_type VARCHAR(30) NOT NULL,
    to_lat DECIMAL(10, 7),
    to_lng DECIMAL(10, 7),
    distance_km DECIMAL(8, 2) NOT NULL,
    duration_mins INT NOT NULL,
    toll_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    fuel_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    arrival_time TIME,
    departure_time TIME,
    stay_duration_mins INT DEFAULT 60,
    geometry_json JSON,
    instructions TEXT,
    closing_time_warning VARCHAR(255),
    FOREIGN KEY (route_option_id) REFERENCES route_options(id) ON DELETE CASCADE,
    INDEX idx_leg_route_seq (route_option_id, seq)
) ENGINE=InnoDB;
