/**
 * Ecobin Smart Dustbins & IoT Telemetry Controller
 */

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

    const bins = db.findMany('bins', filterFn, (a, b) => b.fill_percentage - a.fill_percentage);

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

// ESP32 REST Ingestion Endpoint: POST /api/bins/telemetry
exports.ingestTelemetry = async (req, res) => {
  try {
    const { binId, binCode, fillPercentage, batteryLevel, latitude, longitude } = req.body;

    let targetBinId = binId;
    if (!targetBinId && binCode) {
      const found = db.findOne('bins', b => b.bin_code === binCode);
      if (found) targetBinId = found.id;
    }

    if (!targetBinId || fillPercentage === undefined) {
      return res.status(400).json({ success: false, message: 'binId (or binCode) and fillPercentage are required.' });
    }

    const updated = iotSimulator.processTelemetry(
      targetBinId,
      fillPercentage,
      batteryLevel || 90,
      latitude,
      longitude
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Specified bin not found.' });
    }

    res.status(200).json({
      success: true,
      message: `ESP32 Telemetry ingested for ${updated.bin_code}`,
      bin: updated
    });
  } catch (err) {
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
