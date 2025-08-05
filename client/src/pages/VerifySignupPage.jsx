import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import authService from '../api/authService';
import { useAuth } from '../context/AuthContext';

export const VerifySignupPage = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(60);
  const { state } = useLocation();
  const email = state?.email;
  const message = state?.message;
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    if (!email) navigate('/signup');

    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [email, navigate, resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const response = await authService.verifySignup(email, otp);
      
      const isRemembered = localStorage.getItem('token') !== null;
      
      loginUser({ token: response.token, user: response.user }, isRemembered);
      
      navigate('/home');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      await authService.resendOTP(email, 'signup');
      setResendTimer(60);
      setErrors({ success: 'New OTP sent to your email!' });
      
      setTimeout(() => {
        setErrors({});
      }, 3000);
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C222A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#2A2E36] p-8 rounded-lg shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/signup')}
              className="text-white hover:text-blue-400 transition-colors mr-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-white text-2xl font-bold">Verify Your Email</h1>
          </div>

          {/* Shield Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-blue-500">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Custom message from login flow or default message */}
          {message ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-blue-300 text-sm">{message}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-center mb-6">
              Enter the OTP sent to <strong>{email}</strong> to verify your
              account.
            </p>
          )}

          {/* Success message for resend */}
          {errors.success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm text-center">{errors.success}</p>
            </div>
          )}

          {/* OTP Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block text-white font-semibold mb-2"
              >
                OTP Code
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200 text-center text-lg font-mono tracking-widest"
                  required
                  disabled={isLoading}
                />
              </motion.div>
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}

              {/* Resend Button */}
              <div className="mt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-blue-400 hover:underline text-sm disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : 'Resend OTP'}
                </button>
                
                {resendTimer > 0 && (
                  <span className="text-gray-400 text-xs">
                    Please wait {resendTimer}s
                  </span>
                )}
              </div>
            </div>

            {errors.form && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{errors.form}</p>
              </div>
            )}

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                <span className={isLoading ? 'invisible' : ''}>
                  Verify OTP
                </span>
                {isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Navigation Links */}
          <div className="mt-6 space-y-2 text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resendTimer > 0 || isLoading}
                className="text-blue-400 hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Send again
              </button>
            </p>
            
            <p className="text-gray-400 text-sm">
              Already verified?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:underline"
              >
                Login here
              </button>
            </p>
            
            <p className="text-gray-400 text-sm">
              Wrong email?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-400 hover:underline"
              >
                Change email
              </button>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-3 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-xs text-center">
              <strong>Note:</strong> The OTP will expire in 5 minutes. Make sure to check your spam folder if you don't see the email.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifySignupPage;