import { useEffect, useState } from 'react';
import FeaturesSidebar from '../components/FeaturesSidebar';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import authService from '../api/authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/auth-page.css';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getBaseURL } from '@/api/apiService';

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginUser, isAuthLoading, isAuthenticated } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1280px)'); // xl breakpoint
  
  // Determine initial mode based on route
  const [isLoginMode, setIsLoginMode] = useState(location.pathname === '/login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [lockoutTimer, setLockoutTimer] = useState(null);
  const [rateLimitTimer, setRateLimitTimer] = useState(null);

  // Form data for both login and signup
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: '',
  });

  const [signupFormData, setSignupFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
  });

  // Get animation variants based on screen size
  const getAnimationVariants = () => {
    if (isDesktop) {
      return {
        loginEnter: { y: '100%', opacity: 0 },
        loginVisible: { 
          y: 0, 
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }
        },
        loginExit: { 
          y: '-100%', 
          opacity: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }
        },
        signupEnter: { y: '-100%', opacity: 0 },
        signupVisible: { 
          y: 0, 
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }
        },
        signupExit: { 
          y: '100%', 
          opacity: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }
        },
      };
    } else {
      return {
        loginEnter: { x: '100%', opacity: 0 },
        loginVisible: { 
          x: 0, 
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }
        },
        loginExit: { 
          x: '-100%', 
          opacity: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }
        },
        signupEnter: { x: '-100%', opacity: 0 },
        signupVisible: { 
          x: 0, 
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }
        },
        signupExit: { 
          x: '100%', 
          opacity: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.6 }
        },
      };
    }
  };

  // Handle route changes
  useEffect(() => {
    const newIsLoginMode = location.pathname === '/login';
    if (newIsLoginMode !== isLoginMode) {
      setIsLoginMode(newIsLoginMode);
      // Clear errors when switching modes
      setErrors({});
      // Clear timers when switching modes
      setLockoutTimer(null);
      setRateLimitTimer(null);
    }
  }, [location.pathname, isLoginMode]);

  // Handle Google signup error from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = 'Google sign-up failed. Please try again.';

      switch (error) {
        case 'auth_failed':
          errorMessage = 'Google authentication failed. Please try again.';
          break;
        case 'no_user':
          errorMessage = 'Could not retrieve user information from Google.';
          break;
        case 'token_generation_failed':
          errorMessage = 'Failed to create your session. Please try again.';
          break;
        default:
          errorMessage = 'Google sign-up failed. Please try again.';
      }

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }, [searchParams]);

  // Clear form errors after timeout
  useEffect(() => {
    if (errors.form || errors.loginError) {
      const timer = setTimeout(() => {
        setErrors((prevErrors) => ({ 
          ...prevErrors, 
          form: '', 
          loginError: '' 
        }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors.form, errors.loginError]);

  // Set document title and handle authentication
  useEffect(() => {
    document.title = isLoginMode ? 'Login - Blog App' : 'Signup - Blog App';

    if (!isAuthLoading) {
      if (isAuthenticated) {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, isAuthLoading, navigate, isLoginMode]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginChange = (e) => {
    setLoginFormData({ ...loginFormData, [e.target.id]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupFormData({ ...signupFormData, [e.target.id]: e.target.value });
  };

  const validateLogin = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!loginFormData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(loginFormData.email))
      newErrors.email = 'Invalid email format';

    if (!loginFormData.password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(loginFormData.password))
      newErrors.password =
        'Password must be 8+ chars, include 1 capital letter & 1 symbol';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!signupFormData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!signupFormData.lastName.trim()) 
      newErrors.lastName = 'Last name is required';
    if (!signupFormData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(signupFormData.email))
      newErrors.email = 'Invalid email format';
    if (!signupFormData.password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(signupFormData.password))
      newErrors.password =
        'Password must be 8+ chars, include 1 capital letter & 1 symbol';
    if (!signupFormData.age) newErrors.age = 'Age is required';
    else if (isNaN(signupFormData.age) || signupFormData.age <= 0)
      newErrors.age = 'Age must be a positive number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(loginFormData.email, loginFormData.password, rememberMe);
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle email verification required scenario
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        const email = err.response.data.email || loginFormData.email;
        navigate('/verify-signup', { 
          state: { 
            email: email,
            message: 'Please verify your email to complete login. We\'ve sent a new verification code to your email.'
          } 
        });
        return;
      }
      
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
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    try {
      setIsSubmitting(true);
      const data = await authService.register(
        signupFormData.firstName,
        signupFormData.lastName,
        signupFormData.email,
        signupFormData.password,
        parseInt(signupFormData.age)
      );
      loginUser(data, rememberMe);
      navigate('/verify-signup', { state: { email: signupFormData.email } });
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle case where user exists but email not verified
      if (err.response?.status === 409 && err.response?.data?.requiresLogin) {
        setErrors({ 
          form: err.response.data.message + ' Click below to go to login page.' 
        });
        return;
      }
      
      setErrors({ form: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    // Clear any previous error from URL
    navigate(isLoginMode ? '/login' : '/signup', { replace: true });
    const googleAuthUrl = `${getBaseURL()}/api/auth/google`;
    window.location.href = googleAuthUrl;
  };

  const switchToSignup = () => {
    navigate('/signup', { replace: true });
  };

  const switchToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Show loading spinner only when submitting
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-[#1C222A] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4 text-lg">
            {isLoginMode ? 'Logging you in...' : 'Creating your account...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C222A] flex flex-col xl:flex-row auth-page">
      {/* Features Sidebar - Always visible, never moves */}
      <div className="xl:w-1/2 w-full xl:min-h-screen">
        <FeaturesSidebar />
      </div>

      {/* Forms Container - Bottom on mobile/tablet, Right on desktop */}
      <div className="flex flex-col items-center justify-center xl:w-1/2 w-full bg-[#2A2E36] px-4 py-8 xl:py-0 relative auth-container">
        <div className="w-full max-w-md xl:max-w-lg relative auth-form-container">
          <AnimatePresence mode="wait">
            {isLoginMode ? (
              <motion.div
                key="login"
                initial={isDesktop ? "loginEnter" : "loginEnter"}
                animate={isDesktop ? "loginVisible" : "loginVisible"}
                exit={isDesktop ? "loginExit" : "loginExit"}
                variants={getAnimationVariants()}
                className="w-full"
              >
                <p className="text-white text-2xl xl:text-3xl font-bold mb-6 xl:mb-8 text-center">
                  Welcome to Your Blog Space
                </p>
                <h1 className="text-white text-3xl xl:text-4xl font-bold mb-8 xl:mb-10 text-center">
                  Login Here
                </h1>

                <form className="w-full space-y-6" onSubmit={handleLoginSubmit}>
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
                        value={loginFormData.email}
                        onChange={handleLoginChange}
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
                          value={loginFormData.password}
                          onChange={handleLoginChange}
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
                          rateLimitTimer || lockoutTimer ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                        type="submit"
                        disabled={rateLimitTimer || lockoutTimer}
                      >
                        Log in
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
                      onClick={handleGoogleAuth}
                    >
                      Sign in with Google
                    </Button>
                  </motion.div>
                </div>

                <p className="text-white mt-6 text-center">
                  Don't have an account?{' '}
                  <button 
                    onClick={switchToSignup}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={isDesktop ? "signupEnter" : "signupEnter"}
                animate={isDesktop ? "signupVisible" : "signupVisible"}
                exit={isDesktop ? "signupExit" : "signupExit"}
                variants={getAnimationVariants()}
                className="w-full"
              >
                <p className="text-white text-2xl xl:text-3xl font-bold mb-6 xl:mb-8 text-center">
                  Welcome to Your Blog Space
                </p>
                <h1 className="text-white text-3xl xl:text-4xl font-bold mb-8 xl:mb-10 text-center">
                  Sign up Here
                </h1>

                <form className="w-full space-y-6" onSubmit={handleSignupSubmit}>
                  {/* First Name */}
                  <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-center space-y-2 xl:space-y-0">
                    <label
                      className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
                      htmlFor="firstName"
                    >
                      <b>First Name:</b>
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="xl:col-span-3 w-full"
                    >
                      <input
                        type="text"
                        id="firstName"
                        autoComplete="given-name"
                        value={signupFormData.firstName}
                        onChange={handleSignupChange}
                        className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                        placeholder="Enter your first name"
                        required
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-center space-y-2 xl:space-y-0">
                    <label
                      className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
                      htmlFor="lastName"
                    >
                      <b>Last Name:</b>
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="xl:col-span-3 w-full"
                    >
                      <input
                        type="text"
                        id="lastName"
                        autoComplete="family-name"
                        value={signupFormData.lastName}
                        onChange={handleSignupChange}
                        className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                        placeholder="Enter your last name"
                        required
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Email */}
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
                        value={signupFormData.email}
                        onChange={handleSignupChange}
                        className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                        placeholder="Enter your email"
                        required
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Age */}
                  <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-center space-y-2 xl:space-y-0">
                    <label
                      className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
                      htmlFor="age"
                    >
                      <b>Age:</b>
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="xl:col-span-3 w-full"
                    >
                      <input
                        type="number"
                        id="age"
                        min="1"
                        value={signupFormData.age}
                        onChange={handleSignupChange}
                        className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                        placeholder="Enter your age"
                        required
                      />
                      {errors.age && (
                        <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Password */}
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
                          autoComplete="new-password"
                          value={signupFormData.password}
                          onChange={handleSignupChange}
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
                  <div className="flex justify-center space-x-3">
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

                  {errors.form && (
                    <div className="signup-error">
                      <p className="text-red-500 text-sm mt-1 mb-2 text-center">
                        {errors.form}
                      </p>
                      {errors.form.includes('Please try logging in') && (
                        <div className="text-center mt-2">
                          <button
                            type="button"
                            onClick={switchToLogin}
                            className="text-blue-400 hover:underline text-sm"
                          >
                            Go to Login Page
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Signup Button */}
                  <div className="flex justify-center mt-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                        type="submit"
                      >
                        Sign up
                      </Button>
                    </motion.div>
                  </div>
                </form>

                <div className="flex justify-center mt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                      onClick={handleGoogleAuth}
                    >
                      Sign up with Google
                    </Button>
                  </motion.div>
                </div>

                <p className="text-white mt-6 text-center">
                  Already have an account?{' '}
                  <button 
                    onClick={switchToLogin}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Log in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;