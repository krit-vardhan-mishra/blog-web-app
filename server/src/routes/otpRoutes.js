import express from 'express';
import { forgotPassword, verifyResetOtp, resetPassword } from '../controllers/otpController.js';
import errorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

// Apply error handler middleware
router.use(errorHandler);

export default router;