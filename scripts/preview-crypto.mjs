import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'node:crypto';
export const ITERATIONS=600000;
export function deriveKey(password,salt){return pbkdf2Sync(password,salt,ITERATIONS,32,'sha256');}
export function encrypt(bytes,key){
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
  const ciphertext=Buffer.concat([cipher.update(bytes),cipher.final()]);
  return Buffer.concat([iv,ciphertext,cipher.getAuthTag()]);
}
export function decrypt(bytes,key){
  const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));
  decipher.setAuthTag(bytes.subarray(-16));
  return Buffer.concat([decipher.update(bytes.subarray(12,-16)),decipher.final()]);
}
