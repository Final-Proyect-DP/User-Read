require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConfig');
const logger = require('./config/logger');
const usersRouter = require('./routes/users');
const userCreateConsumer = require('./consumers/userCreateConsumer');
const userDeleteConsumer = require('./consumers/userDeleteConsumer');
const userEditConsumer = require('./consumers/userEditConsumer');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const authLoginConsumer = require('./consumers/authLoginConsumer');
const userLogoutConsumer = require('./consumers/userLogoutConsumer');

const app = express();
const PORT = process.env.PORT || 3023;

// Configuración y uso de CORS
const corsOptions = {
  origin: '*',  // Permite todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Users API - Read Service',
      version: '1.0.0',
      description: 'API for user management - Read Microservice'
    },
    servers: [
      {
        url: `http://3.89.9.17:${process.env.PORT}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./routes/*.js'] // Ruta a los archivos con anotaciones
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware para Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Eliminar el middleware innecesario de Redis

app.use('/api/users', usersRouter);

// Inicialización única del servidor
const startServer = async () => {
  try {
    await connectDB();
    await Promise.all([
      userCreateConsumer.run(),
      userDeleteConsumer.run(),
      userEditConsumer.run(),
      authLoginConsumer.run(),
      userLogoutConsumer.run()
    ]);

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running at http://3.89.9.17:${PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled error:', err);
  process.exit(1);
});
