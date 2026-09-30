/**
 * Ecobin Doorstep Waste Pickup Request Controller
 */

const db = require('../config/db');

exports.createPickupRequest = async (req, res) => {
  try {
    const { waste_type, preferred_slot, address_text, latitude, longitude, notes } = req.body;
    const userId = req.user.id;

    if (!waste_type || !preferred_slot) {
      return res.status(400).json({ success: false, message: 'Waste type and preferred time slot are required.' });
    }

    const newPickup = db.insert('pickup_requests', {
      user_id: userId,
      waste_type: waste_type.toLowerCase(),
      preferred_slot,
      address_text: address_text || req.user.ward_area || 'Resident Address',
      latitude: latitude ? Number(latitude) : 28.6315,
      longitude: longitude ? Number(longitude) : 77.2167,
      status: 'pending',
      assigned_staff_id: null,
      notes: notes || '',
      created_at: new Date().toISOString()
    });

    // Award +40 Eco points for requesting organized segregation pickup!
    const user = db.findOne('users', u => u.id === userId);
    if (user) {
      db.update('users', user.id, { eco_points: (user.eco_points || 0) + 40 });
      db.insert('eco_points', {
        user_id: userId,
        points: 40,
        reason: `Requested Doorstep Pickup #${newPickup.id} (${waste_type})`
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('new_pickup_request', newPickup);
    }

    res.status(201).json({
      success: true,
      message: 'Doorstep pickup request scheduled! Earned +40 Eco Points.',
      pickup: newPickup
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to schedule pickup request.', error: err.message });
  }
};

exports.getPickupRequests = async (req, res) => {
  try {
    const user = req.user;
    let filterFn = null;

    if (user.role === 'citizen') {
      filterFn = (p) => p.user_id === user.id;
    } else if (user.role === 'staff') {
      filterFn = (p) => p.assigned_staff_id === user.id || p.status === 'pending';
    }

    const pickups = db.findMany('pickup_requests', filterFn, (a, b) => new Date(b.created_at) - new Date(a.created_at));
    const users = db.findMany('users');

    const enriched = pickups.map(p => {
      const citizen = users.find(u => u.id === p.user_id);
      const staff = p.assigned_staff_id ? users.find(u => u.id === p.assigned_staff_id) : null;
      return {
        ...p,
        citizen_name: citizen ? citizen.name : 'Citizen User',
        citizen_phone: citizen ? citizen.phone : '',
        assigned_staff_name: staff ? staff.name : 'Unassigned',
        assigned_staff_phone: staff ? staff.phone : ''
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      pickups: enriched
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve pickup requests.', error: err.message });
  }
};

exports.updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_staff_id } = req.body;

    const pickup = db.findOne('pickup_requests', p => p.id === Number(id));
    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup request not found.' });

    const updates = {};
    if (status) updates.status = status;
    if (assigned_staff_id) updates.assigned_staff_id = Number(assigned_staff_id);

    const updated = db.update('pickup_requests', pickup.id, updates);

    // Notify citizen about status change
    const notifMsg = `Update on Doorstep Pickup #${pickup.id}: Status is now '${(status || pickup.status).toUpperCase()}'.`;
    const notif = db.insert('notifications', {
      user_id: pickup.user_id,
      message: notifMsg,
      type: 'pickup_update',
      is_read: 0,
      link: '/citizen/pickups'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('pickup_updated', updated);
      io.emit(`notification_user_${pickup.user_id}`, notif);
    }

    res.status(200).json({
      success: true,
      message: `Pickup request #${pickup.id} updated.`,
      pickup: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update pickup request status.', error: err.message });
  }
};
