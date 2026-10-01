/**
 * Ecobin Production Backend Server
 * Express REST API + Socket.io WebSockets + IoT Sensor Simulator + Static Frontend Host
 */

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const apiRoutes = require('./routes/api');
const iotSimulator = require('./services/iotSimulator');

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Store io instance on app for controllers
app.set('io', io);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    tagline: 'Ecobin - Swachh Bharat Swastha Bharat',
    timestamp: new Date().toISOString(),
    simulatorRunning: iotSimulator.isRunning
  });
});

// Serve uploaded photos statically
const UPLOADS_DIR = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve frontend static build assets
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_DIST));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Ecobin Backend API is active. Frontend build ready.');
    }
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Initialize IoT Simulator & Serial USB Bridge with socket instance
iotSimulator.init(io);
const serialBridge = require('./services/serialBridge');
serialBridge.init(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌱 ECOBIN FULL-STACK PLATFORM BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`🇮🇳 Tagline: "Swachh Bharat Swastha Bharat"`);
  console.log(`📡 Real-Time WebSockets: Active`);
  console.log(`⚡ IoT Smart Bin Telemetry Simulator: Running`);
  console.log(`🌐 Unified Web App URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
