import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

/**
 * Checks if biometric authentication is available on the device.
 */
export const checkBiometricAvailability = async () => {
  try {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch (error) {
    console.error('Biometric availability check failed:', error);
    return false;
  }
};

/**
 * Performs biometric authentication.
 * @returns {Promise<boolean>} True if authentication succeeded.
 */
export const authenticateWithBiometrics = async () => {
  try {
    await BiometricAuth.authenticate({
      reason: 'Confirm your identity to log in',
      cancelTitle: 'Cancel',
    });
    return true;
  } catch (error) {
    // If user cancels or fails, it throws an error
    console.error('Biometric authentication failed:', error);
    return false;
  }
};
