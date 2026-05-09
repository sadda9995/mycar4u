const City = require('../models/City');
const Car = require('../models/Car');

exports.getCities = async (req, res) => {
    try {
        const cities = await City.find().sort({ name: 1 });
        res.status(200).json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createCity = async (req, res) => {
    try {
        let { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        name = name.trim();
        const existing = await City.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (existing) return res.status(400).json({ message: 'City already exists' });
        const city = new City({ name });
        await city.save();
        res.status(201).json(city);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateCity = async (req, res) => {
    try {
        const body = { ...req.body };
        if (body.name) body.name = body.name.trim();

        if (body.name) {
            const dup = await City.findOne({ name: new RegExp(`^${body.name}$`, 'i'), _id: { $ne: req.params.id } });
            if (dup) return res.status(400).json({ message: 'City name already exists' });
        }

        const city = await City.findByIdAndUpdate(req.params.id, body, { new: true });
        if (!city) return res.status(404).json({ message: 'City not found' });
        res.status(200).json(city);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteCity = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        if (!city) return res.status(404).json({ message: 'City not found' });

        const used = await Car.countDocuments({ 'location.city': city.name });
        if (used > 0) return res.status(400).json({ message: 'City in use by cars; deactivate instead of delete' });

        await city.deleteOne();
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
