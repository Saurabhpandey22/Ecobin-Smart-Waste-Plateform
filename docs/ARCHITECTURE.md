# 🇮🇳 Ecobin — Full-Stack IoT-Enabled Smart Waste Platform Architecture & Database Schema
**Tagline:** "Swachh Bharat Swastha Bharat"

---

## 1. System Architecture Diagram

```mermaid
flowchart TB
    subgraph IoT_Layer ["⚡ IoT Telemetry Layer"]
        ESP32["ESP32 Microcontrollers / Ultrasonic Sensors"]
        Simulator["IoT Telemetry Background Simulator"]
    end

    subgraph Backend_Layer ["🌱 Express & Node.js Backend"]
        Ingestion["REST Telemetry Ingestion Endpoint (/api/bins/telemetry)"]
        AuthMiddleware["JWT & RBAC Middleware (Citizen, Staff, Admin)"]
        
        Controllers["API Controllers"]
        ComplaintsCtrl["Complaints Controller"]
        BinsCtrl["Smart Bins Controller"]
        AdminCtrl["Admin Analytics Controller"]
        EcoCtrl["Eco Points Controller"]
        
        Services["Domain Services"]
        AIClassifier["AI Waste Photo Classifier"]
        RouteOptimizer["Smart Route Optimizer (TSP Algorithm)"]
        IoTEngine["IoT Alert & Escalation Engine"]
    end

    subgraph Data_Layer ["💾 Database & Cache Layer"]
        SQLDB["Relational Database Engine (Users, Complaints, Pickups, Bins, BinLogs, EcoPoints)"]
        RedisCache["Redis Cache & Pub/Sub Bus"]
    end

    subgraph RealTime_Layer ["📡 Real-Time WebSockets"]
        SocketServer["Socket.io WebSocket Server"]
    end

    subgraph Frontend_Layer ["💻 React Single Page Web Application"]
        AdminDashboard["Admin Unified Complaints Dashboard (Default Landing Page)"]
        CitizenPortal["Citizen Sweep Portal (Report Issue & Pickup Tracker)"]
        SmartBinsMap["Smart Dustbins Live Map & Fill Gauges"]
        StaffConsole["Staff Task Console & Turn-by-Turn Route"]
        ChatbotWidget["In-App Intercom-Style Guide Chatbot"]
        Gamification["Waste Awareness, Segregation Quiz, & Leaderboards"]
    end

    ESP32 -->|HTTP POST| Ingestion
    Simulator -->|Periodic Micro Dumps| IoTEngine
    Ingestion --> IoTEngine
    IoTEngine -->|Threshold Check (>80%)| SocketServer
    
    Controllers --> SQLDB
    Controllers --> RedisCache
    Controllers --> Services
    
    SocketServer -->|Live Broadcasts| AdminDashboard
    SocketServer -->|Bin Telemetry| SmartBinsMap
    SocketServer -->|Task Dispatches| StaffConsole

    Frontend_Layer -->|REST APIs & WebSockets| Backend_Layer
```

---

## 2. Database Design & Entity Relationship Schema

The database relies on structured relational tables with indexed lookups on `status`, `user_id`, `assigned_staff_id`, `ward_area`, and `latitude/longitude`:

| Entity | Primary Columns | Indexes & Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`users`** | `id`, `name`, `email`, `password_hash`, `role`, `phone`, `ward_area`, `eco_points` | UNIQUE (`email`), INDEX (`role`, `ward_area`) | Stores Citizens, Collection Staff, and Admins with bcrypt password hashes and eco rewards. |
| **`complaints`** | `id`, `user_id`, `type`, `description`, `photo_url`, `latitude`, `longitude`, `status`, `assigned_staff_id`, `priority`, `ai_classification`, `proof_photo_url`, `created_at`, `resolved_at` | INDEX (`status`, `user_id`, `assigned_staff_id`, `ward_area`), FK (`user_id`, `assigned_staff_id`) | Municipal grievances reported by citizens with real-time status timeline and AI waste classification. |
| **`pickup_requests`** | `id`, `user_id`, `waste_type`, `preferred_slot`, `address_text`, `latitude`, `longitude`, `status`, `assigned_staff_id`, `created_at` | INDEX (`status`, `user_id`, `assigned_staff_id`), FK (`user_id`) | Scheduled doorstep waste segregation pickups (E-Waste, Bulk, Hazardous, Recyclable). |
| **`bins`** | `id`, `bin_code`, `location_name`, `latitude`, `longitude`, `fill_percentage`, `battery_level`, `threshold_value`, `ward_area`, `status`, `last_updated` | INDEX (`status`, `ward_area`, `bin_code`) | ESP32-monitored smart dustbins with ultrasonic fill sensors and battery health. |
| **`bin_logs`** | `id`, `bin_id`, `fill_percentage`, `battery_level`, `timestamp` | INDEX (`bin_id`, `timestamp`), FK (`bin_id`) | Historical telemetry logs powering bin trend graphs and analytics. |
| **`notifications`** | `id`, `user_id`, `message`, `type`, `is_read`, `created_at` | INDEX (`user_id`, `is_read`), FK (`user_id`) | Real-time threshold alerts and task dispatches. |
| **`eco_points`** | `id`, `user_id`, `points`, `reason`, `created_at` | INDEX (`user_id`), FK (`user_id`) | Audit log of Eco Points earned by citizens for reporting and quizzes. |
| **`leaderboard_societies`** | `id`, `society_name`, `ward_area`, `total_points`, `rank` | INDEX (`rank`) | RWA and College Society gamification rankings. |

---

## 3. Core Capabilities Built

1. **Admin Unified Complaints Dashboard (Default Landing Page)**
   - Displays immediately upon login with 5 key metric summary cards.
   - Comprehensive filter bar (Status, Priority, Ward/Area, Staff, Search by Citizen/Location).
   - Real-time WebSockets streaming: new complaints pop up instantly without page refresh.
   - Inline staff assignment dropdown & status updater.
   - Full complaint dossier drawer with photo preview, AI classification tags, and resolution timeline.

2. **IoT Smart Dustbin Telemetry & Simulator**
   - Telemetry Ingestion API (`POST /api/bins/telemetry`) accepting ESP32 sensor payloads `{ binId, fillPercentage, batteryLevel, latitude, longitude }`.
   - Continuous background simulator generating realistic fill fluctuations, micro-dumps, and battery drain.
   - Color-coded live map markers: Green (<50%), Yellow (50-80%), Red (>80% overflow risk).
   - Automated threshold breach alerts (>80%) dispatched to Admins & Ward Sanitation Staff with escalation logic.

3. **In-App Onboarding & Navigation Guide Chatbot**
   - Floating widget with role-aware welcome message and deep-linking buttons.
   - Answers plain-language questions and deep-links directly to target forms, maps, or leaderboards.
   - Smart intent matcher for waste segregation FAQs (Green vs Blue vs Red Bins).

4. **AI-Powered Waste Classification Engine**
   - Inspects uploaded photo URLs and text descriptions.
   - Detects categories (`Organic`, `Recyclable`, `E-Waste`, `Hazardous`, `Overflowing Bin`).
   - Returns confidence score, recommended bin color, disposal procedure, and pre-fills forms.

5. **Gamification & Eco-Rewards**
   - Citizens earn +30 to +50 Eco Points for reporting issues, scheduling doorstep pickups, and taking quizzes.
   - Interactive 5-question Waste Segregation Quiz with particle confetti celebration.
   - Citizen & RWA Society Leaderboards.

6. **Smart Route Optimization for Staff**
   - Solves Travelling Salesperson route optimization for sanitation officers.
   - Combines high-fill smart dustbins (>65%) and unresolved citizen complaints in the staff's ward into an ordered path with total distance (km), estimated time (mins), and step-by-step navigation steps.

7. **Multi-Language (English + Hindi) & Dark Mode**
   - Instant language toggle ("हिंदी / English") across all headers, cards, and chatbot text.
   - Glassmorphism dark mode with vibrant emerald/teal palette and soft cyan IoT highlights.
