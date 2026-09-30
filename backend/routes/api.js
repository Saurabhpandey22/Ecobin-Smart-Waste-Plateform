/**
 * Ecobin Express API Router
 */

const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');

const authController = require('../controllers/authController');
const complaintController = require('../controllers/complaintController');
const pickupController = require('../controllers/pickupController');
const binController = require('../controllers/binController');
const adminController = require('../controllers/adminController');
const ecoController = require('../controllers/ecoController');
const notificationController = require('../controllers/notificationController');
const aiChatController = require('../controllers/aiChatController');
const uploadController = require('../controllers/uploadController');
const AIWasteClassifier = require('../services/aiClassifier');

// --- File Upload Route ---
router.post('/upload', uploadController.uploadMiddleware, uploadController.handleUpload);

// --- Auth Routes ---
router.post('/auth/signup', authController.signup);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/login', authController.login);
router.post('/auth/demo-switch', authController.demoSwitchRole);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/me', authenticateToken, authController.getMe);
router.post('/auth/logout', authController.logout);

// --- Complaint Routes ---
router.post('/complaints', authenticateToken, complaintController.createComplaint);
router.get('/complaints', authenticateToken, complaintController.getComplaints);
router.get('/complaints/heatmap', authenticateToken, complaintController.getHeatmapData);
router.get('/complaints/:id', authenticateToken, complaintController.getComplaintById);
router.patch('/complaints/:id/status', authenticateToken, requireRole('staff', 'admin'), complaintController.updateStatus);
router.patch('/complaints/:id/assign', authenticateToken, requireRole('admin'), complaintController.assignStaff);

// --- Pickup Request Routes ---
router.post('/pickups', authenticateToken, pickupController.createPickupRequest);
router.get('/pickups', authenticateToken, pickupController.getPickupRequests);
router.patch('/pickups/:id/status', authenticateToken, requireRole('staff', 'admin'), pickupController.updatePickupStatus);

// --- Smart Bin IoT Routes ---
router.get('/bins', authenticateToken, binController.getBins);
router.post('/bins/telemetry', binController.ingestTelemetry); // Public ESP32 endpoint
router.get('/bins/:id', authenticateToken, binController.getBinById);
router.patch('/bins/:id/threshold', authenticateToken, requireRole('admin'), binController.updateThreshold);
router.post('/bins/:id/trigger-dump', authenticateToken, requireRole('admin'), binController.triggerDump);
router.post('/bins/:id/empty', authenticateToken, requireRole('staff', 'admin'), binController.emptyBin);
router.post('/bins/toggle-simulator', authenticateToken, requireRole('admin'), binController.toggleSimulator);

// --- Admin & Analytics Routes ---
router.get('/admin/summary-stats', authenticateToken, adminController.getSummaryStats);
router.get('/admin/route-optimization', authenticateToken, requireRole('staff', 'admin'), adminController.getRouteOptimization);
router.get('/admin/sustainability-report', authenticateToken, adminController.getSustainabilityReport);

// --- Eco Points & Rewards Routes ---
router.get('/eco/summary', authenticateToken, ecoController.getEcoSummary);
router.post('/eco/quiz-submit', authenticateToken, ecoController.submitQuiz);

// --- Notification Routes ---
router.get('/notifications', authenticateToken, notificationController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, notificationController.markRead);

// --- AI Classifier & AI Chat Endpoints ---
router.post('/ai/classify-waste', authenticateToken, (req, res) => {
  const { photo_url, notes } = req.body;
  const analysis = AIWasteClassifier.classifyWaste(photo_url, notes || '');
  res.status(200).json({ success: true, analysis });
});

router.post('/ai/chat', aiChatController.handleAIChat);

module.exports = router;
