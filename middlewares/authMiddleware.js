const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');
const handleErrors = require('../utils/handleErrors');

const verifyToken = (req, res, next) => {
  const { token } = req.query;
  const { id } = req.params;

  try {
    if (!token || !id) {
      throw new Error('Token o ID faltante');
    }

    jwt.verify(token, process.env.JWT_SECRET, (jwtErr, decoded) => {
      if (jwtErr) {
        throw new Error('JWT inválido');
      }

      redisClient.get(id, (redisErr, reply) => {
        if (redisErr) {
          throw new Error('Error en Redis');
        }

        if (reply !== token) {
          throw new Error('Token no válido para este usuario');
        }

        logger.info(`Token verificado para usuario ${id}`);
        next();
      });
    });
  } catch (error) {
    const { status, response } = handleErrors(error, id);
    res.status(status).json(response);
  }
};

module.exports = {
  verifyToken
};
