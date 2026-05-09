const AuditLog = require('../models/AuditLog');
const { Parser } = require('json2csv');

exports.getAuditLogs = async (req, res) => {
    try {
        const { action, actor, start, end, format = 'json', limit = 200 } = req.query;
        const query = {};
        if (action) query.action = action;
        if (actor) query.actor = actor;
        if (start || end) {
            query.createdAt = {};
            if (start) query.createdAt.$gte = new Date(start);
            if (end) query.createdAt.$lte = new Date(end);
        }

        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .limit(Math.min(Number(limit) || 200, 1000))
            .populate('actor', 'name email mobile role');

        if (format === 'csv') {
            const parser = new Parser({
                fields: ['createdAt', 'action', 'actor.name', 'actor.email', 'actor.role', 'targetType', 'targetId', 'ip']
            });
            const csv = parser.parse(logs);
            res.header('Content-Type', 'text/csv');
            return res.send(csv);
        }

        res.status(200).json(logs);
    } catch (error) {
        console.error('Audit fetch failed', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
