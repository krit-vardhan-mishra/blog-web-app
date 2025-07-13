import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    document.title = "Reset Password - Blog App";
    
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    // Start resend timer
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [email, navigate, resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!formData.otp) newErrors.otp = "OTP is required";
    else if (formData.otp.length !== 6) newErrors.otp = "OTP must be 6 digits";

    if (!formData.newPassword) newErrors.newPassword = "New password is required";
    else if (!passwordRegex.test(formData.newPassword))
      newErrors.newPassword = "Password must be 8+ chars, include 1 capital letter & 1 symbol";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    else if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await passwordResetService.verifyResetOTP(email, formData.otp);
      setOtpVerified(true);
    } catch (error) {
      setErrors({ otp: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
      await handleVerifyOTP();
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await passwordResetService.resetPassword(email, formData.otp, formData.newPassword);
      navigate('/login', { 
        state: { 
          message: 'Password reset successful! Please login with your new password.' 
        } 
      });
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await passwordResetService.sendResetOTP(email);
      setResendTimer(60);
      setFormData({ ...formData, otp: '' });
      setOtpVerified(false);
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
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-white hover:text-blue-400 transition-colors mr-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-white text-2xl font-bold">Reset Password</h1>
          </div>

          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${otpVerified ? 'bg-green-500' : 'bg-blue-500'}`}>
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>

          <p className="text-gray-300 text-center mb-6">
            Enter the OTP sent to <strong>{email}</strong> and your new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-white font-semibold mb-2">
                OTP Code {otpVerified && <span className="text-green-400">✓ Verified</span>}
              </label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <input
                  type="text"
                  id="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength="6"
                  className={`w-full p-3 bg-[#1C222A] text-white border rounded-lg focus:outline-none transition duration-200 ${
                    otpVerified 
                      ? 'border-green-500 focus:border-green-500' 
                      : 'border-gray-600 focus:border-blue-500 hover:border-white hover:border-2'
                  }`}
                  placeholder="Enter 6-digit OTP"
                  disabled={otpVerified}
                  required
                />
              </motion.div>
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
              
              {!otpVerified && (
                <div className="mt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || isLoading}
                    className="text-blue-400 hover:underline text-sm disabled:text-gray-500"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              )}
            </div>

            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-white font-semibold mb-2">
                New Password
              </label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full p-3 pr-10 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </motion.div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">
                Confirm Password
              </label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 pr-10 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </motion.div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.form && (
              <p className="text-red-500 text-sm text-center">{errors.form}</p>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                {isLoading 
                  ? (otpVerified ? 'Resetting Password...' : 'Verifying OTP...') 
                  : (otpVerified ? 'Reset Password' : 'Verify OTP')
                }
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
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

export default ResetPasswordPage;