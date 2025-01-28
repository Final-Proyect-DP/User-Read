const crypto = require('crypto');
// const User = require('../models/User'); // Esta línea no es necesaria

const decryptMessage = (encryptedMessage) => {
  const { iv, encryptedData } = encryptedMessage;
  if (!iv || !encryptedData) {
    throw new Error('Invalid encrypted message format');
  }
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = {
  decryptMessage,
};