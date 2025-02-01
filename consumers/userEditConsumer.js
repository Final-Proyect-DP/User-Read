const kafka = require('../config/kafkaConfig');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/User');  // Cambiado de '../models/user' a '../models/User'
const logger = require('../config/logger');
require('dotenv').config();

// Cambiado solo el groupId
const consumer = kafka.consumer({ groupId: 'read-service-update-group' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Update Consumer: Conectado a Kafka');
    
    // Cambiado solo el topic (debe existir en .env)
    await consumer.subscribe({ 
      topic: process.env.KAFKA_TOPIC_EDIT_USER, // Nuevo nombre de variable
      fromBeginning: true 
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          const userData = JSON.parse(decryptedMessage);

          // Cambio principal: Update en lugar de Create
          await User.findByIdAndUpdate(
            userData._id,  // Asume que el mensaje incluye el _id
            userData,      // Actualiza con todos los campos recibidos
            { new: true }  // Retorna el documento actualizado
          );

          logger.info(`Usuario actualizado: ${userData._id}`);

        } catch (error) {
          logger.error('Error procesando mensaje:', error.message);
        }
      },
    });
  } catch (error) {
    logger.error('Error en consumer de actualización:', error);
  }
};

module.exports = { run };