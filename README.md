<div align="center">

# 🌱 EcoBin — Smart Waste Management Platform

### *Swachh Bharat, Swastha Bharat* 🇮🇳

[![CI Build & Validation](https://github.com/Saurabhpandey22/Ecobin-Smart-Waste-Plateform/actions/workflows/ci.yml/badge.svg)](https://github.com/Saurabhpandey22/Ecobin-Smart-Waste-Plateform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-v6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**EcoBin** ek AI-powered, IoT-enabled Smart Waste Management Platform hai jo Indian cities ke liye design kiya gaya hai. Real-time sensor data, citizen complaints, gamification aur admin dashboard — sab kuch ek unified ecosystem mein!

[Architecture](./docs/ARCHITECTURE.md) • [Contributing](./CONTRIBUTING.md) • [License](./LICENSE) • [Report Issue](https://github.com/Saurabhpandey22/Ecobin-Smart-Waste-Plateform/issues)

</div>

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Live Smart Bin Map** | Real-time IoT sensor telemetry data with interactive Leaflet map |
| 📊 **Admin Dashboard** | Manage complaints, monitor bin fill levels, dispatch staff |
| 👤 **Citizen Portal** | Lodge photo & geo-tagged complaints, real-time resolution tracker |
| 🤖 **AI Assistant** | Smart waste segregation & compost recommendations |
| 🎮 **Eco-Gamification** | Reward points, green badges, and community leaderboard |
| 📡 **Real-Time WebSockets** | Instant fill percentage & task updates via Socket.io |
| 🔐 **JWT Authentication** | Role-based secure access for Admin, Field Staff & Citizens |
| 🌡️ **IoT Telemetry Simulator** | Background sensor simulation for testing without hardware |
| 🗑️ **Heatmap View** | Visual high-density waste generation hotspot analysis |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS, Leaflet.js, Chart.js, Socket.io-client, Lucide Icons
- **Backend**: Node.js, Express.js, Socket.io, JWT, Multer, bcryptjs
- **Database & Storage**: Embedded zero-config JSON database + local file store
- **DevOps & CI/CD**: GitHub Actions automated build & lint workflow

---

## 🔑 Demo Access Credentials

| Role | Username | Password | Access Capabilities |
|------|----------|----------|---------------------|
| 👑 **Admin** | `admin` | `admin123` | Full dashboard, complaint lifecycle, route planning |
| 👷 **Staff** | `staff1` | `staff123` | Assigned bin pickups, task status toggle |
| 👤 **Citizen** | `citizen1` | `citizen123` | File complaints, view points, leaderboard |

---

<details>
<summary><b>⚡ Quickstart & Local Setup Guide (Click to expand)</b></summary>

### 1. Clone the Repository
```bash
git clone https://github.com/Saurabhpandey22/Ecobin-Smart-Waste-Plateform.git
cd Ecobin-Smart-Waste-Plateform
```

### 2. Backend Setup
```bash
cd backend
npm install
copy .env.example .env
npm run dev
# Running on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# Running on http://localhost:3000
```

Open **http://localhost:3000** in your browser.
</details>

---

## 🤝 Contributing

We welcome contributions from developers passionate about clean tech and smart cities! Please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">

Made with ❤️ for **Swachh Bharat Abhiyan** 🇮🇳

</div>
