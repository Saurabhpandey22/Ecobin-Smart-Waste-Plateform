/**
 * Ecobin Serial Port Bridge for ESP32 USB Connection
 * Reads ultrasonic sensor telemetry directly from USB Serial COM port at 115200 baud.
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const iotSimulator = require('./iotSimulator');

class SerialBridge {
  constructor() {
    this.port = null;
    this.parser = null;
    this.activePortPath = null;
    this.isConnected = false;
    this.pollInterval = null;
    this.io = null;
    this.lastReading = null;
  }

  init(io) {
    this.io = io;
    this.startAutoDetection();
  }

  async listAvailablePorts() {
    try {
      const ports = await SerialPort.list();
      return ports.map(p => ({
        path: p.path,
        manufacturer: p.manufacturer || 'Unknown',
        serialNumber: p.serialNumber,
        pnpId: p.pnpId,
        friendlyName: p.friendlyName || p.path
      }));
    } catch (err) {
      console.error('Error listing serial ports:', err.message);
      return [];
    }
  }

  startAutoDetection() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    // Poll every 3 seconds for connected USB Serial devices
    this.pollInterval = setInterval(async () => {
      if (this.isConnected) return;

      try {
        const ports = await SerialPort.list();
        // Look for common ESP32 USB bridge chips: CH340, CP210x, FTDI, Silicon Labs, or any COM port
        const espPort = ports.find(p => 
          /ch340|cp210|silicon|ftdi|usb serial|wch|espressif/i.test(
            (p.manufacturer || '') + ' ' + (p.pnpId || '') + ' ' + (p.friendlyName || '')
          )
        ) || ports[0]; // fallback to first available port if only one exists

        if (espPort && espPort.path) {
          console.log(`🔌 [USB Serial Auto-Detect] Found serial device: ${espPort.path} (${espPort.manufacturer || 'Generic'}). Attempting connection...`);
          this.connect(espPort.path);
        }
      } catch (err) {
        // Silently continue scanning
      }
    }, 3000);
  }

  connect(portPath, baudRate = 115200) {
    if (this.isConnected) {
      if (this.activePortPath === portPath) return true;
      this.disconnect();
    }

    try {
      console.log(`🔌 [USB Serial] Connecting to ${portPath} at ${baudRate} baud...`);
      this.port = new SerialPort({
        path: portPath,
        baudRate: baudRate,
        autoOpen: true
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
      this.activePortPath = portPath;

      this.port.on('open', () => {
        this.isConnected = true;
        console.log(`✅ [USB Serial Connected] ESP32 Data Cable active on ${portPath}!`);
        if (this.io) {
          this.io.emit('serial_status', { connected: true, port: portPath });
        }
      });

      this.parser.on('data', (line) => {
        this.handleSerialLine(line);
      });

      this.port.on('close', () => {
        console.log(`🔌 [USB Serial] Port ${portPath} closed.`);
        this.isConnected = false;
        this.activePortPath = null;
        if (this.io) {
          this.io.emit('serial_status', { connected: false });
        }
      });

      this.port.on('error', (err) => {
        console.warn(`⚠️ [USB Serial Warning] ${portPath}:`, err.message);
        this.isConnected = false;
        this.activePortPath = null;
      });

      return true;
    } catch (err) {
      console.error(`❌ [USB Serial Error] Failed to open ${portPath}:`, err.message);
      this.isConnected = false;
      this.activePortPath = null;
      return false;
    }
  }

  disconnect() {
    if (this.port && this.port.isOpen) {
      try {
        this.port.close();
      } catch (e) {}
    }
    this.port = null;
    this.parser = null;
    this.isConnected = false;
    this.activePortPath = null;
  }

  handleSerialLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Broadcast raw serial line to UI stream
    if (this.io) {
      this.io.emit('raw_serial_line', { line: trimmed, timestamp: new Date().toISOString() });
    }

    // Match Arduino prints:
    // Distance: 10.3 cm
    // Fill: 0%
    // Status: NORMAL
    const distMatch = trimmed.match(/Distance:\s*([\d.]+)/i);
    const fillMatch = trimmed.match(/Fill:\s*(\d+)/i);
    const statusMatch = trimmed.match(/Status:\s*([A-Za-z ]+)/i);

    if (distMatch) {
      if (!this.lastReading) this.lastReading = {};
      this.lastReading.distance = parseFloat(distMatch[1]);
    }

    if (fillMatch) {
      if (!this.lastReading) this.lastReading = {};
      this.lastReading.fill = parseInt(fillMatch[1], 10);
    }

    if (statusMatch) {
      if (!this.lastReading) this.lastReading = {};
      this.lastReading.status = statusMatch[1].trim();
    }

    // When we have both fill and distance, process into BIN001
    if (this.lastReading && this.lastReading.fill !== undefined && this.lastReading.distance !== undefined) {
      const fill = this.lastReading.fill;
      const distance = this.lastReading.distance;
      this.lastReading = null; // reset for next packet

      console.log(`📡 [USB Serial Telemetry] Real HC-SR04 reading -> Fill: ${fill}%, Distance: ${distance}cm`);

      // Update BIN001 directly in simulator and database
      iotSimulator.processTelemetry(
        'BIN001',
        fill,
        95,
        null,
        null,
        distance,
        true // isHardware = true
      );
    }
  }
}

const serialBridgeInstance = new SerialBridge();
module.exports = serialBridgeInstance;
