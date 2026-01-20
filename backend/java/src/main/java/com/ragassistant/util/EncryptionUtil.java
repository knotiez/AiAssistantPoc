package com.ragassistant.util;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256 암호화 유틸리티
 * 
 * API 키를 안전하게 암호화하여 DB에 저장
 * 암호화 키는 .env 파일에서 관리
 */
public class EncryptionUtil {
    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String KEY_ALGORITHM = "AES";
    private static final int IV_SIZE = 16; // 128 bits

    /**
     * 문자열 암호화
     * 
     * @param plainText     평문
     * @param encryptionKey 암호화 키 (32바이트)
     * @return Base64(IV + 암호문)
     */
    public static String encrypt(String plainText, String encryptionKey) throws Exception {
        if (plainText == null || plainText.isEmpty()) {
            return null;
        }

        // IV 생성
        byte[] iv = new byte[IV_SIZE];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // 암호화
        SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(), KEY_ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
        byte[] encrypted = cipher.doFinal(plainText.getBytes());

        // IV + 암호문 결합
        byte[] combined = new byte[IV_SIZE + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, IV_SIZE);
        System.arraycopy(encrypted, 0, combined, IV_SIZE, encrypted.length);

        return Base64.getEncoder().encodeToString(combined);
    }

    /**
     * 문자열 복호화
     * 
     * @param encryptedText Base64(IV + 암호문)
     * @param encryptionKey 암호화 키 (32바이트)
     * @return 평문
     */
    public static String decrypt(String encryptedText, String encryptionKey) throws Exception {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return null;
        }

        // Base64 디코딩
        byte[] combined = Base64.getDecoder().decode(encryptedText);

        // IV 추출
        byte[] iv = new byte[IV_SIZE];
        System.arraycopy(combined, 0, iv, 0, IV_SIZE);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // 암호문 추출
        byte[] encrypted = new byte[combined.length - IV_SIZE];
        System.arraycopy(combined, IV_SIZE, encrypted, 0, encrypted.length);

        // 복호화
        SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(), KEY_ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
        byte[] decrypted = cipher.doFinal(encrypted);

        return new String(decrypted);
    }
}
