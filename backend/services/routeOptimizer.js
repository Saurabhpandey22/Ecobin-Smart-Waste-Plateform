/**
 * Ecobin Smart Route Optimization Engine
 * Calculates optimal collection routes for staff members by aggregating:
 * 1. Smart Dustbins with fill percentage > 70%
 * 2. Unresolved Citizen Complaints in the same ward/area
 * Solves Travelling Salesperson heuristic to minimize total distance and time.
 */

const db = require('../config/db');

class RouteOptimizer {
  static getOptimizedRouteForStaff(staffId) {
    const staff = db.findOne('users', u => u.id === Number(staffId) && u.role === 'staff');
    const wardArea = staff ? staff.ward_area : 'Ward 14 - Connaught Place';

    // Fetch high fill bins
    const bins = db.findMany(
      'bins',
      b => b.fill_percentage >= 65 && (b.ward_area === wardArea || !staff)
    );

    // Fetch pending/in-progress complaints assigned or unassigned in ward
    const complaints = db.findMany(
      'complaints',
      c => c.status !== 'resolved' && (c.assigned_staff_id === Number(staffId) || c.ward_area === wardArea)
    );

    // Build waypoints list
    const waypoints = [];

    bins.forEach(bin => {
      waypoints.push({
        id: `bin-${bin.id}`,
        type: 'smart_bin',
        title: `Smart Bin: ${bin.bin_code}`,
        subtitle: bin.location_name,
        latitude: bin.latitude,
        longitude: bin.longitude,
        priority: bin.fill_percentage > 80 ? 'CRITICAL' : 'HIGH',
        fillPercentage: bin.fill_percentage,
        wardArea: bin.ward_area
      });
    });

    complaints.forEach(comp => {
      waypoints.push({
        id: `complaint-${comp.id}`,
        type: 'citizen_complaint',
        title: `Complaint #${comp.id}: ${comp.type.replace('_', ' ').toUpperCase()}`,
        subtitle: comp.address_text || comp.ward_area,
        latitude: comp.latitude,
        longitude: comp.longitude,
        priority: comp.priority.toUpperCase(),
        fillPercentage: null,
        wardArea: comp.ward_area
      });
    });

    // Greedy Nearest Neighbor Sort starting from central hub (28.6315, 77.2167)
    let currentLat = 28.6315;
    let currentLng = 77.2167;
    const remaining = [...waypoints];
    const orderedWaypoints = [];
    let totalDistanceKm = 0;

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = haversineDistance(currentLat, currentLng, remaining[i].latitude, remaining[i].longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }

      const nextPoint = remaining.splice(nearestIndex, 1)[0];
      totalDistanceKm += minDistance;
      currentLat = nextPoint.latitude;
      currentLng = nextPoint.longitude;

      orderedWaypoints.push({
        step: orderedWaypoints.length + 1,
        ...nextPoint,
        legDistanceKm: Math.round(minDistance * 100) / 100
      });
    }

    const estTimeMinutes = Math.round(totalDistanceKm * 6 + orderedWaypoints.length * 10);

    return {
      staffId: staff ? staff.id : staffId,
      staffName: staff ? staff.name : 'Sanitation Team',
      wardArea,
      totalWaypoints: orderedWaypoints.length,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      estimatedTimeMinutes: estTimeMinutes,
      waypoints: orderedWaypoints,
      generatedAt: new Date().toISOString()
    };
  }
}

// Haversine formula to compute distance in KM
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = RouteOptimizer;
