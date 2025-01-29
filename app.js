require('dotenv').config();
const express = require('express');
const connectDB = require('./config/dbConfig');
const logger = require('./config/logger');
const usersRouter = require('./routes/users');
const userCreateConsumer = require('./consumers/userCreateConsumer');
const userDeleteConsumer = require('./consumers/userDeleteConsumer');
const userEditConsumer = require('./consumers/userEditConsumer');

const app = express();
const PORT = process.env.PORT || 3023;

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
