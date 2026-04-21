const Venue = require('../models/Venue');
const Equipment = require('../models/Equipment');

function toNumberOr(value, fallback = 0) {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

function mapVenueOut(v) {
  return {
    venueId: String(v._id),
    venueName: v.venueName,
    capacity: v.capacity,
    location: v.location || '',
    status: v.status || 'available',
    utilisation: 0,
  };
}

function mapEquipmentOut(e) {
  return {
    equipmentId: String(e._id),
    equipmentName: e.equipmentName,
    category: e.category || '',
    total: e.total ?? 0,
    available: e.available ?? 0,
    inUse: e.inUse ?? 0,
    underMaintenance: e.underMaintenance ?? 0,
    status: e.status || 'available',
  };
}

// GET /api/catalog/venues
const listVenues = async (req, res) => {
  try {
    const venues = await Venue.find({}).sort({ venueName: 1 }).lean();
    res.status(200).json(venues.map(mapVenueOut));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/catalog/venues (Venue Officer)
const createVenue = async (req, res) => {
  try {
    const name = (req.body?.venueName != null ? String(req.body.venueName) : '').trim();
    const capacity = toNumberOr(req.body?.capacity, NaN);
    if (!name) return res.status(400).json({ message: 'venueName is required' });
    if (!Number.isFinite(capacity)) return res.status(400).json({ message: 'capacity is required' });

    const doc = await Venue.create({
      venueName: name,
      capacity,
      location: (req.body?.location != null ? String(req.body.location) : '').trim(),
      status: req.body?.status || 'available',
    });
    res.status(201).json(mapVenueOut(doc));
  } catch (error) {
    if (String(error?.message || '').includes('duplicate key')) {
      return res.status(400).json({ message: 'Venue already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/catalog/venues/:id (Venue Officer)
const updateVenue = async (req, res) => {
  try {
    const update = {};
    if (req.body?.venueName != null) update.venueName = String(req.body.venueName).trim();
    if (req.body?.capacity != null) update.capacity = toNumberOr(req.body.capacity, 0);
    if (req.body?.location != null) update.location = String(req.body.location).trim();
    if (req.body?.status != null) update.status = req.body.status;

    const doc = await Venue.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'Venue not found' });
    res.status(200).json(mapVenueOut(doc));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/catalog/venues/:id (Venue Officer)
const deleteVenue = async (req, res) => {
  try {
    const doc = await Venue.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Venue not found' });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/catalog/equipment
const listEquipment = async (req, res) => {
  try {
    const list = await Equipment.find({}).sort({ equipmentName: 1 }).lean();
    res.status(200).json(list.map(mapEquipmentOut));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/catalog/equipment (Venue Officer)
const createEquipment = async (req, res) => {
  try {
    const name = (req.body?.equipmentName != null ? String(req.body.equipmentName) : '').trim();
    if (!name) return res.status(400).json({ message: 'equipmentName is required' });
    const category = (req.body?.category != null ? String(req.body.category) : '').trim();
    const total = toNumberOr(req.body?.total, 0);
    const available = toNumberOr(req.body?.available, total);
    const inUse = toNumberOr(req.body?.inUse, 0);
    const underMaintenance = toNumberOr(req.body?.underMaintenance, 0);
    const status = req.body?.status || 'available';

    const doc = await Equipment.create({
      equipmentName: name,
      category,
      total,
      available,
      inUse,
      underMaintenance,
      status,
    });
    res.status(201).json(mapEquipmentOut(doc));
  } catch (error) {
    if (String(error?.message || '').includes('duplicate key')) {
      return res.status(400).json({ message: 'Resource already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/catalog/equipment/:id (Venue Officer)
const updateEquipment = async (req, res) => {
  try {
    const update = {};
    if (req.body?.equipmentName != null) update.equipmentName = String(req.body.equipmentName).trim();
    if (req.body?.category != null) update.category = String(req.body.category).trim();
    if (req.body?.total != null) update.total = toNumberOr(req.body.total, 0);
    if (req.body?.available != null) update.available = toNumberOr(req.body.available, 0);
    if (req.body?.inUse != null) update.inUse = toNumberOr(req.body.inUse, 0);
    if (req.body?.underMaintenance != null) update.underMaintenance = toNumberOr(req.body.underMaintenance, 0);
    if (req.body?.status != null) update.status = req.body.status;

    const doc = await Equipment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'Resource not found' });
    res.status(200).json(mapEquipmentOut(doc));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/catalog/equipment/:id (Venue Officer)
const deleteEquipment = async (req, res) => {
  try {
    const doc = await Equipment.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Resource not found' });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  listEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};

