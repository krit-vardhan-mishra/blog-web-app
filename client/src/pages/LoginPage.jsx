import { useEffect, useState } from 'react';
import FeaturesSidebar from '../components/FeaturesSidebar';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBaseURL } from '../api/apiService';

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const { login, user, token, isAuthLoading, isAuthenticated } = useAuth();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (errors.form) {
      const timer = setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, form: '' }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors.form]);

  useEffect(() => {
    document.title = 'Login - Blog App';

    if (!isAuthLoading) {
      if (isAuthenticated) {
        navigate('/home', { replace: true });
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(formData.password))
      newErrors.password =
        'Password must be 8+ chars, include 1 capital letter & 1 symbol';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [lockoutTimer, setLockoutTimer] = useState(null);
  const [rateLimitTimer, setRateLimitTimer] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password, rememberMe);
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 429) {
        const message = err.response?.data?.message || err.message;
        
        if (message.includes('Account temporarily locked')) {
          const minutes = message.match(/\d+/)?.[0] || 25;
          setErrors({
            loginError: `Account temporarily locked due to too many failed attempts. Please try again after ${minutes} minutes.`
          });
          
          let timeLeft = minutes * 60;
          const timer = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
              clearInterval(timer);
              setErrors({});
              setLockoutTimer(null);
            } else {
              const minutesLeft = Math.floor(timeLeft / 60);
              const secondsLeft = timeLeft % 60;
              setLockoutTimer(`${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`);
            }
          }, 1000);
        } else {
          setErrors({
            loginError: 'Too many login attempts. Please wait 15 minutes before trying again.'
          });
          
          let timeLeft = 15 * 60;
          const timer = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
              clearInterval(timer);
              setErrors({});
              setRateLimitTimer(null);
            } else {
              const minutesLeft = Math.floor(timeLeft / 60);
              const secondsLeft = timeLeft % 60;
              setRateLimitTimer(`${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`);
            }
          }, 1000);
        }
        return;
      }
      
      if (err.isAccountLocked) {
        const minutes = err.lockoutTime || 25;
        setErrors({
          loginError: `Account temporarily locked due to too many failed attempts. Please try again after ${minutes} minutes.`
        });
        
        let timeLeft = minutes * 60;
        const timer = setInterval(() => {
          timeLeft -= 1;
          if (timeLeft <= 0) {
            clearInterval(timer);
            setErrors({});
            setLockoutTimer(null);
          } else {
            const minutesLeft = Math.floor(timeLeft / 60);
            const secondsLeft = timeLeft % 60;
            setLockoutTimer(`${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`);
          }
        }, 1000);
        
        return;
      }
      
      setErrors({
        loginError: err.message || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#1C222A] flex flex-col xl:flex-row">
      {/* Features Sidebar - Top on mobile/tablet, Left on desktop */}
      <div className="xl:w-1/2 w-full xl:min-h-screen">
        <FeaturesSidebar />
      </div>

      {/* Login Form - Bottom on mobile/tablet, Right on desktop */}
      <div className="flex flex-col items-center justify-center xl:w-1/2 w-full bg-[#2A2E36] px-4 py-8 xl:py-0">
        <div className="w-full max-w-md xl:max-w-lg">
          <p className="text-white text-2xl xl:text-3xl font-bold mb-6 xl:mb-8 text-center">
            Welcome to Your Blog Space
          </p>
          <h1 className="text-white text-3xl xl:text-4xl font-bold mb-8 xl:mb-10 text-center">
            Login Here
          </h1>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-center space-y-2 xl:space-y-0">
              <label
                className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
                htmlFor="email"
              >
                <b>Email:</b>
              </label>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="xl:col-span-3 w-full"
              >
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </motion.div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-start space-y-2 xl:space-y-0">
              <label
                className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110 xl:pt-3"
                htmlFor="password"
              >
                <b>Password:</b>
              </label>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="xl:col-span-3 w-full"
              >
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 pr-10 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                    )}
                  </div>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </motion.div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 bg-[#1C222A] border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-white hover:border-2 transition duration-200"
                />
                <label htmlFor="remember" className="text-white">
                  <b>Remember Me</b>
                </label>
              </div>
            </div>

            {/* Login Error Message */}
            {errors.loginError && (
              <div className="flex flex-col items-center justify-center space-y-2">
                <p className="text-red-500 text-sm font-medium text-center">
                  {errors.loginError}
                </p>
                {lockoutTimer && (
                  <p className="text-yellow-500 text-sm font-medium">
                    Account lockout time remaining: {lockoutTimer}
                  </p>
                )}
                {rateLimitTimer && (
                  <p className="text-yellow-500 text-sm font-medium">
                    Rate limit time remaining: {rateLimitTimer}
                  </p>
                )}
              </div>
            )}

            {/* Email Verification Error */}
            {errors.loginError?.includes('Email not verified') && (
              <div className="text-center mt-2">
                <button
                  onClick={() =>
                    navigate('/resend-verification', {
                      state: { email: formData.email },
                    })
                  }
                  className="text-blue-400 hover:underline"
                >
                  Resend verification email
                </button>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="flex justify-center">
              <a
                href="/forgot-password"
                className="text-blue-400 hover:underline text-sm"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <div className="flex justify-center mt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={`bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto relative min-w-[120px] ${
                    isLoading || rateLimitTimer || lockoutTimer ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                  type="submit"
                  disabled={isLoading || rateLimitTimer || lockoutTimer}
                >
                  <span className={isLoading ? 'invisible' : ''}>Log in</span>
                  {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      Logging in...
                    </span>
                  )}
                </Button>
              </motion.div>
            </div>  
          </form>

          {/* Google Sign-in Button */}
          <div className="flex justify-center mt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className={`bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto ${
                  rateLimitTimer || lockoutTimer ? 'cursor-not-allowed opacity-75' : ''
                }`}
                disabled={rateLimitTimer || lockoutTimer}
                onClick={() => {
                  const googleAuthUrl = `${getBaseURL()}/api/auth/google`;
                  window.location.href = googleAuthUrl;
                }}
              >
                Sign in with Google
              </Button>
            </motion.div>
          </div>

          <p className="text-white mt-6 text-center">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-400 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;