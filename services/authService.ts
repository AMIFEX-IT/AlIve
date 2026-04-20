export const authService = {
  /**
   * Simulates sending an OTP. 
   * In Demo mode, this logs the OTP to the console and stores it in sessionStorage.
   */
  sendOtp: async (phoneNumber: string, role: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store for verification
    sessionStorage.setItem(`otp_${phoneNumber}`, demoOtp);
    
    console.log(`%c[Demo Auth] OTP for ${phoneNumber}: ${demoOtp}`, 'color: #00bcd4; font-size: 16px; font-weight: bold;');
    
    return {
      success: true,
      message: 'OTP sent successfully',
      demoCode: demoOtp // Returning this to display in UI for easier demoing
    };
  },

  /**
   * Verifies the OTP against the stored demo value.
   */
  verifyOtp: async (phoneNumber: string, code: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const storedOtp = sessionStorage.getItem(`otp_${phoneNumber}`);

    // Allow '123456' as a master code for even easier testing
    if (code === storedOtp || code === '123456') {
      sessionStorage.removeItem(`otp_${phoneNumber}`);
      return {
        success: true,
        message: 'Authentication successful',
        user: { phoneNumber, role: 'demo_user', verified: true }
      };
    } else {
      throw new Error('Invalid verification code');
    }
  }
};