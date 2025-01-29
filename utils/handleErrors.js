const logger = require('../config/logger');

const handleErrors = (error, id = '') => {
  logger.error(`Error en la operación ${id ? `para ID ${id}` : ''}:`, error);

  const errorResponses = {
    'Token o ID faltante': {
      status: 401,
      response: {
        success: false,
        message: 'Token o ID faltante en la solicitud'
      }
    },
    'JWT inválido': {
      status: 401,
      response: {
        success: false,
        message: 'Token JWT no válido'
      }
    },
    'Error en Redis': {
      status: 500,
      response: {
        success: false,
        message: 'Error al verificar el token en Redis'
      }
    },
    'Token no válido para este usuario': {
      status: 401,
      response: {
        success: false,
        message: 'Token no válido para este usuario'
      }
    },
    'Campos requeridos': {
      status: 400,
      response: {
        success: false,
        message: error.message
      }
    },
    'El nombre de usuario ya existe': {
      status: 400,
      response: {
        success: false,
        message: 'El nombre de usuario ya existe'
      }
    },
    'ValidationError': {
      status: 400,
      response: {
        success: false,
        message: 'Error de validación',
        details: error.message
      }
    },
    'User not found': {
      status: 404,
      response: {
        success: false,
        message: 'Usuario no encontrado'
      }
    }
  };

  return errorResponses[error.message] || {
    status: 500,
    response: {
      success: false,
      message: 'Error interno del servidor'
    }
  };
};

module.exports = handleErrors;
