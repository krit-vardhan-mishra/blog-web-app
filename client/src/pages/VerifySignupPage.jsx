import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import authService from '../api/authService';

export const VerifySignupPage = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(60);
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) navigate('/signup');

    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [email, navigate, resendTimer]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUserJSON = localStorage.getItem('user') || sessionStorage.getItem('user');
    const storedUser = storedUserJSON ? JSON.parse(storedUserJSON) : null;

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

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
      // Check if token was stored in localStorage or sessionStorage to maintain consistency
      const isRemembered = localStorage.getItem('token') !== null;
      
      if (isRemembered) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
      }
      navigate('/home');
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authService.resendOTP(email, 'signup');
      setResendTimer(60);
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

          <p className="text-gray-300 text-center mb-6">
            Enter the OTP sent to <strong>{email}</strong> to verify your
            account.
          </p>

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
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                  required
                />
              </motion.div>
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}

              {/* Resend Button */}
              <div className="mt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-blue-400 hover:underline text-sm disabled:text-gray-500"
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : 'Resend OTP'}
                </button>
              </div>
            </div>

            {errors.form && (
              <p className="text-red-500 text-sm text-center">{errors.form}</p>
            )}

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </motion.div>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already verified?{' '}
              <a href="/login" className="text-blue-400 hover:underline">
                Login
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifySignupPage;
