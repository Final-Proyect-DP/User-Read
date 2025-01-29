require('dotenv').config();
const express = require('express');
const connectDB = require('./config/dbConfig');
const logger = require('./config/logger');
const usersRouter = require('./routes/users');
const userCreateConsumer = require('./consumers/userCreateConsumer');
const userDeleteConsumer = require('./consumers/userDeleteConsumer');
const userEditConsumer = require('./consumers/userEditConsumer');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3023;

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Usuarios - Servicio de Lectura',
      version: '1.0.0',
      description: 'API para la gestión de usuarios - Microservicio de lectura'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: 'Servidor de desarrollo'
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
      userEditConsumer.run()  // Agregar el nuevo consumidor
    ]);

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  logger.error('Error no controlado:', err);
  process.exit(1);
});
