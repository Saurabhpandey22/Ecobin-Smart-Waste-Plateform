# 📖 Ecobin — User Manual & Step-by-Step Operation Guide
**Plateform:** Ecobin IoT-Enabled Smart Waste Platform  
**Lead & Super Admin:** Saurabh Pandey  
**Live Repository:** `https://github.com/Saurabhpandey22/Ecobin-Smart-Waste-Plateform.git`

---

## 🚀 1. How to Run the Project Locally (Setup & Run Kaise Karein?)

### System Requirements:
- **Node.js**: v18 ya usse upar
- **Web Browser**: Chrome, Edge, Brave, ya Firefox
- **OS**: Windows, macOS, ya Linux

### Step 1: Clone Repository & Open Folder
```bash
git clone https://github.com/Saurabhpandey22/Ecobin-Smart-Waste-Plateform.git
cd "smart garbage collector"
```

### Step 2: Dependencies Install Karein
```bash
# Root se direct frontend aur backend dono install karne ke liye:
npm run build
```
*(Ya manual install kar sakte hain: `cd backend && npm install`, aur `cd ../frontend && npm install`)*

### Step 3: Server Start Karein
```bash
# Backend aur Production Web Server run karne ke liye:
cd backend
npm run dev
```

### Step 4: Browser me Kholein
- **Main Web Application:** 👉 **`http://localhost:5000`**  
*(Vite Dev Server port 3000 par bhi accessible hai: `http://localhost:3000`)*

---

## 🔐 2. Login Credentials & Accounts

Ecobin me 3 tarah ke roles hain:

| Role | Email ID | Password | Portal Scope |
|---|---|---|---|
| **Super Admin**<br>*(Saurabh Pandey)* | `admin@ecobin.in` | `Password@123`<br>*(ya `admin123`)* | Full System, City Analytics, Team Access Control, Bins override, Route Optimizer |
| **Field Staff**<br>*(Ward Officer)* | `staff@ecobin.in` | `staff123` | Assigned Tasks, Doorstep Pickups, Turn-by-turn Driver Route |
| **Citizen**<br>*(Aam Nagrik)* | `citizen@ecobin.in`<br>*(ya naya signup)* | `citizen123` | Grievance Report, Doorstep Pickup Booking, Live 4-Step Tracking, Eco-Points |

> 💡 **Tip:** Login form me password dekhne ke liye **Eye icon (👁️)** par click kar sakte hain. Email aur password me agar aage ya peeche space lag jaye toh system auto-trim kar leta hai.

---

## 👑 3. Super Admin Guide (Saurabh Pandey Kaise Use Karein?)

Jab aap **`admin@ecobin.in`** se login karenge, aapko top navbar me **"Saurabh Pandey (Super Admin)"** ka badge dikhega.

### Feature 1: Unified Complaints & Grievance Operations
1. Navbar se **"Complaints"** par click karein.
2. Sabhi Delhi wards (Rohini, Connaught Place, Dwarka, Karol Bagh, Okhla, etc.) ki incoming complaints dikhengi.
3. Filters use karke status (`Pending`, `In-Progress`, `Resolved`), priority (`Critical`, `Medium`, `Low`), ya ward-wise filter kar sakte hain.
4. Kisi bhi complaint par **"Assign Staff"** dropdown se 7 municipal officers me se kisi ko bhi assign kar sakte hain.

### Feature 2: Team & Access Control (Kisko Admin/Staff Banana Hai?)
1. Admin Dashboard me 3rd tab **"Team & Access Control"** par click karein.
2. **Grant Permission by Email:**
   - Kisi bhi registered citizen ka email enter karein (e.g., `rahul@gmail.com`).
   - Role select karein: **Admin** ya **Field Staff**.
   - **"Grant Permissions"** par click karein. Turant us user ko administrative powers mil jayengi.
3. **Users Directory Table:**
   - Neeche sabhi registered users ki list aati hai.
   - Har user ke aage direct buttons hain:
     - `[ 🛡️ Make Admin ]` ➔ User turant Admin ban jayega.
     - `[ 🚛 Make Staff ]` ➔ User field officer ban jayega.
     - `[ Demote to Citizen ]` ➔ Access revoke ho jayega.
   - *Note: Saurabh Pandey ka apna account permanently protected hai, unhe koi demote nahi kar sakta.*

### Feature 3: Doorstep Waste Pickups Management
1. Admin Dashboard me **"Doorstep Pickups"** tab par click karein.
2. Nagrik dwara schedule kiye gaye har pickup ki details dikhengi (Address, Date, Waste Category: Dry/Wet/E-waste/Bulky).
3. **Assign Driver:** Dropdown se delivery truck driver assign karein.
4. **Update Status:** Status ko `Driver Assigned` ➔ `In-Transit` ➔ `Collected` par update karein.

### Feature 4: Smart Route Optimizer
1. Top bar me **"Optimize Route"** button par click karein.
2. System AI TSP algorithm chala kar sabhi overfilled (>70%) bins ko cover karne wala sabse chhota aur fast route display karega.

---

## 🧑‍🤝‍🧑 4. Citizen Guide (Aam Nagrik Kaise Use Karein?)

Ek normal user ya citizen ke roop me:

### Feature 1: Kachre ki Complaint Register Karna
1. Navbar me **"Report Issue"** par click karein.
2. Issue Type chunein (Overflowing Bin, Illegal Dumping, Dead Animal, Hazardous Waste).
3. **Geo-Location:** "Detect Current Location" par click karein ya manual ward select karein.
4. Photo upload karein (camera ya file select karke).
5. "Submit Complaint" dabayein. Aapko turant Unique Tracking ID mil jayegi.

### Feature 2: Doorstep Waste Pickup Schedule Karna (Ghar se Kachra Uthwana)
1. **Citizen Portal** me jakar **"Schedule Doorstep Pickup"** button par click karein.
2. Apna complete address aur landmark bharein.
3. Waste Type select karein:
   - 📦 Dry / Recyclable
   - 🥬 Wet / Organic Kitchen Waste
   - 💻 E-Waste (Old electronics, batteries)
   - 🛋️ Bulky Waste (Old furniture, mattresses)
4. Preferred Date aur Time Slot (Morning 8-11 AM, Afternoon 1-4 PM, Evening 5-8 PM) chunein.
5. **Confirm Booking** par click karein.
6. 🎊 **Confetti animation** chalega aur aapke account me **+40 Eco-Points** add ho jayenge!

### Feature 3: Live 4-Step Pickup Tracking
Citizen portal me aapko apne pickup ka real-time visual progress timeline dikhega:
- 🟢 **Requested:** Aapki request server par book ho gayi hai.
- 🟢 **Driver Assigned:** Area ke officer ko dispatch assign hua.
- 🟡 **In-Transit:** Garbage van aapke ghar ke raste me hai.
- 🔵 **Collected:** Waste pick up ho chuka hai.

### Feature 4: Eco-Points & Gamification
- Har achhi activity par points milte hain.
- **Waste Awareness Quiz** khel kar extra points jeet sakte hain.
- City Leaderboard me top eco-citizens ki rank dekh sakte hain.

---

## 🗺️ 5. Smart Bins & Interactive Map Guide

Smart Bins monitor karne ke liye navbar me **"Smart Bins"** tab par click karein.

### 1. Dual-Engine Map Switcher:
- Top-right corner par **"Switch to Google Maps"** ya **"Switch to Leaflet (OpenStreetMap)"** button se map engine badal sakte hain.

### 2. Google Maps Features:
- **Live Traffic Layer:** **"Traffic: ON / OFF"** toggle button par click karein. Delhi ki roads par live traffic conditions (Green = Clear, Orange = Moderate, Red = Jammed) dikhne lagegi.
- **Satellite View:** Map ke top-left se Satellite ya Standard Map layer toggle kar sakte hain.

### 3. Dustbin Markers & IoT Actions:
- Har bin par fill level ke hisaab se color-coded pin hoti hai:
  - 🟢 **Green Pin (< 50%):** Normal fill.
  - 🟡 **Yellow Pin (50% - 79%):** Moderate fill.
  - 🔴 **Red Pin (≥ 80%):** Critical Alert! Overfill condition.
- Marker par click karne se **InfoWindow** open hota hai:
  - Bin Name, Ward Location, Fill Gauge (%).
  - Battery Level (e.g. 94%), Last Emptied Time.
  - **"Simulate Waste Dump (+25%)"** ➔ Testing ke liye bin me live kachra dalkar fill level badha sakte hain.
  - **"Empty Bin (0%)"** ➔ 1-click se bin empty ho jata hai aur system me log save ho jata hai.

---

## 🚛 6. Field Staff Guide (Sanitation Officers Kaise Use Karein?)

Field Staff (`staff@ecobin.in`) ke roop me login karne par:
1. **My Tasks:** Unke designated ward ke assigned complaints aur doorstep pickups dikhte hain.
2. **Action Buttons:**
   - Truck start karte hi status ko **"In-Transit"** mark karein.
   - Kachra collect karne ke baad **"Mark as Collected / Resolved"** karein.
3. **Turn-by-turn Navigation:** "Open Route in Maps" par click karke destination tak ka direct navigation khol sakte hain.

---

## ❓ 7. Frequently Asked Questions (FAQ) & Troubleshooting

#### Q1: Agar port 5000 already kisi aur program me use ho raha ho toh kya karein?
> **Solution:** PowerShell me run karein:  
> `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force`  
> Fir `npm run dev` start karein.

#### Q2: Google Maps par "For development purposes only" watermark aaye toh kya karein?
> **Solution:** Map ke top-right me **"Enter API Key"** button par click karke apni Google Cloud Console Maps JavaScript API key paste kar sakte hain. Yeh key browser ke localStorage me save ho jati hai. Ya phir direct **"Switch to OpenStreetMap"** par click karein jo 100% free aur bina kisi key ke chalta hai.

#### Q3: Kya test data reset kiya ja sakta hai?
> **Solution:** Backend ke `backend/config/ecobin_production_db.json` me standard test records save rehte hain. Server restart hote hi Saurabh Pandey ka Super Admin account aur 7 officers auto-verify ho jate hain.
