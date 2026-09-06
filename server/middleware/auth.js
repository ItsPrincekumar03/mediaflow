const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        req.user = { id: req.session.userId, role: req.session.role };
        return next();
    }
    return res.status(401).json({
        success: false,
        error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required'
        }
    });
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions'
                }
            });
        }
        next();
    };
};

module.exports = { requireAuth, requireRole };
