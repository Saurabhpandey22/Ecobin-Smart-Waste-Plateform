/**
 * Ecobin IoT Smart Dustbin Telemetry & Simulator Engine
 * Simulates real-time ESP32 ultrasonic sensor data, battery drain, fill spikes,
 * threshold notifications, and automated escalation.
 */

const db = require('../config/db');

class IoTSimulator {
  constructor() {
    this.intervalId = null;
    this.io = null;
    this.isRunning = false;
  }

  init(io) {
    this.io = io;
    this.isRunning = false;
    console.log('🛡️ Ecobin IoT Simulator: OFF by default. Real ESP32 hardware telemetry enabled.');
  }

  startSimulation() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Simulation runs every 5 seconds
    this.intervalId = setInterval(() => {
      this.tick();
    }, 5000);

    console.log('⚡ Ecobin IoT Sensor Telemetry Simulator started.');
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏸️ Ecobin IoT Telemetry Simulator paused.');
  }

  // Process a single telemetry update packet (from real ESP32 REST endpoint or simulator)
  processTelemetry(binId, fillPercentage, batteryLevel, locationLat = null, locationLng = null, distanceCm = null, isHardware = false) {
    const bin = db.findOne('bins', b => b.id === Number(binId) || b.bin_code === String(binId));
    if (!bin) return null;

    const previousFill = bin.fill_percentage;
    const newFill = Math.min(100, Math.max(0, Math.round(fillPercentage)));
    const newBattery = Math.min(100, Math.max(0, Math.round(batteryLevel)));

    let newStatus = 'normal';
    if (newFill >= bin.threshold_value) {
      newStatus = 'critical';
    } else if (newFill >= 50) {
      newStatus = 'warning';
    }

    const updates = {
      fill_percentage: newFill,
      battery_level: newBattery,
      status: newStatus,
      latitude: locationLat || bin.latitude,
      longitude: locationLng || bin.longitude,
      last_updated: newISOString()
    };

    if (distanceCm !== null && distanceCm !== undefined && !isNaN(Number(distanceCm))) {
      updates.distance_cm = Math.round(Number(distanceCm) * 10) / 10;
    }

    if (isHardware) {
      updates.is_hardware = true;
      updates.last_hardware_ping = newISOString();
    }

    // Update bin record
    const updatedBin = db.update('bins', bin.id, updates);

    // Save historical log
    db.insert('bin_logs', {
      bin_id: bin.id,
      fill_percentage: newFill,
      distance_cm: updates.distance_cm !== undefined ? updates.distance_cm : (bin.distance_cm ?? null),
      battery_level: newBattery,
      is_hardware: Boolean(isHardware || bin.is_hardware),
      timestamp: newISOString()
    });

    // Check for threshold breach notification (>= 80% or threshold_value)
    const threshold = bin.threshold_value || 80;
    const now = Date.now();
    const lastAlert = bin.last_alert_timestamp ? new Date(bin.last_alert_timestamp).getTime() : 0;
    const cooldownMs = 15 * 1000; // 15 seconds cooldown for responsive hardware testing

    if (newFill < threshold) {
      // When bin drops below 80%, reset alert timestamp so next time it crosses >= 80%, it alerts instantly!
      if (bin.last_alert_timestamp) {
        db.update('bins', bin.id, { last_alert_timestamp: null });
      }
    } else if (newFill >= threshold && (previousFill < threshold || (now - lastAlert > cooldownMs))) {
      db.update('bins', bin.id, { last_alert_timestamp: newISOString() });
      this.triggerThresholdAlert(updatedBin);
    }

    // Broadcast via Socket.io if available
    if (this.io) {
      this.io.emit('bin_updated', updatedBin);
      this.io.emit('iot_telemetry', {
        binId: updatedBin.id,
        binCode: updatedBin.bin_code,
        fillPercentage: newFill,
        distanceCm: updatedBin.distance_cm ?? null,
        batteryLevel: newBattery,
        status: newStatus,
        isHardware: Boolean(updatedBin.is_hardware),
        timestamp: newISOString()
      });
    }

    return updatedBin;
  }

  // Auto-generate realistic random telemetry fluctuation (virtual bins only)
  tick() {
    // Only simulate virtual bins; DO NOT overwrite physical hardware bins (is_hardware = true)
    const virtualBins = db.findMany('bins', b => !b.is_hardware);
    if (virtualBins.length === 0) return;

    // Pick 1 or 2 random bins to update fill percentage
    const randomIndex = Math.floor(Math.random() * virtualBins.length);
    const targetBin = virtualBins[randomIndex];

    // Micro dump event or small change
    const delta = Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : -Math.floor(Math.random() * 2);
    const newFill = Math.min(100, Math.max(5, targetBin.fill_percentage + delta));
    const newBattery = Math.max(10, targetBin.battery_level - (Math.random() > 0.8 ? 1 : 0));

    this.processTelemetry(targetBin.id, newFill, newBattery, null, null, null, false);
  }

  // Manually trigger a waste dump on a bin (for demo purpose)
  triggerDump(binId, addedFill = 35) {
    const bin = db.findOne('bins', b => b.id === Number(binId));
    if (!bin) return null;

    const newFill = Math.min(100, bin.fill_percentage + addedFill);
    return this.processTelemetry(bin.id, newFill, bin.battery_level);
  }

  // Empty a bin (simulating staff pickup)
  emptyBin(binId) {
    const bin = db.findOne('bins', b => b.id === Number(binId));
    if (!bin) return null;

    return this.processTelemetry(bin.id, 0, bin.battery_level);
  }

  // Trigger real-time threshold alert notification
  triggerThresholdAlert(bin) {
    const alertMsg = `🚨 DUSTBIN FULL ALERT: Smart Dustbin ${bin.bin_code} (${bin.location_name}) reached ${bin.fill_percentage}% fill capacity! Immediate collection required.`;

    // Notify ALL active users (admins, staff, citizens)
    const allUsers = db.findMany('users');
    allUsers.forEach(u => {
      const notif = db.insert('notifications', {
        user_id: u.id,
        message: alertMsg,
        type: 'threshold_alert',
        bin_code: bin.bin_code,
        fill_percentage: bin.fill_percentage,
        is_read: 0,
        link: '/bins'
      });
      if (this.io) {
        this.io.emit(`notification_user_${u.id}`, notif);
      }
    });

    if (this.io) {
      this.io.emit('threshold_alert', {
        binId: bin.id,
        binCode: bin.bin_code,
        fillPercentage: bin.fill_percentage,
        distanceCm: bin.distance_cm,
        locationName: bin.location_name,
        wardArea: bin.ward_area,
        message: alertMsg,
        timestamp: newISOString()
      });
    }

    console.log(`🚨 [THRESHOLD ALERT] ${bin.bin_code} is FULL: ${bin.fill_percentage}% >= ${bin.threshold_value}%!`);
  }
}

function newISOString() {
  return new Date().toISOString();
}

const simulatorInstance = new IoTSimulator();
module.exports = simulatorInstance;
