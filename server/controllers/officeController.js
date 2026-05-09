const Office = require('../models/Office');
const City = require('../models/City');

exports.getOffices = async (req, res) => {
    try {
        let query = {};
        if (req.user?.role === 'city_admin' && req.user.cityId) {
            query.cityId = req.user.cityId;
        }
        const offices = await Office.find(query).populate('cityId', 'name').sort({ name: 1 });
        res.status(200).json(offices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createOffice = async (req, res) => {
    try {
        const { name, cityId } = req.body;
        if (!name || !cityId) return res.status(400).json({ message: 'Name and city required' });
        const city = await City.findById(cityId);
        if (!city || city.isActive === false) return res.status(400).json({ message: 'Invalid city' });
        const office = new Office({ name: name.trim(), cityId });
        await office.save();
        res.status(201).json(office);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateOffice = async (req, res) => {
    try {
        const office = await Office.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!office) return res.status(404).json({ message: 'Office not found' });
        res.status(200).json(office);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteOffice = async (req, res) => {
    try {
        await Office.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
