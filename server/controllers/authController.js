const User = require('../models/User');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, sendSms } = require('../utils/notifier');
const { otpTemplate, inviteTemplate, passwordResetTemplate, securityAlertTemplate } = require('../utils/emailTemplates');
const { logAudit } = require('../utils/audit');

// ... existing code ...
const ACCESS_TTL = 15 * 60; // seconds
const REFRESH_TTL = 30 * 24 * 60 * 60; // seconds
const SUPER_USER_IDS = ['6982e723cce7dd129661d9d7']; // Force these users to super_admin scope

const effectiveRole = (user) => SUPER_USER_IDS.includes(String(user._id)) ? 'super_admin' : user.role;

const signTokens = (user) => {
    const payload = {
        id: user._id,
        role: effectiveRole(user),
        email: user.email,
        cityId: user.cityId,
        officeId: user.officeId
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: REFRESH_TTL });
    return { accessToken, refreshToken };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: ACCESS_TTL * 1000
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: REFRESH_TTL * 1000
    });
};

exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check for user
        const user = await User.findOne({ username }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            user.role = effectiveRole(user);
            if (user.role !== 'admin' && user.role !== 'super_admin') {
                await logAudit(req, { action: 'login_denied', targetType: 'user', targetId: user._id, metadata: { reason: 'role' } });
                return res.status(403).json({ message: 'Access denied. Admin only.' });
            }
            if (user.role === 'admin') user.role = 'super_admin';

            // Generate Token
            const { accessToken, refreshToken } = signTokens(user);
            setAuthCookies(res, accessToken, refreshToken);

            await logAudit(req, { action: 'login_success', targetType: 'user', targetId: user._id });
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: accessToken
            });
        } else {
            await logAudit(req, { action: 'login_failed', targetType: 'user', targetId: user?._id || username, metadata: { mode: 'admin' } });
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// In-memory store for OTPs (For MVP only. Use Redis in production)
const otpStore = {};
const otpAttempts = {};
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RATE_LIMIT = 5; // max sends per mobile per hour
const OTP_ATTEMPT_LIMIT = 5;
const OTP_WINDOW_MS = 60 * 60 * 1000; // 1 hour window for rate limit

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        const now = Date.now();
        otpAttempts[email] = otpAttempts[email] || [];
        otpAttempts[email] = otpAttempts[email].filter(ts => now - ts < OTP_WINDOW_MS);
        if (otpAttempts[email].length >= OTP_RATE_LIMIT) {
            return res.status(429).json({ message: 'Too many OTP requests. Try again later.' });
        }

        // Generate OTP
        const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        // Store OTP with expiry
        otpStore[email] = { otp, expires: now + OTP_TTL_MS };
        otpAttempts[email].push(now);

        // Send Email
        await sendEmail({ 
            to: email, 
            subject: 'Your Mycar4u OTP', 
            text: `Your Mycar4u login OTP is ${otp}`,
            html: otpTemplate(otp),
            templateName: 'login_otp'
        });
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

        const record = otpStore[email];
        if (!record || record.expires < Date.now()) {
            delete otpStore[email];
            return res.status(400).json({ message: 'OTP expired or not found' });
        }

        otpAttempts[email] = otpAttempts[email] || [];
        otpAttempts[email] = otpAttempts[email].filter(ts => Date.now() - ts < OTP_WINDOW_MS);
        if (otpAttempts[email].length > OTP_ATTEMPT_LIMIT) {
            return res.status(429).json({ message: 'Too many attempts. Try again later.' });
        }

        if (record.otp === otp) {
            delete otpStore[email]; // Clear OTP

            // Find or Create User
            let user = await User.findOne({ email });
            let isNewUser = false;

            if (!user) {
                user = new User({ email });
                await user.save();
                isNewUser = true;
            }

            const { accessToken, refreshToken } = signTokens(user);
            setAuthCookies(res, accessToken, refreshToken);

            // Security Alert (Async)
            const device = req.headers['user-agent'] || 'Unknown Device';
            const location = 'India'; // In a real app, use GeoIP
            const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            sendEmail({
                to: email,
                subject: 'Security Alert: New Login Detected',
                html: securityAlertTemplate({ device, location, time }),
                templateName: 'security_alert'
            }).catch(e => console.error('Failed to send security alert:', e.message));

            res.status(200).json({
                message: 'Login successful',
                token: accessToken,
                user,
                isNewUser
            });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const cookies = req.headers.cookie || '';
        const parsed = Object.fromEntries(
            cookies.split(';').map(c => c.trim()).filter(Boolean).map(c => {
                const [k, ...v] = c.split('=');
                return [decodeURIComponent(k), decodeURIComponent(v.join('='))];
            })
        );
        const token = parsed.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });

        const { accessToken, refreshToken } = signTokens(user);
        setAuthCookies(res, accessToken, refreshToken);
        res.status(200).json({ token: accessToken });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out' });
};

// --------- Invitations & Staff Login ----------
const STAFF_ROLES = ['super_admin', 'city_admin', 'office_staff'];

const hashPassword = async (plain) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
};

const buildInviteMessage = ({ name, activationLink, role }) => {
    const subject = `You have been invited as ${role.replace('_', ' ')} - Mycar4u Admin`;
    const text = `Hi ${name || 'there'},\n\nYou have been invited as ${role} on the Mycar4u admin console.\n\nActivate your account using this secure link (valid for 24 hours):\n${activationLink}\n\nIf you did not expect this, ignore the message.\n\nThanks,\nMycar4u Team`;
    const sms = `Mycar4u admin invite for ${role}. Activate: ${activationLink}`;
    return { subject, text, sms };
};

exports.inviteStaff = async (req, res) => {
    try {
        const { name, email, mobile, role, cityId, officeId } = req.body;
        if (!email || !role) return res.status(400).json({ message: 'Email and role required' });
        if (!STAFF_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });

        // city_admin can only invite city_admin or office_staff within their city
        if (req.user.role === 'city_admin') {
            if (role === 'super_admin') return res.status(403).json({ message: 'City admin cannot invite super admin' });
            if (cityId && req.user.cityId && cityId.toString() !== req.user.cityId.toString()) {
                return res.status(403).json({ message: 'City scope violation' });
            }
        }

        const token = crypto.randomBytes(24).toString('hex');
        const expires = Date.now() + 24 * 60 * 60 * 1000;

        let user = await User.findOne({ email });
        if (!user) user = new User({ email });

        user.name = name || user.name;
        user.mobile = mobile || user.mobile;
        user.role = role;
        user.cityId = cityId || user.cityId;
        user.officeId = officeId || user.officeId;
        user.activationToken = token;
        user.activationExpires = expires;
        user.isVerified = true;

        await user.save();

        const activationLink = `${process.env.APP_ADMIN_URL || 'http://localhost:3001'}/login?activate=${token}`;
        const templates = buildInviteMessage({ name: user.name, activationLink, role });
        
        await sendEmail({ 
            to: user.email, 
            subject: templates.subject, 
            text: templates.text, 
            html: inviteTemplate({ name: user.name, role, activationLink }),
            templateName: 'staff_invite'
        });
        if (user.mobile) await sendSms({ to: user.mobile, message: templates.sms });
        await logAudit(req, { action: 'staff_invited', targetType: 'user', targetId: user._id, metadata: { role, cityId: user.cityId, officeId: user.officeId } });
        res.status(200).json({ message: 'Invite created', activationLink, token, templates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.activateStaff = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Token and password required' });

        const user = await User.findOne({ activationToken: token, activationExpires: { $gt: Date.now() } }).select('+password');
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password = await hashPassword(password);
        user.activationToken = undefined;
        user.activationExpires = undefined;
        await user.save();

        await logAudit(req, { action: 'staff_activated', targetType: 'user', targetId: user._id });
        const { accessToken, refreshToken } = signTokens(user);
        setAuthCookies(res, accessToken, refreshToken);
        res.status(200).json({ message: 'Account activated', token: accessToken, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.loginStaff = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !STAFF_ROLES.includes(user.role)) {
            await logAudit(req, { action: 'login_failed', targetType: 'user', targetId: email, metadata: { mode: 'staff', reason: 'not-found' } });
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        user.role = effectiveRole(user);
        if (!user.password) {
            await logAudit(req, { action: 'login_failed', targetType: 'user', targetId: user._id, metadata: { mode: 'staff', reason: 'not-activated' } });
            return res.status(400).json({ message: 'Account not activated. Use activation link.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            await logAudit(req, { action: 'login_failed', targetType: 'user', targetId: user._id, metadata: { mode: 'staff', reason: 'password' } });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await user.populate('cityId', 'name');
        await user.populate('officeId', 'name');

        const { accessToken, refreshToken } = signTokens(user);
        setAuthCookies(res, accessToken, refreshToken);
        await logAudit(req, { action: 'login_success', targetType: 'user', targetId: user._id, metadata: { mode: 'staff' } });
        res.json({ token: accessToken, user });
    } catch (error) {
        await logAudit(req, { action: 'login_failed', targetType: 'user', targetId: email, metadata: { mode: 'staff', error: error.message } });
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.staffForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });
        const user = await User.findOne({ email });
        if (!user || !STAFF_ROLES.includes(user.role)) return res.status(404).json({ message: 'Staff not found' });

        const token = crypto.randomBytes(24).toString('hex');
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
        await user.save();

        const resetLink = `${process.env.APP_ADMIN_URL || 'http://localhost:3001'}/login?reset=${token}`;
        const templates = {
            subject: 'Reset your admin password',
            text: `Reset your Mycar4u admin password using this link (valid 60 minutes): ${resetLink}`,
            sms: `Reset admin password: ${resetLink}`
        };

        await sendEmail({ 
            to: email, 
            subject: templates.subject, 
            text: templates.text, 
            html: passwordResetTemplate({ resetLink }),
            templateName: 'password_reset'
        });
        if (user.mobile) await sendSms({ to: user.mobile, message: templates.sms });
        await logAudit(req, { action: 'password_reset_requested', targetType: 'user', targetId: user._id });
        res.status(200).json({ message: 'Reset link generated', resetLink, token, templates });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.staffResetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Token and password required' });

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+password');

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password = await hashPassword(password);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        await logAudit(req, { action: 'password_reset', targetType: 'user', targetId: user._id });
        const { accessToken, refreshToken } = signTokens(user);
        setAuthCookies(res, accessToken, refreshToken);
        res.status(200).json({ message: 'Password reset', token: accessToken, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
