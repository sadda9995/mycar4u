const User = require('../models/User');
const { logAudit } = require('../utils/audit');
const { sendEmail } = require('../utils/notifier');
const { welcomeTemplate } = require('../utils/emailTemplates');

exports.getAllUsers = async (req, res) => {
    try {
        let query = {};
        if (req.user?.role === 'city_admin' && req.user.cityId) {
            query.cityId = req.user.cityId;
        }
        if (req.user?.role === 'office_staff' && req.user.officeId) {
            query.officeId = req.user.officeId;
        }

        const users = await User.find(query)
            .select('-password')
            .populate('cityId', 'name')
            .populate('officeId', 'name');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin: create user/staff
exports.createUser = async (req, res) => {
    try {
        const { name, mobile, email, role = 'user', isVerified = false, cityId, officeId } = req.body;
        if (!mobile && !email) return res.status(400).json({ message: 'Mobile or email required' });

        if (mobile) {
            const existingMobile = await User.findOne({ mobile });
            if (existingMobile) return res.status(400).json({ message: 'User already exists with this mobile' });
        }
        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = new User({ name, mobile, email, role, isVerified, cityId, officeId });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin: update user fields (verify/role)
exports.updateUser = async (req, res) => {
    try {
        const allowed = ['name', 'email', 'role', 'isVerified', 'walletBalance', 'cityId', 'officeId'];
        const updates = {};
        Object.keys(req.body || {}).forEach(key => {
            if (allowed.includes(key)) updates[key] = req.body[key];
        });

        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: 'User not found' });

        // Only super_admin can change role; city_admin can only edit within their city
        if (updates.role && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Only super admin can change roles' });
        }
        if (req.user.role === 'city_admin' && req.user.cityId) {
            if (target.cityId?.toString() !== req.user.cityId.toString()) {
                return res.status(403).json({ message: 'City scope violation' });
            }
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        await logAudit(req, { action: 'user_updated', targetType: 'user', targetId: user._id, metadata: updates });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Self-update (name/mobile) after OTP
exports.updateMe = async (req, res) => {
    try {
        const allowed = ['name', 'mobile', 'email'];
        const updates = {};
        Object.keys(req.body || {}).forEach(key => {
            if (allowed.includes(key)) updates[key] = req.body[key];
        });

        const user = await User.findById(req.user._id);
        const wasProfileComplete = !!(user.name && user.mobile);
        
        const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        const isProfileCompleteNow = !!(updatedUser.name && updatedUser.mobile);

        // Send Welcome Email if profile just completed
        if (!wasProfileComplete && isProfileCompleteNow && updatedUser.email) {
            sendEmail({
                to: updatedUser.email,
                subject: `Welcome to Mycar4u, ${updatedUser.name}!`,
                html: welcomeTemplate(updatedUser.name),
                templateName: 'welcome_email'
            }).catch(e => console.error('Failed to send welcome email:', e.message));
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
