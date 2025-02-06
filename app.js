require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConfig');
const logger = require('./config/logger');
const swaggerDocs = require('./config/swaggerConfig');
const usersRouter = require('./routes/users');
const userCreateConsumer = require('./consumers/userCreateConsumer');
const userDeleteConsumer = require('./consumers/userDeleteConsumer');
const userEditConsumer = require('./consumers/userEditConsumer');
const authLoginConsumer = require('./consumers/authLoginConsumer');
const userLogoutConsumer = require('./consumers/userLogoutConsumer');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3023;
const corsOptions = {
  origin: '*',
  methods: ['GET'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};


app.use(cors(corsOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/users', usersRouter);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-read' });
});


const startConsumers = async () => {
  try {
    await Promise.all([
      userCreateConsumer.run(),
      userDeleteConsumer.run(),
      userEditConsumer.run(),
      authLoginConsumer.run(),
      userLogoutConsumer.run()
    ]);
    logger.info('All Kafka consumers started successfully');
  } catch (error) {
    logger.error('Error starting Kafka consumers:', error);
    throw error;
  }
};

const startServer = async () => {
  try {
    await connectDB();
    logger.info('Database connection established');
    
    logger.info('Starting Kafka consumers...');
    await startConsumers();
    logger.info('All Kafka consumers started successfully');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running at http://${process.env.HOST}:${PORT}`);
    });
  } catch (error) {
    logger.error('Critical server startup error:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled error:', err);
  process.exit(1);
});

startServer();
