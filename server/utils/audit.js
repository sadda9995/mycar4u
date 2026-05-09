const AuditLog = require('../models/AuditLog');

exports.logAudit = async (req, { action, targetType, targetId, metadata }) => {
    try {
        await AuditLog.create({
            actor: req.user?._id,
            action,
            targetType,
            targetId,
            metadata,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (err) {
        console.error('Audit log failed', err.message);
    }
};
