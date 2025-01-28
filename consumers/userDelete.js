const kafka = require('kafka-node');
const dotenv = require('dotenv');
const { decryptMessage } = require('../services/userService');
const User = require('../models/User');

dotenv.config();

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
const consumer = new kafka.Consumer(
  client,
  [{ topic: process.env.KAFKA_TOPIC_DELETE_USER, partition: 0 }],
  { autoCommit: true }
);

consumer.on('message', async (message) => {
  try {
    const parsedMessage = JSON.parse(message.value);
    const decryptedMessage = decryptMessage(parsedMessage);
    console.log('Received and decrypted message:', decryptedMessage);

    const { id } = JSON.parse(decryptedMessage);
    await User.findByIdAndDelete(id);
    console.log(`User with ID ${id} deleted from MongoDB`);
  } catch (err) {
    console.error('Error processing message:', err);
  }
});

consumer.on('error', (err) => {
  console.error('Consumer error:', err);
});
