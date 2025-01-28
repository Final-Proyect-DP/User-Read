const kafka = require('kafka-node');
const dotenv = require('dotenv');
const { decryptMessage } = require('../services/userService');
const User = require('../models/User');

dotenv.config();

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
const consumer = new kafka.Consumer(
  client,
  [{ topic: process.env.KAFKA_TOPIC_CREATE_USER, partition: 0 }],
  { autoCommit: true }
);

consumer.on('message', async (message) => {
  try {
    const parsedMessage = JSON.parse(message.value);
    const decryptedMessage = decryptMessage(parsedMessage);
    console.log('Received and decrypted message:', decryptedMessage);

    const userData = JSON.parse(decryptedMessage);
    const user = new User(userData); 
    await user.save();
    console.log('User saved to MongoDB');
  } catch (err) {
    console.error('Error processing message:', err);
  }
});

consumer.on('error', (err) => {
  console.error('Consumer error:', err);
});
