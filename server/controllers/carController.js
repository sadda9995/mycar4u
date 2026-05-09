const Car = require('../models/Car');
const City = require('../models/City');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Create a new car
// @route   POST /api/cars
// @access  Admin
exports.createCar = async (req, res) => {
    try {
        const cityName = req.body?.location?.city;
        if (!cityName) return res.status(400).json({ message: 'City required' });
        const cityDoc = await City.findOne({ name: cityName });
        if (!cityDoc || cityDoc.isActive === false) return res.status(400).json({ message: 'Invalid city' });

        if (req.user?.role === 'city_admin') {
            if (!req.user.cityId || req.user.cityId.toString() !== cityDoc._id.toString()) {
                return res.status(403).json({ message: 'City scope violation' });
            }
        }

        const car = new Car(req.body);
        await car.save();
        res.status(201).json(car);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create car', error: error.message });
    }
};

// @desc    Get all cars (with simple filters)
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
    try {
        // Soft-auth: decode token if present to detect role without blocking public access
        let viewer = null;
        try {
            const auth = req.headers.authorization;
            const bearer = auth && auth.startsWith('Bearer') ? auth.split(' ')[1] : null;
            const cookies = (req.headers.cookie || '').split(';').map(c => c.trim());
            const cookieToken = cookies.find(c => c.startsWith('accessToken='))?.split('=')[1];
            const token = bearer || cookieToken;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                viewer = decoded;
                // If we need fresh scope values, load the user document
                const dbUser = await User.findById(decoded.id).select('role cityId officeId');
                if (dbUser) viewer = { ...viewer, role: dbUser.role, cityId: dbUser.cityId, officeId: dbUser.officeId };
            }
        } catch (_) {
            // Ignore token errors for public access
        }

        const { city, type, fuelType, status, search } = req.query;
        let query = {};

        if (status && status !== 'all') query.status = status;
        if (city) query['location.city'] = city;
        if (type && type !== 'all') query.type = type;
        if (fuelType && fuelType !== 'all') query.fuelType = fuelType;

        if (search) {
            query.$or = [
                { make: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { registrationNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Only include cars in active cities and user scope (except super_admin)
        const activeCities = await City.find({ isActive: { $ne: false } }).select('name _id');
        const activeNames = activeCities.map(c => c.name);

        let scopedCity = city;
        if (viewer?.role === 'city_admin' && viewer.cityId) {
            const cityDoc = activeCities.find(c => c._id.toString() === viewer.cityId.toString());
            scopedCity = cityDoc ? cityDoc.name : null;
        }
        if (viewer?.role === 'office_staff' && viewer.cityId) {
            const cityDoc = activeCities.find(c => c._id.toString() === viewer.cityId.toString());
            scopedCity = cityDoc ? cityDoc.name : null;
        }

        if (viewer?.role === 'super_admin') {
            // No city restriction for super admins
        } else if (scopedCity) {
            if (!activeNames.includes(scopedCity)) return res.status(200).json([]);
            query['location.city'] = scopedCity;
        } else {
            query['location.city'] = { $in: activeNames };
        }

        // Exclude cars in active maintenance window
        const now = new Date();
        query.$and = query.$and || [];
        query.$and.push({
            $or: [
                { maintenanceWindows: { $exists: false } },
                { maintenanceWindows: { $size: 0 } },
                { maintenanceWindows: { $not: { $elemMatch: { start: { $lte: now }, end: { $gte: now } } } } }
            ]
        });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const total = await Car.countDocuments(query);
        const cars = await Car.find(query)
            .sort({ createdAt: -1, _id: 1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            cars,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.status(200).json(car);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Admin
exports.updateCar = async (req, res) => {
    try {
        const carExisting = await Car.findById(req.params.id);
        if (!carExisting) return res.status(404).json({ message: 'Car not found' });

        if (req.user?.role === 'city_admin') {
            const cityName = carExisting.location?.city;
            const userCity = req.user.cityId ? await City.findById(req.user.cityId) : null;
            if (userCity && cityName !== userCity.name) return res.status(403).json({ message: 'City scope violation' });
        }

        const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.status(200).json(car);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update car', error: error.message });
    }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Admin
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        if (req.user?.role === 'city_admin') {
            const cityDoc = await City.findOne({ name: car.location?.city });
            if (!cityDoc || req.user.cityId?.toString() !== cityDoc._id.toString()) {
                return res.status(403).json({ message: 'City scope violation' });
            }
        }
        await car.deleteOne();
        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
