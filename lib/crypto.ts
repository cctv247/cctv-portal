import CryptoJS from 'crypto-js';

// 🔑 SECRET KEY: .env.local se uthayega, fallback sirf safety ke liye hai
const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_KEY || 'MODERN_ENT_2026_SECURE';

/**
 * 🔒 ENCRYPT DATA
 * Plain text ko AES-256 encrypted string mein badalta hai
 */
export const encryptData = (text: string): string => {
  if (!text) return '';
  
  // 🛡️ Tajarba Check: Agar data pehle se encrypted hai (U2Fsd se shuru hota hai), 
  // toh dobara mat karo warna data kharab ho jayega.
  if (typeof text === 'string' && text.startsWith('U2Fsd')) {
    return text;
  }
  
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (err) {
    console.error("Encryption Error:", err);
    return text;
  }
};

/**
 * 🔓 DECRYPT DATA
 * Encrypted "Kachre" ko wapas asli text banata hai.
 * Malformed UTF-8 error se bachne ke liye checks lagaye gaye hain.
 */
export const decryptData = (ciphertext: string): string => {
  // 1. Khali data check
  if (!ciphertext) return '';

  // 2. 🛡️ Sabse Zaroori Check: 
  // Agar string 'U2Fsd' se shuru nahi hoti, iska matlab ye encrypted nahi hai.
  // Ise bina touch kiye wapas bhej do (Malformed UTF-8 error yahi se bachta hai).
  if (typeof ciphertext !== 'string' || !ciphertext.startsWith('U2Fsd')) {
    return ciphertext;
  }

  try {
    // 3. Decrypt karne ki koshish karein
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    
    // 4. Bytes ko UTF-8 string mein badlein
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    // 5. Agar decryption fail hui (Galat key ya corrupt data)
    if (!originalText || originalText.length === 0) {
      console.warn("Decryption failed: Possibly wrong key or corrupted data.");
      return ciphertext; // Original encrypted string dikha do bajaye crash hone ke
    }

    return originalText;
  } catch (err) {
    // 6. Kisi bhi wajah se crash ho toh 'Protected' dikhayein ya original data
    console.error("Malformed or Invalid Data during decryption:", err);
    return ciphertext; 
  }
};