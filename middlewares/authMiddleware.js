const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');

const verifyToken = (req, res, next) => {
  const { token } = req.query;
  const { id } = req.params;

  if (!token || !id) {
    logger.warn('Missing token or ID in request');
    return res.status(401).json({ 
      success: false, 
      message: 'Missing token or ID' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (jwtErr, decoded) => {
    if (jwtErr) {
      logger.error(`Error al verificar JWT: ${jwtErr.message}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Token JWT no válido' 
      });
    }

    redisClient.get(id, (redisErr, reply) => {
      if (redisErr) {
        logger.error(`Error querying Redis: ${redisErr.message}`);
        return res.status(500).json({ 
          success: false, 
          message: 'Error verifying session' 
        });
      }

      if (!reply || reply !== token) {
        logger.warn(`Invalid or expired token for user ${id}`);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired session' 
        });
      }

      logger.info(`Token verified for user ${id}`);
      req.userId = id; // Opcional: pasar el ID del usuario al siguiente middleware
      next();
    });
  });
};

// Manejador de errores por si algo falla en el proceso
const handleAuthError = (err, req, res, next) => {
  logger.error('Authentication error:', err);
  return res.status(500).json({
    success: false,
    message: 'Error in authentication process'
  });
};

module.exports = {
  verifyToken,
  handleAuthError
};
