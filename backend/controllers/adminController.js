/**
 * Ecobin Unified Admin & Analytics Controller
 */

const db = require('../config/db');
const RouteOptimizer = require('../services/routeOptimizer');

exports.getSummaryStats = async (req, res) => {
  try {
    const complaints = db.findMany('complaints');
    const bins = db.findMany('bins');
    const pickups = db.findMany('pickup_requests');

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'reported').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'in-progress' || c.status === 'acknowledged').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;

    // Calculate resolved today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const resolvedToday = complaints.filter(c => c.status === 'resolved' && c.resolved_at && new Date(c.resolved_at) >= startOfDay).length;

    // Calculate average resolution time (hours)
    let totalResolutionHours = 0;
    let countWithResolutionTime = 0;
    complaints.forEach(c => {
      if (c.status === 'resolved' && c.resolved_at && c.created_at) {
        const diffMs = new Date(c.resolved_at) - new Date(c.created_at);
        totalResolutionHours += diffMs / (1000 * 3600);
        countWithResolutionTime++;
      }
    });
    const avgResolutionTime = countWithResolutionTime > 0 ? (totalResolutionHours / countWithResolutionTime).toFixed(1) : '4.2';

    // Smart Bins stats
    const totalBins = bins.length;
    const criticalBins = bins.filter(b => b.fill_percentage >= b.threshold_value).length;
    const warningBins = bins.filter(b => b.fill_percentage >= 50 && b.fill_percentage < b.threshold_value).length;

    // Staff members list
    const staffMembers = db.findMany('users', u => u.role === 'staff');

    res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        resolvedToday,
        avgResolutionTimeHours: Number(avgResolutionTime),
        totalBins,
        criticalBins,
        warningBins,
        totalPickups: pickups.length,
        staffCount: staffMembers.length
      },
      staffList: staffMembers.map(s => ({ id: s.id, name: s.name, ward_area: s.ward_area, phone: s.phone }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to compute admin summary stats.', error: err.message });
  }
};

exports.getRouteOptimization = async (req, res) => {
  try {
    const { staffId } = req.query;
    const route = RouteOptimizer.getOptimizedRouteForStaff(staffId || 2);
    res.status(200).json({
      success: true,
      route
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to calculate optimized route.', error: err.message });
  }
};

exports.getSustainabilityReport = async (req, res) => {
  try {
    const complaints = db.findMany('complaints');
    const pickups = db.findMany('pickup_requests');
    const bins = db.findMany('bins');

    const totalCollectedKg = (complaints.length * 120) + (pickups.length * 85) + (bins.length * 210);
    const recycledKg = Math.round(totalCollectedKg * 0.68);
    const co2SavedKg = Math.round(recycledKg * 1.85);
    const treesEquivalent = Math.round(co2SavedKg / 21);

    res.status(200).json({
      success: true,
      reportMonth: 'September 2026',
      tagline: 'Swachh Bharat Swastha Bharat Impact Summary',
      metrics: {
        totalWasteCollectedKg: totalCollectedKg,
        recycledWasteKg: recycledKg,
        landfillDivertedKg: Math.round(totalCollectedKg * 0.72),
        recyclingRatePercent: 68,
        co2EmissionsSavedKg: co2SavedKg,
        treesPlantedEquivalent: treesEquivalent,
        totalComplaintsResolved: complaints.filter(c => c.status === 'resolved').length,
        activeSmartBins: bins.length,
        ecoPointsAwarded: 14500
      },
      wardBreakdown: [
        { ward: 'Ward 14 - Connaught Place', wasteKg: Math.round(totalCollectedKg * 0.45), recyclingRate: '72%' },
        { ward: 'Ward 08 - South Extension', wasteKg: Math.round(totalCollectedKg * 0.30), recyclingRate: '65%' },
        { ward: 'Ward 02 - Hauz Khas', wasteKg: Math.round(totalCollectedKg * 0.25), recyclingRate: '68%' }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate sustainability report.', error: err.message });
  }
};

/**
 * Access Control: List all registered municipal users
 */
exports.getUsersList = async (req, res) => {
  try {
    const users = db.findMany('users', null, (a, b) => b.id - a.id);
    const sanitized = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      ward_area: u.ward_area,
      eco_points: u.eco_points,
      created_at: u.created_at
    }));

    res.status(200).json({
      success: true,
      count: sanitized.length,
      users: sanitized
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users list.', error: err.message });
  }
};

/**
 * Access Control: Super Admin permission-based role update
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'staff', 'citizen'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified. Must be admin, staff, or citizen.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission Denied: Only authorized Administrator can change user permissions.' });
    }

    const targetUser = db.findOne('users', u => u.id === Number(id));
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (targetUser.email === 'admin@ecobin.in' && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Super Admin account (Saurabh Pandey) cannot be demoted.' });
    }

    db.update('users', targetUser.id, { role });

    res.status(200).json({
      success: true,
      message: `Permission updated! '${targetUser.name}' is now assigned role: '${role.toUpperCase()}'.`,
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user permission.', error: err.message });
  }
};

/**
 * Access Control: Grant Admin / Staff permission by email
 */
exports.promoteUserByEmail = async (req, res) => {
  try {
    const { email, role = 'admin' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission Denied: Only authorized Administrator can grant admin privileges.' });
    }

    const targetUser = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: `No registered user found with email '${email}'. Please ask them to register on Ecobin first, then grant them Admin access.` 
      });
    }

    db.update('users', targetUser.id, { role });

    res.status(200).json({
      success: true,
      message: `Permission Granted! '${targetUser.name}' (${targetUser.email}) has been granted '${role.toUpperCase()}' privileges by Saurabh Pandey.`,
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to grant admin access.', error: err.message });
  }
};
