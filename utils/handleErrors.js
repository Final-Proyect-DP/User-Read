const logger = require('../config/logger');

const handleErrors = (error, id = '') => {
  logger.error(`Error in operation ${id ? `for ID ${id}` : ''}:`, error);

  const errorResponses = {
    'Missing Token or ID': {
      status: 401,
      response: {
        success: false,
        message: 'Missing token or ID in request'
      }
    },
    'Invalid JWT': {
      status: 401,
      response: {
        success: false,
        message: 'Invalid JWT token'
      }
    },
    'Redis Error': {
      status: 500,
      response: {
        success: false,
        message: 'Error verifying token in Redis'
      }
    },
    'Invalid token for this user': {
      status: 401,
      response: {
        success: false,
        message: 'Invalid token for this user'
      }
    },
    'Required fields': {
      status: 400,
      response: {
        success: false,
        message: error.message
      }
    },
    'Username already exists': {
      status: 400,
      response: {
        success: false,
        message: 'Username already exists'
      }
    },
    'ValidationError': {
      status: 400,
      response: {
        success: false,
        message: 'Validation error',
        details: error.message
      }
    },
    'User not found': {
      status: 404,
      response: {
        success: false,
        message: 'User not found'
      }
    }
  };

  return errorResponses[error.message] || {
    status: 500,
    response: {
      success: false,
      message: 'Internal server error'
    }
  };
};

module.exports = handleErrors;
