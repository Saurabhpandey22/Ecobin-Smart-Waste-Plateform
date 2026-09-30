<div align="center">

# 🌱 EcoBin — Smart Waste Management Platform

### *Swachh Bharat, Swastha Bharat* 🇮🇳

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-v6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**EcoBin** ek AI-powered, IoT-enabled Smart Waste Management Platform hai jo Indian cities ke liye design kiya gaya hai. Real-time sensor data, citizen complaints, gamification aur admin dashboard — sab kuch ek jagah!

</div>

---

## 🚀 Live Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Live Smart Bin Map** | Real-time IoT sensor data ke saath interactive map (Leaflet.js) |
| 📊 **Admin Dashboard** | Complaints manage karo, bins monitor karo, staff assign karo |
| 👤 **Citizen Portal** | Complaint darz karo, photos upload karo, status track karo |
| 🤖 **AI Assistant** | Waste management ke baare mein guide karta hai |
| 🎮 **Gamification** | Points, badges aur leaderboard system |
| 📡 **Real-Time WebSockets** | Socket.io se live bin level updates |
| 🔐 **JWT Authentication** | Secure login for Admin, Staff aur Citizens |
| 🌡️ **IoT Simulator** | Smart bin sensors ka real-time simulation |
| 🗑️ **Heatmap View** | Garbage hotspots ka visual analysis |
| 📱 **Responsive Design** | Mobile aur Desktop dono pe kaam karta hai |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI Framework
- **Vite 6** — Build Tool
- **Tailwind CSS** — Styling
- **Leaflet.js + React-Leaflet** — Interactive Maps
- **Chart.js + React-ChartJS-2** — Data Visualization
- **Socket.io Client** — Real-time Communication
- **Lucide React** — Icons

### Backend
- **Node.js + Express.js** — REST API Server
- **Socket.io** — WebSocket Server
- **JSON Database** — File-based data storage (no external DB required!)
- **JWT (jsonwebtoken)** — Authentication
- **Multer** — Image/File Upload
- **bcryptjs** — Password Hashing
- **dotenv** — Environment Config

---

## 📁 Project Structure

```
smart-garbage-collector/
├── 📂 backend/
│   ├── config/          # Database config & JSON DB files
│   ├── controllers/     # API route handlers
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── services/        # IoT Simulator service
│   ├── uploads/         # User uploaded images
│   ├── server.js        # Main Express server
│   └── package.json
│
├── 📂 frontend/
│   ├── src/
│   │   ├── components/  # React components (14 components)
│   │   ├── services/    # API & Socket service
│   │   ├── utils/       # Helper functions
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # React entry point
│   └── package.json
│
└── 📂 docs/
    └── ARCHITECTURE.md  # System architecture details
```

---

## ⚡ Local Setup (Apne PC pe chalao)

### Prerequisites
- [Node.js v18+](https://nodejs.org/) installed hona chahiye

### Step 1: Repository Clone karo
```bash
git clone https://github.com/YOUR_USERNAME/smart-garbage-collector.git
cd smart-garbage-collector
```

### Step 2: Backend Setup
```bash
cd backend
npm install
copy .env.example .env
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

### Step 4: Dono Servers Start Karo

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Chalega: http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Chalega: http://localhost:3000
```

Phir browser mein kholo: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| 👑 Admin | `admin` | `admin123` |
| 👷 Staff | `staff1` | `staff123` |
| 👤 Citizen | `citizen1` | `citizen123` |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | New user register |
| `GET` | `/api/bins` | Smart bins ki list |
| `GET` | `/api/complaints` | Sari complaints |
| `POST` | `/api/complaints` | Nayi complaint |
| `PATCH` | `/api/complaints/:id` | Complaint update |
| `POST` | `/api/upload` | Image upload |
| `GET` | `/health` | Server health check |

### WebSocket Events
| Event | Description |
|-------|-------------|
| `bin-update` | Real-time bin fill level update |
| `new-complaint` | New complaint notification |
| `complaint-update` | Complaint status changed |

---

## 🤝 Contribute Kaise Karein

1. **Fork** karo is repository ko
2. **Branch** banao: `git checkout -b feature/nayi-feature`
3. **Commit** karo: `git commit -m "feat: nayi feature add ki"`
4. **Push** karo: `git push origin feature/nayi-feature`
5. **Pull Request** kholo

---

## 📄 License

MIT License — Free use karo, modify karo, share karo!

---

<div align="center">

Made with ❤️ for a **Swachh Bharat** 🇮🇳

**EcoBin** — Ek Swachh Kal Ki Taraf Ek Kadam

</div>
