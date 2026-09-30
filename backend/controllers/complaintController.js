/**
 * Ecobin Waste Complaints Controller
 * Centralized business logic for reporting, tracking, staff assignment,
 * status updates, real-time broadcasts, and heatmap analytics.
 */

const db = require('../config/db');
const AIWasteClassifier = require('../services/aiClassifier');

exports.createComplaint = async (req, res) => {
  try {
    const { type, description, photo_url, latitude, longitude, address_text, ward_area, priority = 'medium' } = req.body;
    const userId = req.user.id;

    if (!description && !type) {
      return res.status(400).json({ success: false, message: 'Type or description is required.' });
    }

    // Process photo with AI Classifier if present or text description
    const aiResult = AIWasteClassifier.classifyWaste(photo_url || description, description || '');

    const newComplaint = db.insert('complaints', {
      user_id: userId,
      type: type || aiResult.category,
      description: description || 'Waste complaint submitted via mobile/web',
      photo_url: photo_url || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
      latitude: latitude ? Number(latitude) : 28.6315,
      longitude: longitude ? Number(longitude) : 77.2167,
      address_text: address_text || 'Connaught Place Area, New Delhi',
      ward_area: ward_area || req.user.ward_area || 'Ward 14 - Connaught Place',
      status: 'reported',
      assigned_staff_id: null,
      priority: priority.toLowerCase(),
      ai_classification: `${aiResult.typeName} (${aiResult.confidenceScore})`,
      proof_photo_url: null,
      created_at: new Date().toISOString(),
      resolved_at: null
    });

    // Award Eco Points to Citizen for reporting!
    const pointsAwarded = aiResult.recommendedEcoPoints || 30;
    const user = db.findOne('users', u => u.id === userId);
    if (user) {
      db.update('users', user.id, { eco_points: (user.eco_points || 0) + pointsAwarded });
      db.insert('eco_points', {
        user_id: userId,
        points: pointsAwarded,
        reason: `Reported issue #${newComplaint.id} (${newComplaint.type})`
      });
    }

    // Attach citizen metadata for socket broadcast
    const enrichedComplaint = {
      ...newComplaint,
      citizen_name: req.user.name,
      citizen_email: req.user.email
    };

    // Emit Real-Time Socket Event to Admin Complaints Dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('new_complaint', enrichedComplaint);
    }

    res.status(201).json({
      success: true,
      message: `Complaint #${newComplaint.id} logged successfully! You earned +${pointsAwarded} Eco Points.`,
      complaint: enrichedComplaint,
      aiAnalysis: aiResult
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create complaint.', error: err.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { status, type, priority, ward_area, staff_id, search, scope, page = 1, limit = 50 } = req.query;
    const user = req.user;

    let filterFn = (c) => {
      // Role-based visibility scoping (unless scope=all is requested for dashboard or user is admin)
      if (scope !== 'all' && user.role !== 'admin') {
        if (user.role === 'citizen') {
          if (c.user_id !== user.id) return false;
        } else if (user.role === 'staff') {
          if (c.assigned_staff_id !== user.id && c.ward_area !== user.ward_area) return false;
        }
      }

      // Filter by status
      if (status && status !== 'all' && c.status !== status) return false;

      // Filter by type
      if (type && type !== 'all' && c.type !== type) return false;

      // Filter by priority
      if (priority && priority !== 'all' && c.priority !== priority) return false;

      // Filter by ward_area
      if (ward_area && ward_area !== 'all' && c.ward_area !== ward_area) return false;

      // Filter by staff_id
      if (staff_id && staff_id !== 'all' && Number(c.assigned_staff_id) !== Number(staff_id)) return false;

      // Search bar
      if (search && search.trim() !== '') {
        const query = search.toLowerCase();
        const matchesId = String(c.id).includes(query);
        const matchesDesc = (c.description || '').toLowerCase().includes(query);
        const matchesAddress = (c.address_text || '').toLowerCase().includes(query);
        const matchesWard = (c.ward_area || '').toLowerCase().includes(query);
        const citizen = db.findOne('users', u => u.id === c.user_id);
        const matchesCitizen = citizen ? citizen.name.toLowerCase().includes(query) : false;

        if (!matchesId && !matchesDesc && !matchesAddress && !matchesWard && !matchesCitizen) return false;
      }

      return true;
    };

    // Sort: unresolved first, then newest first
    const sortFn = (a, b) => {
      const aResolved = a.status === 'resolved' ? 1 : 0;
      const bResolved = b.status === 'resolved' ? 1 : 0;
      if (aResolved !== bResolved) return aResolved - bResolved;
      return new Date(b.created_at) - new Date(a.created_at);
    };

    const complaints = db.findMany('complaints', filterFn, sortFn, Number(page), Number(limit));

    // Enrich with Citizen Name & Assigned Staff Name
    const usersList = db.findMany('users');
    const userMap = new Map(usersList.map(u => [u.id, u.name]));

    const enrichedList = complaints.map(c => ({
      ...c,
      citizen_name: userMap.get(c.user_id) || 'Citizen User',
      assigned_staff_name: c.assigned_staff_id ? userMap.get(c.assigned_staff_id) || 'Assigned Officer' : 'Unassigned'
    }));

    const totalCount = db.count('complaints', filterFn);

    res.status(200).json({
      success: true,
      count: enrichedList.length,
      total: totalCount,
      page: Number(page),
      complaints: enrichedList
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints.', error: err.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = db.findOne('complaints', c => c.id === Number(id));

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const citizen = db.findOne('users', u => u.id === complaint.user_id);
    const staff = complaint.assigned_staff_id ? db.findOne('users', u => u.id === complaint.assigned_staff_id) : null;

    res.status(200).json({
      success: true,
      complaint: {
        ...complaint,
        citizen_name: citizen ? citizen.name : 'Unknown Citizen',
        citizen_phone: citizen ? citizen.phone : '',
        assigned_staff_name: staff ? staff.name : 'Unassigned',
        assigned_staff_phone: staff ? staff.phone : ''
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve complaint details.', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, proof_photo_url } = req.body;

    const complaint = db.findOne('complaints', c => c.id === Number(id));
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (proof_photo_url) updates.proof_photo_url = proof_photo_url;
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();

    const updated = db.update('complaints', complaint.id, updates);

    // Notify citizen about status change
    const notifMsg = `Update on Complaint #${complaint.id}: Status changed to '${status.toUpperCase()}'.`;
    const notif = db.insert('notifications', {
      user_id: complaint.user_id,
      message: notifMsg,
      type: 'complaint_update',
      is_read: 0,
      link: '/citizen/complaints'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('complaint_updated', updated);
      io.emit(`notification_user_${complaint.user_id}`, notif);
    }

    res.status(200).json({
      success: true,
      message: `Complaint #${complaint.id} status updated to '${status}'.`,
      complaint: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update complaint status.', error: err.message });
  }
};

exports.assignStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id } = req.body;

    const complaint = db.findOne('complaints', c => c.id === Number(id));
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const staffUser = db.findOne('users', u => u.id === Number(staff_id) && u.role === 'staff');
    if (!staffUser) {
      return res.status(400).json({ success: false, message: 'Invalid staff user ID selected.' });
    }

    const updated = db.update('complaints', complaint.id, {
      assigned_staff_id: staffUser.id,
      status: complaint.status === 'reported' ? 'acknowledged' : complaint.status
    });

    // Notify staff user
    const staffNotif = db.insert('notifications', {
      user_id: staffUser.id,
      message: `NEW ASSIGNMENT: Complaint #${complaint.id} (${complaint.type}) in ${complaint.ward_area} assigned to you.`,
      type: 'pickup_assigned',
      is_read: 0,
      link: '/staff/tasks'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('complaint_updated', updated);
      io.emit(`notification_user_${staffUser.id}`, staffNotif);
    }

    res.status(200).json({
      success: true,
      message: `Complaint #${complaint.id} assigned to ${staffUser.name}.`,
      complaint: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to assign staff.', error: err.message });
  }
};

exports.getHeatmapData = async (req, res) => {
  try {
    const complaints = db.findMany('complaints');
    const bins = db.findMany('bins');

    const points = [];

    // Add complaint pins as hotspot intensity 0.8
    complaints.forEach(c => {
      points.push({
        id: `complaint-${c.id}`,
        type: 'complaint',
        lat: c.latitude,
        lng: c.longitude,
        intensity: c.priority === 'high' || c.priority === 'critical' ? 1.0 : 0.7,
        label: `${c.type} (${c.status})`,
        ward: c.ward_area
      });
    });

    // Add high fill bin markers as intensity proportional to fill percentage
    bins.forEach(b => {
      points.push({
        id: `bin-${b.id}`,
        type: 'smart_bin',
        lat: b.latitude,
        lng: b.longitude,
        intensity: b.fill_percentage / 100,
        label: `${b.bin_code}: ${b.fill_percentage}% fill`,
        ward: b.ward_area
      });
    });

    res.status(200).json({
      success: true,
      totalPoints: points.length,
      heatmapData: points
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate heatmap dataset.', error: err.message });
  }
};
