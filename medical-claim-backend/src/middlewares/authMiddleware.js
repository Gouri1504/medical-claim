const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            logger.info('Token received:', token);
        }

        if (!token) {
            logger.error('No token provided');
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        try {
            logger.info('Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'No secret found');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            logger.info('Token decoded:', decoded);
            
            const user = await User.findById(decoded.id).select('-password');
            logger.info('User found:', user ? 'Yes' : 'No');
            
            if (!user) {
                logger.error('User not found for token');
                return res.status(401).json({ message: 'User not found' });
            }
            
            req.user = user;
            next();
        } catch (error) {
            logger.error(`JWT Verification Error: ${error.message}`);
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }
    } catch (error) {
        logger.error(`Auth Middleware Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        logger.info('Checking authorization for roles:', roles);
        logger.info('User role:', req.user?.role);
        
        if (!roles.includes(req.user.role)) {
            logger.error(`User role ${req.user.role} is not authorized`);
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize
}; 