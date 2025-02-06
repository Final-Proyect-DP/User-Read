const kafka = require('../config/kafkaConfig');
const { decryptMessage } = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'User-Read-Delete-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_DELETE, fromBeginning: true });
    logger.info(`Delete Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_DELETE}`);

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = decryptMessage(encryptedMessage);
          const { id } = JSON.parse(decryptedMessage);

          const user = await User.findByIdAndDelete(id);
          logger.info(user ? `User deleted: ${id}` : `User not found: ${id}`);
        } catch (error) {
          logger.error('Delete processing error:', error);
        }
      }
    });
  } catch (error) {
    logger.error('Delete consumer startup error:', error);
    throw error;
  }
};

module.exports = { run };
