import CryptoJS from "crypto-js";

export const encrypt = ({ data, secretKey = process.env.ENCRYPTION_SECRET }) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};
export const decrypt = ({ encryptedData, secretKey = process.env.ENCRYPTION_SECRET }) => {
  return CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
};
