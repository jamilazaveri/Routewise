# Routewise 🧭 — Budget-Based Journey Planner

**Routewise** is an intelligent travel planning system that generates complete, day-by-day travel itineraries with automated cost fitting tailored to a user's total budget and category preferences. It estimates realistic costs for accommodation, meals, highway tolls, vehicle fuel (or public transit tickets), and sightseeing activities across major South Indian destinations.

---

## Architecture Overview

```
                                 ┌──────────────────────────────────────┐
                                 │           Web Frontend               │
                                 │     (HTML5, CSS3, Modern JS)         │
                                 └──────────────────┬───────────────────┘
                                                    │ REST (HTTP JSON)
                                                    ▼
                                 ┌──────────────────────────────────────┐
                                 │        Spring Boot Backend           │
                                 │             (Java 17)                │
                                 │  - REST API & Input Validation       │
                                 │  - Database Access (JPA / Hibernate) │
                                 │  - Orchestrator & Trip Persistence   │
                                 └──────────┬─────────────────┬─────────┘
                                            │                 │
                 REST API (HTTP JSON)       │                 │ JDBC (Port 3306/3307)
                                            ▼                 ▼
             ┌────────────────────────────────────┐    ┌───────────────────────────┐
             │       Python Microservice          │    │      MySQL Database       │
             │        (FastAPI + Pydantic)        │    │  (schema.sql & seed.sql)  │
             │  - Distance & Toll Fuel Model      │    │  - cities, attractions   │
             │  - Rating vs Price Scoring Engine  │    │  - hotels, restaurants   │
             │  - Greedy Budget-Fitting Algorithm │    │  - routes, trips, items   │
             │  - Dynamic Budget Re-allocation    │    └───────────────────────────┘
             │  - Feasible Alternative Generator  │
             └────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Key Responsibilities |
|---|---|---|
| **Main Backend** | **Java 17 + Spring Boot 3.2** | REST Controllers, Hibernate/JPA repositories, input validation, transaction management, microservice integration. |
| **Microservice** | **Python 3.9+ + FastAPI** | Fuel & toll cost calculation, composite value scoring (rating vs price), greedy budget-fitting, dynamic re-allocation, feasibility analysis. |
| **Primary Database** | **MySQL 8.0+ / 9.0+** | Relational schema and seed data for 5 cities, 40 attractions, 25 hotels, 25 restaurants, and inter-city routes. |
| **Frontend** | **HTML5, CSS3, Vanilla JS** | Responsive, mobile-friendly interface with real-time budget share sliders, day-by-day interactive timeline, and cost breakdown charts. |

---

## Directory Structure

```
Routewise/
├── backend-java/                  # Spring Boot Main Backend
│   ├── pom.xml                    # Maven build configuration
│   ├── .mvn/wrapper/              # Maven Wrapper
│   └── src/
│       ├── main/
│       │   ├── java/com/routewise/
│       │   │   ├── RoutewiseApplication.java     # Application entry & database auto-seeder
│       │   │   ├── config/                       # CORS & RestTemplate configuration
│       │   │   ├── controller/                   # REST API endpoints (/api/trips, /api/cities, ...)
│       │   │   ├── dto/                          # Request & Response Data Transfer Objects
│       │   │   ├── entity/                       # JPA Entity Models (City, Hotel, Attraction, Route, Trip)
│       │   │   ├── exception/                    # Global Exception Handler & Custom Errors
│       │   │   ├── repository/                   # Spring Data JPA Repositories
│       │   │   └── service/                      # Business Logic & Python Microservice Client
│       │   └── resources/
│       │       └── application.properties        # Externalized DB & service config
│       └── test/
│           └── java/com/routewise/
│               ├── BudgetLogicTest.java          # Unit tests for budget allocation & fuel formulas
│               └── TripServiceTest.java          # Mockito unit tests for TripService
│
├── service-python/                # FastAPI Cost Estimation & Ranking Microservice
│   ├── main.py                    # FastAPI app & endpoints (/optimize-trip, /reallocate-budget, ...)
│   ├── models.py                  # Pydantic schema validation & data contracts
│   ├── optimizer.py               # Greedy budget-fitting & day-by-day scheduling engine
│   ├── scoring.py                 # Multi-criteria scoring (rating vs price)
│   ├── test_service.py            # Unit tests for cost models & feasibility warnings
│   └── requirements.txt           # Python dependencies
│
├── database/                      # Relational Database SQL Scripts
│   ├── schema.sql                 # Table definitions, indices, and foreign keys
│   └── seed.sql                   # Realistic INR seed data for Chennai, Bengaluru, Pondicherry, Madurai, Coimbatore
│
├── frontend/                      # Web Application
│   ├── index.html                 # Main trip planner UI with responsive layout
│   ├── style.css                  # Clean, modern stylesheet with mobile support
│   └── app.js                     # Dynamic budget sliders, API integration, and rendering
│
└── README.md                      # Documentation & Execution Guide
```

---

## Features & Implementation Details

### 1. Day-by-Day Itinerary Generator
- Generates a chronological schedule across the trip duration.
- Respects attraction opening and closing times, average visit durations (e.g., 90–120 minutes), meal breaks (lunch 13:00–14:00, dinner 20:00–21:30), and travel buffers.
- Day 1 begins with departure and hotel check-in; intermediate days balance morning and afternoon exploration; the final day wraps up with morning highlights and return travel.

### 2. Comprehensive Cost Breakdown
- Calculates:
  - **Accommodation**: `price_per_night × ceil(travellers / 2) × (num_days - 1)`
  - **Food**: Breakfast, lunch, and dinner allocation per traveller per day.
  - **Fuel & Tolls**: Vehicle mileage formula + route highway tolls.
  - **Sightseeing**: Ticket entry fees for group size (`ticket_price × travellers`).
  - **Contingency Buffer**: 4–5% buffer for incidental expenses.
- Clearly displays **Total Cost vs Budget Max** and **Amount Left** (highlighted green for savings, red for deficit).
- All prices are explicitly tagged as **realistic INR estimates**.

### 3. Smart Recommendations Within Budget
- **Hotels**: Ranked using a composite value formula:
  $$\text{Score} = 65\% \times \left(\frac{\text{Rating}}{5.0}\right) + 35\% \times \left(1.0 - \frac{\text{Price} - \text{MinPrice}}{\text{MaxPrice} - \text{MinPrice}}\right)$$
  Hotels fitting within the category share receive a budget adherence bonus.
- **Restaurants**: Recommends authentic breakfast, lunch, and dinner options constrained by the per-person meal budget.
- **Attractions**: Ranks top heritage sites, beaches, museums, and temples, offering bonuses to free-entry attractions.

### 4. Fuel and Highway Toll Estimation
- **Car**: `Fuel = (Distance × 2 / 15.0 km/L) × ₹103/L` + round-trip tolls from major highways (NH48, ECR, GST, NH44, NH544).
- **Bike**: `Fuel = (Distance × 2 / 40.0 km/L) × ₹103/L` + ₹0 toll fees (two-wheelers exempt on Indian National Highways).
- **Bus**: `Distance × 2 × ₹1.80/km × travellers`.
- **Train**: `Distance × 2 × ₹1.25/km × travellers`.

### 5. Dynamic Budget Re-allocation
- When the user alters any category slider (e.g., reduces accommodation from 35% to 20%), the remaining 80% is automatically redistributed across food, transport, and sightseeing proportionately.
- Ensures total percentage always equals 100% and instantly recomputes INR allocations.

### 6. Budget Feasibility & Cheapest Alternative Warning
- If total estimated costs exceed the maximum budget, the app flags `isFeasible = false` with an alert banner.
- Automatically calculates and presents the **Cheapest Feasible Alternative**:
  - Suggests the absolute minimum feasible budget.
  - Recommends shifting to train or bus travel.
  - Suggests budget backpacker dorms/hostels (e.g. ₹750–₹950/night).
  - Prioritizes free public landmarks and temples.

### 7. Multi-Style Route Planning & Interactive Map (Leaflet + OpenStreetMap)
Routewise connects selected hotels, restaurants, and attractions into one ordered itinerary lane across 5 distinct route styles:

| Route Style | Optimization Objective | Mathematical Cost Function | Key Driving Characteristic |
|---|---|---|---|
| **⚡ Fastest** | Minimum travel time | $W = \text{travel\_time}$ | Prioritizes express links, grade-separated bypasses, and arterial avenues. |
| **📏 Shortest** | Minimum physical distance | $W = \text{distance}$ | Minimizes odometer kilometers across consecutive stops. |
| **💰 Cheapest** | Minimum fuel + toll cost | $W = \text{fuel\_cost} + \text{toll\_cost}$ | Avoids toll expressways and reduces fuel burn. |
| **🌊 Scenic** | Maximizes scenic views | $W = \text{distance} \times (1 - \text{scenic\_score})$ | Passes coastal boulevards (e.g. Marina Beach, ECR), parks & heritage quarters. **Hard cap: max 25% detour over fastest route.** |
| **🛣️ Easiest** | Least driving stress | $W = \text{travel\_time} + \text{turns} \times 0.5 + \text{congestion\_penalty}$ | Minimizes tight turns, avoids congested alleys, prefers wide main roads. |

#### Core Stop-Ordering Algorithm:
1. **Nearest-Neighbour (NN) Initialization**:
   Constructs a candidate tour starting from the origin hotel, respecting time-windows:
   - Attraction opening and closing times.
   - Lunch window between 12:00 and 14:00.
   - Dinner window between 19:00 and 21:30.
   - Hotel check-in and checkout timings.
2. **2-Opt Local Search Improvement**:
   Systematically reverses pairs of tour edges $(i, j)$ and accepts inversions that strictly decrease the route style's cost function while preserving time-window feasibility.
3. **Real Road Geometry & MySQL Caching**:
   - Queries OSRM (Open Source Routing Machine) or OpenRouteService for actual driving distances, durations, and turn geometry coordinates.
   - Caches segments in MySQL (`route_segments`) so repeated requests avoid redundant network roundtrips.
   - Robust Haversine fallback with realistic road factors (1.3×) ensures zero disruption if external routing APIs are unavailable.
4. **Leaflet + OpenStreetMap Interactive Map**:
   - Numbered, color-coded markers for each stop: Hotel (Blue 🏨), Dining (Orange 🍽️), Sights (Purple 🏛️).
   - Real roadway polyline overlays colored per route style.
   - Side-by-side comparison table of all 5 route styles (Distance, Travel Time, Fuel, Tolls, Total Cost, Scenic Index).
   - Chronological timeline with arrival, stay duration, departure, and hop-by-hop instructions.
   - Automatic warnings if a stop is reached past closing time with reordering suggestions.

---

## Setup & Running the Services

### Prerequisites
- **Java 17+**
- **Python 3.9+**
- **MySQL 8.0+** (or default credentials configured in `application.properties`)
- A modern web browser

---

### Step 1: Database Setup (MySQL)

Start MySQL and execute the schema and seed scripts:

```bash
# Log in to MySQL
mysql -u root -p

# Run schema and seed scripts
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

*Note: The Spring Boot application also includes an automatic database seeder (`CommandLineRunner`) that populates the 5 cities, 40 attractions, 25 hotels, 25 restaurants, and 20 highway routes if the database is initially empty.*

---

### Step 2: Start the Python Microservice

```bash
cd service-python

# Install dependencies
pip install -r requirements.txt

# Run unit tests
python -m unittest -v test_service.py

# Start FastAPI server on port 8000
python main.py
# Or with uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The microservice will be available at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### Step 3: Start the Spring Boot Java Backend

Configure your MySQL credentials via environment variables or in `backend-java/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/routewise_db?createDatabaseIfNotExist=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=your_password
```

Build and run:

```bash
cd backend-java

# Run unit tests
mvn test

# Run Spring Boot application
mvn spring-boot:run
```

The Spring Boot REST API will be available at:
- **Base URL**: `http://localhost:8080/api`
- **Trip Plan Endpoint**: `POST http://localhost:8080/api/trips/plan`
- **Reallocate Endpoint**: `POST http://localhost:8080/api/trips/reallocate`
- **Cities List**: `GET http://localhost:8080/api/cities`
- **Hotels**: `GET http://localhost:8080/api/hotels`
- **Restaurants**: `GET http://localhost:8080/api/restaurants`
- **Attractions**: `GET http://localhost:8080/api/attractions`

---

### Step 4: Open the Frontend

The frontend is pure, dependency-free HTML/CSS/JavaScript. Simply serve it or open `frontend/index.html` in your browser:

```bash
cd frontend

# Option A: Simple Python HTTP Server
python3 -m http.server 3000

# Open http://localhost:3000 in your browser
```

---

## Running Unit Tests

### Python Microservice Tests
```bash
cd service-python
python -m unittest -v test_service.py
```
**Tests verify:**
- Car fuel and toll calculations
- Motorcycle toll-exemption logic
- Room count ceiling division
- Hotel value scoring & budget fitting
- Budget re-allocation proportional distribution
- Infeasible budget detection and cheapest alternative generation
- Stop ordering heuristic and time-window constraints (lunch 12-2, dinner 7-9, attraction opening/closing)
- 5 Route scoring comparisons (Fastest, Shortest, Cheapest, Scenic, Easiest)

### Java Spring Boot Tests
```bash
cd backend-java
mvn test
```
**Tests verify:**
- `BudgetLogicTest`: Room requirement formulas, percentage share integrity, highway distance/mileage/fuel formulas, feasibility deficit verification.
- `TripServiceTest`: Mockito tests for identical origin/destination rejection, min/max budget validation, and end-to-end trip planning with mock persistence.
- `RoutePlanningTest`: Shortest route distance minimization, cheapest route toll-avoidance logic, scenic route 25% detour cap compliance, easiest route turn & congestion penalty scoring, and scenic weight formulas.

---

## Seed Data Summary

| City | Attractions | Hotels | Restaurants | Key Highlights |
|---|---|---|---|---|
| **Chennai** | 10 | 6 (Budget to Premium) | 8 (Breakfast/Lunch/Dinner) | Marina Beach, Kapaleeshwarar Temple, Fort St. George, Chettinad cuisine, ITC Grand Chola |
| **Bengaluru** | 10 | 6 (Budget to Premium) | 8 (Breakfast/Lunch/Dinner) | Lalbagh Botanical Garden, Bangalore Palace, Cubbon Park, ISKCON, The Leela Palace, MTR Dosa |
| **Pondicherry** | 10 | 6 (Budget to Premium) | 8 (Breakfast/Lunch/Dinner) | Promenade Beach, Auroville, French Quarter cafes, Sacred Heart Basilica, Accord Puducherry |
| **Madurai** | 10 | 6 (Budget to Premium) | 8 (Breakfast/Lunch/Dinner) | Meenakshi Amman Temple, Thirumalai Nayakkar Palace, Samanar Caves, Gateway Pasumalai |
| **Coimbatore** | 10 | 6 (Budget to Premium) | 8 (Breakfast/Lunch/Dinner) | Adiyogi Shiva Bust, Marudhamalai Temple, Siruvani Waterfalls, Valankulam, Vivanta |
| **Routes** | 20 bidirectional highway routes (ECR, NH48, GST, NH44, NH544) with realistic toll costs |

---

## Book & Contact Layer 📱

Routewise provides an integrated, non-transactional **Book & Contact layer** that allows travelers to transition seamlessly from planning to booking and execution on official partner sites.

### 1. Hotels
- **Deep Links**: Direct buttons to **MakeMyTrip**, **Booking.com**, and **Google Maps** prefilled with city, hotel name, check-in date, check-out date, and guest count.
- **Direct Calling**: Single-click `tel:` link (`📞 Call Hotel`).
- **Copy Number**: One-click clipboard copy with real-time toast feedback.

### 2. Restaurants
- **Table Reservation**: Single-click `tel:` link (`📞 Call to Reserve`).
- **Maps & Menus**: Direct link to **Google Maps** location and reviews.
- **Delivery & Tables**: Direct links to **Zomato** and **Swiggy** restaurant listings.
- **Smart Meal Timing**: Suggested reservation time aligned with the itinerary schedule (e.g. Lunch at 13:00, Dinner at 20:00).

### 3. Attractions & Sightseeing
- **In-App Full Information**: Complete details on opening/closing hours, ticket pricing, average visit duration, best time to visit, visitor rules & dress codes, and wheelchair accessibility.
- **Ticketing**: Direct "🎟️ Book Tickets" button to official government/partner ticketing portals for paid sights, or "🎟️ Tickets at entry: Free" badge for public landmarks.
- **Directions**: "🧭 Get Directions" opening Google Maps navigation.

### 4. Transport (Buses & Trains)
- **RedBus**: Pre-filled search URL with origin city, destination city, and travel date.
- **IRCTC**: Direct train search portal link with pre-filled station codes and travel date.

### 5. Interactive Booking Checklist
- Track every stop in the journey in a dedicated checklist tab.
- **Status Lifecycle**: `Not booked` 🔴, `Call pending` 🟡, `Booked` 🟢.
- **Confirmation Tracker**: Enter confirmation/PNR reference numbers and custom notes.
- **Database Persistence**: State is stored and updated in MySQL (`trip_bookings` table).
- **Progress Gauge**: Real-time progress bar displaying booking completion percentage.

### 6. Share & Export Itinerary
- **Copy Summary**: Formatted plain-text itinerary summary copied to clipboard for easy sharing.
- **WhatsApp Share**: One-click deep link to WhatsApp Web/App prefilled with trip details.
- **Printable View**: Dedicated `@media print` layout that cleanly formats the day-by-day plan and booking checklist without web controls or clutter.

---

## Adding a New Booking Provider Guide 🔌

Routewise utilizes a template-driven booking link engine with security domain whitelisting. Follow these steps to introduce a new booking provider (e.g., *Agoda*, *Cleartrip*, *BookMyShow*):

### Step 1: Whitelist the Provider Domain
To guard against open-redirect vulnerabilities, all outgoing deep links must belong to an approved domain whitelist.

Open `backend-java/src/main/java/com/routewise/service/BookingLinkBuilderService.java` and add your domain to `allowedDomains`:

```java
private final Set<String> allowedDomains = new HashSet<>(Arrays.asList(
        "makemytrip.com",
        "booking.com",
        "google.com",
        "zomato.com",
        "swiggy.com",
        "redbus.in",
        "irctc.co.in",
        "agoda.com" // <-- Add new provider domain
));
```

Alternatively, register dynamically at runtime via:
```java
bookingLinkBuilderService.registerAllowedDomain("agoda.com");
```

### Step 2: Register the URL Template in MySQL
Add the provider URL template to the `booking_links` table in `database/seed.sql` (or via SQL):

```sql
INSERT INTO booking_links (stop_type, provider, url_template) VALUES
('hotel', 'agoda', 'https://www.agoda.com/search?city={city}&hotelName={name}&checkIn={checkin}&checkOut={checkout}&rooms=1&adults={guests}');
```

**Supported Placeholder Tokens:**
- `{name}` — Name of the hotel, restaurant, or attraction (URL-encoded).
- `{city}` — Destination city name (URL-encoded).
- `{city_slug}` — Lowercase city name (e.g. `chennai`).
- `{checkin}` / `{checkout}` — Dates in `YYYY-MM-DD` format.
- `{guests}` — Number of guests/travellers.
- `{source}` / `{destination}` — Origin and destination cities for transit.
- `{date}` — Date of journey for transit.

### Step 3: Implement Provider Link in `BookingLinkBuilderService`
In `BookingLinkBuilderService.java`, add the new provider builder method:

```java
String agodaUrl = getTemplateOrDefault("hotel", "agoda",
        "https://www.agoda.com/search?city={city}&hotelName={name}&checkIn={checkin}&checkOut={checkout}&rooms=1&adults={guests}");
String builtAgoda = buildUrlFromTemplate(agodaUrl, params);
if (!builtAgoda.isBlank()) {
    links.add(new BookingOptionDto.ProviderLinkDto("agoda", "Agoda", builtAgoda, "🏨", "Book on Agoda"));
}
```

### Step 4: Add UI Button Styling
In `frontend/style.css`, specify button styling for the new provider:

```css
.partner-btn.agoda {
  background: #2b6cb0;
  color: #ffffff;
}
.partner-btn.agoda:hover { background: #2c5282; }
```

---

## Environment Variables & Configuration

| Variable | Default Value | Description |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/routewise_db` | MySQL JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` | `root` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | *(empty)* | Database password |
| `MICROSERVICE_URL` | `http://localhost:8000` | URL of the Python FastAPI microservice |

---

## Deploying the Frontend Free (Netlify & Vercel)

The Routewise frontend is a pure static Progressive Web App (PWA) with zero build steps required, making it 100% free to host on either Netlify or Vercel.

### Option A: Free Deployment on Netlify
1. **Using Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   cd frontend
   netlify deploy --prod --dir=.
   ```
2. **Via Netlify Web UI (GitHub continuous deployment)**:
   - Go to [app.netlify.com](https://app.netlify.com) and click **"Add new site"** -> **"Import an existing project"**.
   - Select your Routewise GitHub repository.
   - Set **Base directory**: `frontend`
   - Set **Publish directory**: `frontend`
   - Leave Build command empty.
   - Click **Deploy Routewise**. Your PWA is live with free HTTPS and automatic asset compression!

### Option B: Free Deployment on Vercel
1. **Using Vercel CLI**:
   ```bash
   npm install -g vercel
   cd frontend
   vercel --prod
   ```
2. **Via Vercel Web Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new) and import your Git repository.
   - Set **Root Directory** to `frontend`.
   - Framework Preset: **Other**.
   - Click **Deploy**. Vercel automatically configures global CDN edge distribution.

---

## Wrapping as a Native Android App (Capacitor)

Routewise is built with a responsive mobile-first UI, bottom navigation bar, safe-area insets, and PWA manifest. You can wrap it into a native Android APK using [Capacitor](https://capacitorjs.com/):

### Step 1: Initialize Capacitor in the Frontend Directory
```bash
cd frontend
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init Routewise com.routewise.app --web-dir .
```

### Step 2: Add the Android Platform
```bash
npx cap add android
```

### Step 3: Configure Permissions & Cleartext Traffic (for local backends)
In `frontend/android/app/src/main/AndroidManifest.xml`, ensure internet permission is present:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<application
    android:allowBackup="true"
    android:usesCleartextTraffic="true"
    android:theme="@style/AppTheme.NoActionBar">
```

### Step 4: Sync & Run on Android Device / Emulator
```bash
npx cap sync
npx cap open android
```
This opens the project in Android Studio. From there, click **Run** (or `Build > Build APK(s)`) to install and launch Routewise natively on any Android phone or tablet with hardware acceleration, native splash screens, and fullscreen display!

