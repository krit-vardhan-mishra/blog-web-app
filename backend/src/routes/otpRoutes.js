import express from 'express';
import { forgotPassword, verifyResetOtp, resetPassword } from '../controllers/otpController.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

export default router;