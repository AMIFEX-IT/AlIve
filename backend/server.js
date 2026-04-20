const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory store for OTPs (Use Redis or a Database in production)
// Key: phoneNumber, Value: { otp: string, expiresAt: number }
const otpStore = new Map();

// Initialize Twilio Client
// Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in .env
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Route: POST /auth/send-otp
 * Body: { phoneNumber: string, role: string }
 */
app.post('/auth/send-otp', async (req, res) => {
  const { phoneNumber, role } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiration time (5 minutes from now)
  const expiresAt = Date.now() + 5 * 60 * 1000;

  // Store the OTP
  otpStore.set(phoneNumber, { otp, expiresAt });

  console.log(`[DEV LOG] Generated OTP for ${phoneNumber}: ${otp}`);

  try {
    // Attempt to send via Twilio
    await client.messages.create({
      body: `Your AlIve verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`[SUCCESS] SMS sent to ${phoneNumber}`);
    return res.json({ success: true, message: 'Verification code sent' });

  } catch (error) {
    console.error('[ERROR] Twilio send failed:', error.message);
    
    // Detailed error for debugging (simplify this for production)
    return res.status(500).json({ 
      message: 'Failed to send SMS. Please verify your number is correct and try again.',
      details: error.message 
    });
  }
});

/**
 * Route: POST /auth/verify-otp
 * Body: { phoneNumber: string, code: string }
 */
app.post('/auth/verify-otp', (req, res) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ message: 'Phone number and code are required' });
  }

  const record = otpStore.get(phoneNumber);

  // Check if record exists
  if (!record) {
    return res.status(400).json({ message: 'No OTP request found for this number. Please request a new code.' });
  }

  // Check expiration
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phoneNumber);
    return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
  }

  // Check code match
  if (record.otp === code) {
    otpStore.delete(phoneNumber); // Clear OTP to prevent replay attacks
    
    // In a real app, you would generate a JWT token here
    return res.json({ 
      success: true, 
      message: 'Authentication successful',
      user: { phoneNumber, verified: true }
    });
  } else {
    return res.status(400).json({ message: 'Invalid verification code' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`
  🚀 Backend server running at http://localhost:${port}
  
  Make sure you have your .env file configured with:
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_PHONE_NUMBER
  `);
});