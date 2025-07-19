import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { passwordResetService } from '../api/authService';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const VerifyOTPPage = () => {
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpStatus, setOtpStatus] = useState('idle');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const CORRECT_OTP = '123456';

  useEffect(() => {
    document.title = 'Verify Code - Blog App';

    if (!email) {
      navigate('/forgot-password');
      return;
    }

    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpStatus === 'locked' && lockoutTimer === 0) {
      setOtpStatus('idle');
      setAttemptsLeft(3);
      setError('');
    }
  }, [email, navigate, resendTimer, lockoutTimer, otpStatus]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;

    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);

    if (otpStatus !== 'idle' && otpStatus !== 'locked') {
      setOtpStatus('idle');
      setError('');
    }

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    const fullOtp = newOtpInputs.join('');
    if (fullOtp.length === 6) {
      handleFullOtpEntered(fullOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
    if (e.key === 'Backspace' && index === 0 && !otpInputs[0]) {
      setOtpStatus('idle');
      setError('');
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    const newOtpInputs = [...otpInputs];
    for (let i = 0; i < 6; i++) {
      newOtpInputs[i] = pastedData[i] || '';
    }
    setOtpInputs(newOtpInputs);

    if (otpStatus !== 'idle' && otpStatus !== 'locked') {
      setOtpStatus('idle');
      setError('');
    }

    const fullOtp = newOtpInputs.join('');
    if (fullOtp.length === 6) {
      handleFullOtpEntered(fullOtp);
    }
  };

  const handleFullOtpEntered = (otp) => {
    if (otp === CORRECT_OTP) {
      setOtpStatus('correct');
      setError('');
    } else {
      setOtpStatus('incorrect');
      setError('Incorrect code. Please check and try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otp = otpInputs.join('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setOtpStatus('incorrect');
      return;
    }

    if (otpStatus === 'locked') {
      setError(`Too many attempts. Please wait ${lockoutTimer} seconds.`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await passwordResetService.verifyResetOTP(email, otp);

      setOtpStatus('correct');
      setAttemptsLeft(3);
      navigate('/reset-password', {
        state: {
          email: email,
          otp: otp,
          verified: true,
        },
      });
    } catch (error) {
      setOtpStatus('incorrect');
      setAttemptsLeft((prev) => prev - 1);

      const newAttemptsLeft = attemptsLeft - 1;

      if (newAttemptsLeft <= 0) {
        setOtpStatus('locked');
        setLockoutTimer(60);
        setError(
          `Too many incorrect attempts. Please wait 60 seconds before trying again.`
        );
      } else {
        setError(
          error.message || 'An unexpected error occurred during verification.'
        );
      }
      setOtpInputs(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    setOtpStatus('idle');

    try {
      await passwordResetService.sendResetOTP(email);
      setResendTimer(60);
      setOtpInputs(['', '', '', '', '', '']);
      setAttemptsLeft(3);
      setError('New OTP sent! Please check your email.');
    } catch (error) {
      setError(error.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBorderColorClass = (index) => {
    if (otpStatus === 'correct' && otpInputs.join('').length === 6) {
      return 'border-green-500';
    }
    if (otpStatus === 'incorrect' && otpInputs.join('').length === 6) {
      return 'border-red-500';
    }
    if (otpStatus === 'locked') {
      return 'border-gray-500';
    }
    if (document.activeElement === document.getElementById(`otp-${index}`)) {
      return 'border-blue-500';
    }
    return 'border-gray-600';
  };

  const getBorderColorHex = (index) => {
    const borderColorClass = getBorderColorClass(index);
    if (borderColorClass.includes('green')) return '#22C55E';
    if (borderColorClass.includes('red')) return '#EF4444';
    if (borderColorClass.includes('gray-500')) return '#6B7280';
    if (borderColorClass.includes('blue')) return '#3B82F6';
    return '#4B5563';
  };

  return (
    <div className="min-h-screen bg-[#1C222A] flex items-center justify-center px-4 font-inter">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#2A2E36] p-8 rounded-lg shadow-xl"
        >
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-white hover:text-blue-400 transition-colors mr-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-white text-2xl font-bold">Verify Code</h1>
          </div>

          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-blue-500">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>

          <p className="text-gray-300 text-center mb-2">
            We've sent a verification code to <strong>{email}</strong>. Enter
            the code below to continue.
          </p>

          <p className="text-gray-400 text-center text-sm mb-8">
            This code will expire in 5 minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-4 text-center">
                Enter Verify Code
              </label>

              <div className="flex justify-center space-x-2 mb-4">
                {otpInputs.map((input, index) => (
                  <motion.input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    maxLength="1"
                    className={`w-12 h-12 bg-[#1C222A] text-white text-center text-xl font-bold rounded-lg focus:outline-none transition duration-200 ${getBorderColorClass(index)}`}
                    animate={{ borderColor: getBorderColorHex(index) }}
                    whileHover={{ scale: 1.05 }}
                    whileFocus={{ scale: 1.05 }}
                    disabled={isLoading || otpStatus === 'locked'}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center mb-4">
                  {error}
                  {otpStatus !== 'locked' &&
                    attemptsLeft < 3 &&
                    attemptsLeft > 0 && (
                      <span className="ml-2">
                        ({attemptsLeft} attempts left)
                      </span>
                    )}
                </p>
              )}
              {otpStatus === 'locked' && (
                <p className="text-yellow-400 text-sm text-center mb-4">
                  Please wait {lockoutTimer} seconds before trying again.
                </p>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading || otpStatus === 'locked'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold text-lg"
              >
                {isLoading ? 'Verifying...' : 'CONFIRM'}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || isLoading || otpStatus === 'locked'}
              className="text-purple-400 hover:underline disabled:text-gray-500 font-semibold"
            >
              {resendTimer > 0
                ? `Resend Code in ${resendTimer}s`
                : 'Resend Code'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Remember your password?{' '}
              <a href="/login" className="text-blue-400 hover:underline">
                Back to Login
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
