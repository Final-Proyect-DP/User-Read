const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');

const verifyToken = (req, res, next) => {
  const { token } = req.query;
  const { id } = req.params;

  if (!token || !id) {
    logger.warn('Token o ID faltante en la solicitud');
    return res.status(401).json({ 
      success: false, 
      message: 'Token o ID faltante' 
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
        logger.error(`Error al consultar Redis: ${redisErr.message}`);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al verificar la sesión' 
        });
      }

      if (!reply || reply !== token) {
        logger.warn(`Token inválido o expirado para usuario ${id}`);
        return res.status(401).json({ 
          success: false, 
          message: 'Sesión inválida o expirada' 
        });
      }

      logger.info(`Token verificado para usuario ${id}`);
      req.userId = id; // Opcional: pasar el ID del usuario al siguiente middleware
      next();
    });
  });
};

// Manejador de errores por si algo falla en el proceso
const handleAuthError = (err, req, res, next) => {
  logger.error('Error en autenticación:', err);
  return res.status(500).json({
    success: false,
    message: 'Error en el proceso de autenticación'
  });
};

module.exports = {
  verifyToken,
  handleAuthError
};
