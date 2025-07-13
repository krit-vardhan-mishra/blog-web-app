import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../api/authService';

export const ResendVerificationPage = () => {
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authService.resendOTP(email, 'signup');
      setMessage('Verification email sent successfully');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C222A] flex items-center justify-center">
      {/* Simple form with email input and resend button */}
    </div>
  );
};