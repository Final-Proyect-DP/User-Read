const kafka = require('../config/kafkaConfig');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

// Only groupId changed
const consumer = kafka.consumer({ groupId: 'read-service-update-group' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Update Consumer: Connected to Kafka');
    
    // Only topic changed (must exist in .env)
    await consumer.subscribe({ 
      topic: process.env.KAFKA_TOPIC_EDIT_USER,
      fromBeginning: true 
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          const userData = JSON.parse(decryptedMessage);

          // Main change: Update instead of Create
          await User.findByIdAndUpdate(
            userData._id,  // Assumes message includes _id
            userData,      // Updates with all received fields
            { new: true }  // Returns updated document
          );

          logger.info(`User updated: ${userData._id}`);

        } catch (error) {
          logger.error('Error processing message:', error.message);
        }
      },
    });
  } catch (error) {
    logger.error('Error in update consumer:', error);
  }
};

module.exports = { run };