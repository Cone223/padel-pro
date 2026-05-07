const Court = require('../models/Court');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/courts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `court-${Date.now()}-${Math.random().toString(36).substr(2,6)}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Solo se permiten imágenes.'), false);
}});
exports.uploadImages = upload.array('images', 5);

exports.getAllCourts = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, type, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (type) filter.courtType = type;
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }
    const skip = (page - 1) * limit;
    const [courts, total] = await Promise.all([
      Court.find(filter).populate('owner', 'name').sort('-createdAt').skip(skip).limit(Number(limit)),
      Court.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: { courts, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).populate('owner', 'name email phone');
    if (!court) return res.status(404).json({ status: 'error', message: 'Cancha no encontrada.' });
    res.json({ status: 'success', data: { court } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createCourt = async (req, res) => {
  try {
    const data = { ...req.body, owner: req.user.id };
    if (req.files?.length) {
      data.images = req.files.map(f => `/uploads/courts/${f.filename}`);
    }
    if (req.user.role === 'admin') data.isActive = true;
    const court = await Court.create(data);
    res.status(201).json({ status: 'success', data: { court } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ status: 'error', message: 'Cancha no encontrada.' });
    if (court.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'No tenés permiso para editar esta cancha.' });
    }
    const data = { ...req.body };
    if (req.files?.length) {
      data.images = [...(court.images || []), ...req.files.map(f => `/uploads/courts/${f.filename}`)];
    }
    const updated = await Court.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ status: 'success', data: { court: updated } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.deleteCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ status: 'error', message: 'Cancha no encontrada.' });
    if (court.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'No tenés permiso para eliminar esta cancha.' });
    }
    await Court.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Cancha eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getMyCourts = async (req, res) => {
  try {
    const courts = await Court.find({ owner: req.user.id }).sort('-createdAt');
    res.json({ status: 'success', data: { courts } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
