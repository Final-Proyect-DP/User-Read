const kafka = require('kafka-node');
const dotenv = require('dotenv');
const { decryptMessage } = require('../services/userService');
const User = require('../models/User');

dotenv.config();

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
const consumer = new kafka.Consumer(
  client,
  [{ topic: process.env.KAFKA_TOPIC_EDIT_USER, partition: 0 }],
  { autoCommit: true }
);

consumer.on('message', async (message) => {
  try {
    const parsedMessage = JSON.parse(message.value);
    const decryptedMessage = decryptMessage(parsedMessage);
    console.log('Received and decrypted message:', decryptedMessage);

    const userData = JSON.parse(decryptedMessage);
    const { _id } = userData;

    if (!_id) {
      throw new Error('ID is missing from the decrypted message');
    }

    await User.findByIdAndUpdate(_id, userData);
    console.log(`User with ID ${_id} updated in MongoDB`);
  } catch (err) {
    console.error('Error processing message:', err);
  }
});

consumer.on('error', (err) => {
  console.error('Consumer error:', err);
});
