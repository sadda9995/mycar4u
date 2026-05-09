const jwt = require('jsonwebtoken');
const User = require('../models/User');

const parseCookies = (req) => {
    const cookieHeader = req.headers.cookie || '';
    const parsed = {};
    cookieHeader.split(';').map(c => c.trim()).filter(Boolean).forEach(c => {
        const [k, ...v] = c.split('=');
        parsed[decodeURIComponent(k)] = decodeURIComponent(v.join('='));
    });
    return parsed;
};

const SUPER_USER_IDS = ['6982e723cce7dd129661d9d7'];

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        const cookies = parseCookies(req);
        if (cookies.accessToken) token = cookies.accessToken;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-drivingLicense -aadhaar'); // Exclude heavy fields by default
        if (req.user && SUPER_USER_IDS.includes(String(req.user._id))) {
            req.user.role = 'super_admin';
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// roles: array of allowed roles
// scope: optional { city: true, office: true } to enforce matching
exports.authorize = (roles = [], scope = {}) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || (roles.length && !roles.includes(user.role))) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // City scope
        if (scope.city && user.role === 'city_admin') {
            const bodyCity = req.body.cityId || req.body.city || req.body?.location?.cityId || req.body?.location?.city;
            if (bodyCity && user.cityId && bodyCity.toString() !== user.cityId.toString()) {
                return res.status(403).json({ message: 'City scope violation' });
            }
        }

        // Office scope
        if (scope.office && user.role === 'office_staff') {
            const bodyOffice = req.body.officeId;
            if (bodyOffice && user.officeId && bodyOffice.toString() !== user.officeId.toString()) {
                return res.status(403).json({ message: 'Office scope violation' });
            }
        }

        next();
    };
};
