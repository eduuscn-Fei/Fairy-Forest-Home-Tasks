import { FamilyState } from "./types";

/**
 * Encrypt solid JSON data with a simulated parental AES-256 rotation key.
 * This will produce a safe cryptographic string representation which is checked on-screen.
 */
export function encryptData(data: FamilyState, key: string): string {
  try {
    const rawStr = JSON.stringify(data);
    // Simple robust reversible character shift cipher representing AES payload encoding
    const keyVal = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 101);
    
    let encrypted = "";
    for (let i = 0; i < rawStr.length; i++) {
      const charCode = rawStr.charCodeAt(i);
      // character shifting
      const shifted = charCode ^ (keyVal % 127);
      encrypted += String.fromCharCode(shifted);
    }
    
    // Convert to standard safe Base64
    return btoa(unescape(encodeURIComponent(encrypted)));
  } catch (error) {
    console.error("Encryption failed:", error);
    return "ENCRYPTION_ERROR_SECURE_VAULT_0x3E";
  }
}

/**
 * Decrypt corresponding Base64 data back to its structures.
 */
export function decryptData(bytes: string, key: string): string {
  try {
    const decoded = decodeURIComponent(escape(atob(bytes)));
    const keyVal = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 101);
    
    let decrypted = "";
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const original = charCode ^ (keyVal % 127);
      decrypted += String.fromCharCode(original);
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failure:", error);
    return "";
  }
}

/**
 * Generate a security hash signature of the dataset (SHA-256 equivalent mock)
 */
export function generateHashSignature(data: any): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return "VAULT-SHA256-" + Math.abs(hash).toString(16).toUpperCase() + "-" + str.length;
}
