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
    this.startSimulation();
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
  processTelemetry(binId, fillPercentage, batteryLevel, locationLat = null, locationLng = null) {
    const bin = db.findOne('bins', b => b.id === Number(binId));
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

    // Update bin record
    const updatedBin = db.update('bins', bin.id, {
      fill_percentage: newFill,
      battery_level: newBattery,
      status: newStatus,
      latitude: locationLat || bin.latitude,
      longitude: locationLng || bin.longitude,
      last_updated: newISOString()
    });

    // Save historical log
    db.insert('bin_logs', {
      bin_id: bin.id,
      fill_percentage: newFill,
      battery_level: newBattery,
      timestamp: newISOString()
    });

    // Check for threshold breach notification
    if (newFill >= bin.threshold_value && previousFill < bin.threshold_value) {
      this.triggerThresholdAlert(updatedBin);
    }

    // Broadcast via Socket.io if available
    if (this.io) {
      this.io.emit('bin_updated', updatedBin);
      this.io.emit('iot_telemetry', {
        binId: updatedBin.id,
        binCode: updatedBin.bin_code,
        fillPercentage: newFill,
        batteryLevel: newBattery,
        status: newStatus,
        timestamp: newISOString()
      });
    }

    return updatedBin;
  }

  // Auto-generate realistic random telemetry fluctuation
  tick() {
    const bins = db.findMany('bins');
    if (bins.length === 0) return;

    // Pick 1 or 2 random bins to update fill percentage
    const randomIndex = Math.floor(Math.random() * bins.length);
    const targetBin = bins[randomIndex];

    // Micro dump event or small change
    const delta = Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : -Math.floor(Math.random() * 2);
    const newFill = Math.min(100, Math.max(5, targetBin.fill_percentage + delta));
    const newBattery = Math.max(10, targetBin.battery_level - (Math.random() > 0.8 ? 1 : 0));

    this.processTelemetry(targetBin.id, newFill, newBattery);
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
    const alertMsg = `CRITICAL ALERT: Smart Dustbin ${bin.bin_code} (${bin.location_name}) reached ${bin.fill_percentage}% fill capacity! Immediate collection required.`;

    // Notify all admin users
    const admins = db.findMany('users', u => u.role === 'admin');
    admins.forEach(admin => {
      const notif = db.insert('notifications', {
        user_id: admin.id,
        message: alertMsg,
        type: 'threshold_alert',
        is_read: 0,
        link: '/admin/bins'
      });
      if (this.io) {
        this.io.emit(`notification_user_${admin.id}`, notif);
      }
    });

    // Notify staff assigned to ward
    const staffMembers = db.findMany('users', u => u.role === 'staff' && u.ward_area === bin.ward_area);
    staffMembers.forEach(staff => {
      const notif = db.insert('notifications', {
        user_id: staff.id,
        message: `TASK DISPATCH: ${bin.bin_code} in your area ${bin.ward_area} requires immediate clearing (${bin.fill_percentage}% fill).`,
        type: 'threshold_alert',
        is_read: 0,
        link: '/staff/tasks'
      });
      if (this.io) {
        this.io.emit(`notification_user_${staff.id}`, notif);
      }
    });

    if (this.io) {
      this.io.emit('threshold_alert', {
        binId: bin.id,
        binCode: bin.bin_code,
        fillPercentage: bin.fill_percentage,
        locationName: bin.location_name,
        wardArea: bin.ward_area
      });
    }
  }
}

function newISOString() {
  return new Date().toISOString();
}

const simulatorInstance = new IoTSimulator();
module.exports = simulatorInstance;
