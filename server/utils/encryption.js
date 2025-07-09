import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

export const encrypt = (text) => {
  if (!text) return '';
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fallback to unencrypted if encryption fails
  }
};

export const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Fallback to encrypted text if decryption fails
  }
};