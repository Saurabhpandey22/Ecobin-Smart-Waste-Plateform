/**
 * Ecobin Smart Dustbins & IoT Telemetry Controller
 */

const os = require('os');
const db = require('../config/db');
const iotSimulator = require('../services/iotSimulator');

exports.getBins = async (req, res) => {
  try {
    const { status, ward_area } = req.query;

    let filterFn = null;
    if (status || ward_area) {
      filterFn = (b) => {
        if (status && status !== 'all' && b.status !== status) return false;
        if (ward_area && ward_area !== 'all' && b.ward_area !== ward_area) return false;
        return true;
      };
    }

    // Return bins, with hardware bins prioritized at the top
    const bins = db.findMany('bins', filterFn, (a, b) => {
      if (a.is_hardware && !b.is_hardware) return -1;
      if (!a.is_hardware && b.is_hardware) return 1;
      return b.fill_percentage - a.fill_percentage;
    });

    res.status(200).json({
      success: true,
      count: bins.length,
      bins,
      simulatorRunning: iotSimulator.isRunning
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch smart bins list.', error: err.message });
  }
};

exports.getBinById = async (req, res) => {
  try {
    const { id } = req.params;
    const bin = db.findOne('bins', b => b.id === Number(id) || b.bin_code === id);

    if (!bin) {
      return res.status(404).json({ success: false, message: 'Smart dustbin not found.' });
    }

    // Fetch historical telemetry logs for trend graph
    const logs = db.findMany('bin_logs', l => l.bin_id === bin.id, (a, b) => new Date(a.timestamp) - new Date(b.timestamp), 1, 30);

    res.status(200).json({
      success: true,
      bin,
      telemetryLogs: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve bin details.', error: err.message });
  }
};

// Returns current machine IP addresses so user knows exact URL for ESP32
exports.getNetworkInfo = async (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push({
            name,
            address: iface.address
          });
        }
      }
    }

    const isVirtual = (name) => /vmware|virtual|vethernet|hyper-v|loopback/i.test(name);
    const physicalIps = ips.filter(i => !isVirtual(i.name));
    const wifiIp = physicalIps.find(i => /wi-?fi|wlan/i.test(i.name))?.address;
    const ethIp = physicalIps.find(i => /ethernet|lan/i.test(i.name))?.address;
    const primaryIp = wifiIp || ethIp || physicalIps[0]?.address || ips[0]?.address || '127.0.0.1';

    res.status(200).json({
      success: true,
      primaryIp,
      availableIps: ips,
      apiUrl: `http://${primaryIp}:5000/api/bin/update`,
      endpoint: '/api/bin/update',
      suggestedBinCode: 'BIN001'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get network info', error: err.message });
  }
};

// ESP32 REST Ingestion Endpoint: POST /api/bin/update and /api/bins/telemetry
exports.ingestTelemetry = async (req, res) => {
  try {
    const rawBinCode = req.body.bin_id || req.body.binId || req.body.binCode || req.body.id || 'BIN001';
    const rawFill = req.body.fill_percentage !== undefined 
      ? req.body.fill_percentage 
      : (req.body.fillPercentage !== undefined ? req.body.fillPercentage : req.body.fill);
    const rawDistance = req.body.distance_cm !== undefined 
      ? req.body.distance_cm 
      : (req.body.distanceCm !== undefined ? req.body.distanceCm : req.body.distance);
    const rawBattery = req.body.battery_level !== undefined 
      ? req.body.battery_level 
      : (req.body.batteryLevel !== undefined ? req.body.batteryLevel : 95);
    const { latitude, longitude } = req.body;

    if (rawFill === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'fill_percentage (or fill) is required in JSON payload.' 
      });
    }

    const binCode = String(rawBinCode).trim();
    let bin = db.findOne('bins', b => b.bin_code.toLowerCase() === binCode.toLowerCase() || b.id === Number(binCode));

    // Auto-create bin if not already in database
    if (!bin) {
      bin = db.insert('bins', {
        bin_code: binCode,
        location_name: `Physical IoT Smart Bin (${binCode})`,
        latitude: latitude || 28.6315,
        longitude: longitude || 77.2167,
        fill_percentage: Math.min(100, Math.max(0, Math.round(Number(rawFill)))),
        distance_cm: rawDistance !== undefined ? Number(rawDistance) : null,
        battery_level: Number(rawBattery) || 95,
        threshold_value: 80,
        ward_area: 'Ward 14 - Connaught Place',
        status: Number(rawFill) >= 80 ? 'critical' : Number(rawFill) >= 50 ? 'warning' : 'normal',
        is_hardware: true,
        device_type: 'ESP32_HCSR04',
        last_updated: new Date().toISOString()
      });
      console.log(`🆕 [Auto-Registered Bin] Created new hardware bin entry for: ${binCode}`);
    }

    const parsedFill = Number(rawFill);
    const parsedDistance = rawDistance !== undefined && rawDistance !== null ? Number(rawDistance) : null;
    const parsedBattery = Number(rawBattery) || 95;

    const updated = iotSimulator.processTelemetry(
      bin.id,
      parsedFill,
      parsedBattery,
      latitude,
      longitude,
      parsedDistance,
      true // isHardware flag
    );

    console.log(`📡 [ESP32 Telemetry] Bin: ${updated.bin_code} | Fill: ${updated.fill_percentage}% | Distance: ${updated.distance_cm ?? 'N/A'}cm | Status: ${updated.status}`);

    res.status(200).json({
      success: true,
      message: `ESP32 Telemetry successfully ingested for ${updated.bin_code}`,
      bin: updated,
      received_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Telemetry ingestion error:', err);
    res.status(500).json({ success: false, message: 'Telemetry ingestion failed.', error: err.message });
  }
};

exports.updateThreshold = async (req, res) => {
  try {
    const { id } = req.params;
    const { threshold_value } = req.body;

    if (!threshold_value || threshold_value < 10 || threshold_value > 95) {
      return res.status(400).json({ success: false, message: 'Threshold must be between 10% and 95%.' });
    }

    const bin = db.findOne('bins', b => b.id === Number(id));
    if (!bin) return res.status(404).json({ success: false, message: 'Smart dustbin not found.' });

    const updated = db.update('bins', bin.id, { threshold_value: Number(threshold_value) });

    res.status(200).json({
      success: true,
      message: `Threshold for ${bin.bin_code} updated to ${threshold_value}%.`,
      bin: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update threshold.', error: err.message });
  }
};

exports.triggerDump = async (req, res) => {
  try {
    const { id } = req.params;
    const { addedFill = 35 } = req.body;

    const updated = iotSimulator.triggerDump(id, addedFill);
    if (!updated) return res.status(404).json({ success: false, message: 'Bin not found.' });

    res.status(200).json({
      success: true,
      message: `Simulated dump added +${addedFill}% to ${updated.bin_code}. Current fill: ${updated.fill_percentage}%.`,
      bin: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to simulate dump.', error: err.message });
  }
};

exports.emptyBin = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = iotSimulator.emptyBin(id);
    if (!updated) return res.status(404).json({ success: false, message: 'Bin not found.' });

    res.status(200).json({
      success: true,
      message: `Smart dustbin ${updated.bin_code} marked as emptied (0% fill).`,
      bin: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to empty bin.', error: err.message });
  }
};

exports.toggleSimulator = async (req, res) => {
  try {
    if (iotSimulator.isRunning) {
      iotSimulator.stopSimulation();
    } else {
      iotSimulator.startSimulation();
    }
    res.status(200).json({
      success: true,
      simulatorRunning: iotSimulator.isRunning,
      message: `IoT Telemetry Simulator is now ${iotSimulator.isRunning ? 'RUNNING' : 'PAUSED'}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle simulator state.', error: err.message });
  }
};
