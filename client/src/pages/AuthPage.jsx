import { useEffect, useState } from 'react';
import FeaturesSidebar from '../components/FeaturesSidebar';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams, Form } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import authService, { AuthError, handleAuthError } from '../api/authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/auth-page.css';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getBaseURL } from '@/api/apiService';

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const formItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginUser, isAuthLoading, isAuthenticated } = useAuth();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isXLDesktop = useMediaQuery('(min-width: 1280px)');

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
    identifier: '',
    password: '',
  });

  const [signupFormData, setSignupFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    age: '',
  });

  // Get responsive animation variants
  const getAnimationVariants = () => {
    if (isMobile) {
      return {
        loginEnter: { x: '100%', opacity: 0, scale: 0.95 },
        loginVisible: {
          x: 0,
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 20, duration: 0.5 }
        },
        loginExit: {
          x: '-100%',
          opacity: 0,
          scale: 0.95,
          transition: { type: 'spring', stiffness: 260, damping: 20, duration: 0.5 }
        },
        signupEnter: { x: '-100%', opacity: 0, scale: 0.95 },
        signupVisible: {
          x: 0,
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 20, duration: 0.5 }
        },
        signupExit: {
          x: '100%',
          opacity: 0,
          scale: 0.95,
          transition: { type: 'spring', stiffness: 260, damping: 20, duration: 0.5 }
        },
      };
    } else if (isTablet) {
      return {
        loginEnter: { y: '50%', opacity: 0, scale: 0.9 },
        loginVisible: {
          y: 0,
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 280, damping: 25, duration: 0.6 }
        },
        loginExit: {
          y: '-50%',
          opacity: 0,
          scale: 0.9,
          transition: { type: 'spring', stiffness: 280, damping: 25, duration: 0.6 }
        },
        signupEnter: { y: '-50%', opacity: 0, scale: 0.9 },
        signupVisible: {
          y: 0,
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', stiffness: 280, damping: 25, duration: 0.6 }
        },
        signupExit: {
          y: '50%',
          opacity: 0,
          scale: 0.9,
          transition: { type: 'spring', stiffness: 280, damping: 25, duration: 0.6 }
        },
      };
    } else {
      return {
        loginEnter: { y: '100%', opacity: 0 },
        loginVisible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.7 }
        },
        loginExit: {
          y: '-100%',
          opacity: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.7 }
        },
        signupEnter: { y: '-100%', opacity: 0 },
        signupVisible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.7 }
        },
        signupExit: {
          y: '100%',
          opacity: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.7 }
        },
      };
    }
  };

  // Handle route changes
  useEffect(() => {
    const newIsLoginMode = location.pathname === '/login';
    if (newIsLoginMode !== isLoginMode) {
      setIsLoginMode(newIsLoginMode);
      setErrors({});
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
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!loginFormData.identifier) newErrors.identifier = 'Email or Username is required';
    else {
      const isEmail = emailRegex.test(loginFormData.identifier);
      const isUsername = usernameRegex.test(loginFormData.identifier);
      
      if (!isEmail && !isUsername) {
        newErrors.identifier = 'Please enter a valid email or username';
      } else if (isEmail && loginFormData.identifier.length > 254) {
        newErrors.identifier = 'Email is too long';
      } else if (isUsername && (loginFormData.identifier.length < 3 || loginFormData.identifier.length > 30)) {
        newErrors.identifier = 'Username must be 3-30 characters';
      }
    }

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
    if (!signupFormData.username.trim())
      newErrors.username = 'Username is required';
    else if (signupFormData.username.length < 3)
      newErrors.username = 'Username must be at least 3 characters';
    else if (signupFormData.username.length > 30)
      newErrors.username = 'Username must be at most 30 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(signupFormData.username))
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
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
      await login(loginFormData.identifier, loginFormData.password, rememberMe);
    } catch (err) {
      console.error('Login error:', err);

      // Use the new AuthError handling system
      let authError;
      if (err instanceof AuthError) {
        authError = err;
      } else {
        authError = handleAuthError(err);
      }

      // Handle different error types based on status code
      switch (authError.statusCode) {
        case 400:
          // Validation errors
          const message = authError.message;
          if (message.includes('Email or username is required')) {
            setErrors({ identifier: 'Email or username is required' });
          } else if (message.includes('Password is required')) {
            setErrors({ password: 'Password is required' });
          } else {
            setErrors({ 
            loginError: 'Validation error',
            errorDetails: message || 'Please check the form for errors and try again.'
          });
          }
          break;

        case 401:
          // Handle different types of authentication errors
          if (authError.data?.errorType === 'account_not_found') {
            setErrors({ identifier: authError.message || 'No account found with this email/username.' });
          } else if (authError.data?.errorType === 'incorrect_password') {
            setErrors({ password: authError.message || 'Incorrect password. Please try again.' });
          } else {
            // Generic error with full error details
            setErrors({ 
              loginError: 'Authentication failed', 
              errorDetails: authError.message || 'Invalid email/username or password. Please check your credentials and try again.' 
            });
          }
          break;

        case 403:
          // Email verification required
          if (authError.data?.requiresVerification) {
            const email = authError.data.email || loginFormData.identifier;
            navigate('/verify-signup', {
              state: {
                email: email,
                message: 'Please verify your email to complete login. We\'ve sent a new verification code to your email.'
              }
            });
            return;
          }
          setErrors({ 
            loginError: 'Access denied',
            errorDetails: authError.message || 'Your account requires additional verification before access is granted.'
          });
          break;

        case 429:
          // Rate limiting or account lockout
          if (authError.data?.isAccountLocked) {
            const minutes = authError.data.lockoutTime || 25;
            setErrors({
              loginError: `Account temporarily locked`,
              errorDetails: `Too many failed login attempts. Your account is locked for ${minutes} minutes.`
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
              loginError: 'Rate limited',
              errorDetails: authError.message || 'Too many login attempts. Please wait before trying again.'
            });
          }
          break;

        case 404:
          setErrors({ 
            loginError: 'User not found',
            errorDetails: authError.message || 'Please check your email/username and try again.' 
          });
          break;

        case 500:
          setErrors({ 
            loginError: 'Server error',
            errorDetails: authError.message || 'Our servers are experiencing issues. Please try again later.' 
          });
          break;

        default:
          setErrors({ 
            loginError: 'Authentication error', 
            errorDetails: authError.message || 'An unexpected error occurred. Please try again.' 
          });
      }
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
        signupFormData.username,
        signupFormData.email,
        signupFormData.password,
        parseInt(signupFormData.age)
      );
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

      // Handle specific validation errors from API
      if (err.response?.status === 400) {
        const message = err.response?.data?.message || err.message;
        
        if (message.includes('First name is required')) {
          setErrors({ firstName: 'First name is required' });
        } else if (message.includes('Last name is required')) {
          setErrors({ lastName: 'Last name is required' });
        } else if (message.includes('Username is required')) {
          setErrors({ username: 'Username is required' });
        } else if (message.includes('Email is required')) {
          setErrors({ email: 'Email is required' });
        } else if (message.includes('Password is required')) {
          setErrors({ password: 'Password is required' });
        } else if (message.includes('Age is required')) {
          setErrors({ age: 'Age is required' });
        } else if (message.includes('valid email address')) {
          setErrors({ email: 'Please provide a valid email address' });
        } else if (message.includes('Password must be at least 8 characters')) {
          setErrors({ password: 'Password must be at least 8 characters long' });
        } else if (message.includes('valid age between 13 and 120')) {
          setErrors({ age: 'Please provide a valid age between 13 and 120' });
        } else if (message.includes('Username can only contain letters, numbers, and underscores')) {
          setErrors({ username: 'Username can only contain letters, numbers, and underscores' });
        } else if (message.includes('Username must be between 3 and 20 characters')) {
          setErrors({ username: 'Username must be between 3 and 20 characters' });
        } else {
          setErrors({ form: message });
        }
        return;
      }

      // Handle conflict errors (user already exists)
      if (err.response?.status === 409) {
        const message = err.response?.data?.message || err.message;
        
        if (message.includes('email already exists')) {
          setErrors({ email: 'An account with this email already exists. Please login instead.' });
        } else if (message.includes('username is already taken')) {
          setErrors({ username: 'This username is already taken. Please choose a different username.' });
        } else {
          setErrors({ form: message });
        }
        return;
      }

      // Handle rate limiting
      if (err.response?.status === 429) {
        const message = err.response?.data?.message || err.message;
        if (message.includes('Too many OTP requests')) {
          setErrors({ form: 'Too many registration attempts. Please wait 15 minutes before trying again.' });
        } else {
          setErrors({ form: 'Too many requests. Please wait before trying again.' });
        }
        return;
      }

      // Default error handling
      setErrors({ 
        form: err.response?.data?.message || err.message || 'Registration failed. Please try again.' 
      });
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
      <motion.div
        className="min-h-screen bg-gradient-to-br from-[#1C222A] via-[#252B35] to-[#1C222A]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Container */}
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Features Sidebar */}
          <motion.div
            className={`
              ${isMobile ? 'h-auto min-h-[40vh]' :
                isTablet ? 'h-auto min-h-[45vh]' :
                'lg:w-1/2 lg:min-h-screen'}
              w-full
            `}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <FeaturesSidebar />
          </motion.div>

          {/* Auth Forms Container */}
          <motion.div
            className={`
              flex flex-col items-center justify-center
              ${isMobile ? 'px-4 py-6' :
                isTablet ? 'px-6 py-8' :
                'lg:w-1/2 px-8 py-12'}
              w-full bg-gradient-to-t from-[#2A2E36] to-[#323742]
              ${isMobile ? 'min-h-[60vh]' :
                isTablet ? 'min-h-[55vh]' :
                'lg:min-h-screen'}
              relative overflow-hidden
            `}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Blur overlay */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10"></div>

            {/* Loading spinner overlay */}
            <motion.div
              className="relative z-20 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <LoadingSpinner />
              <p className="text-white mt-4 text-lg font-medium">
                {isLoginMode ? 'Logging you in...' : 'Creating your account...'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-[#1C222A] via-[#252B35] to-[#1C222A]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Container */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Features Sidebar */}
        <motion.div 
          className={`
            ${isMobile ? 'h-auto min-h-[40vh]' : 
              isTablet ? 'h-auto min-h-[45vh]' : 
              'lg:w-1/2 lg:min-h-screen'} 
            w-full
          `}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <FeaturesSidebar />
        </motion.div>

        {/* Auth Forms Container */}
        <motion.div 
          className={`
            flex flex-col items-center justify-center 
            ${isMobile ? 'px-4 py-6' : 
              isTablet ? 'px-6 py-8' : 
              'lg:w-1/2 px-8 py-12'} 
            w-full bg-gradient-to-t from-[#2A2E36] to-[#323742] 
            ${isMobile ? 'min-h-[60vh]' : 
              isTablet ? 'min-h-[55vh]' : 
              'lg:min-h-screen'}
            relative overflow-hidden
          `}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className={`
            w-full relative z-10
            ${isMobile ? 'max-w-sm' : 
              isTablet ? 'max-w-md' : 
              'max-w-lg'}
          `}>
            <AnimatePresence mode="wait">
              {isLoginMode ? (
                <motion.div
                  key="login"
                  initial="loginEnter"
                  animate="loginVisible"
                  exit="loginExit"
                  variants={getAnimationVariants()}
                  className="w-full"
                >
                  {/* Header */}
                  <motion.div 
                    className="text-center mb-8"
                    variants={formItemVariants}
                  >
                    <h1 className={`
                      text-white font-bold mb-2
                      ${isMobile ? 'text-xl' : 
                        isTablet ? 'text-2xl' : 
                        'text-3xl'}
                    `}>
                      Welcome Back
                    </h1>
                    <p className={`
                      text-gray-300
                      ${isMobile ? 'text-sm' : 'text-base'}
                    `}>
                      Sign in to your blog space
                    </p>
                  </motion.div>

                  <motion.form
                    className="w-full space-y-6"
                    onSubmit={handleLoginSubmit}
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Email/Username Input */}
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <label
                        className="block text-white font-medium"
                        htmlFor="identifier"
                      >
                        Email or Username
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="text"
                          id="identifier"
                          autoComplete="username"
                          value={loginFormData.identifier}
                          onChange={handleLoginChange}
                          className={`
                            w-full bg-[#1C222A]/80 text-white border border-gray-600/50 rounded-xl
                            focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                            hover:border-gray-400 transition-all duration-300
                            backdrop-blur-sm
                            ${isMobile ? 'p-3 text-base' : 'p-4 text-base'}
                          `}
                          placeholder="Enter your email or username"
                          required
                        />
                        {errors.identifier && (
                          <motion.p 
                            className="text-red-400 text-sm mt-2 font-medium"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {errors.identifier}
                          </motion.p>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Password Input */}
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <label
                        className="block text-white font-medium"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          autoComplete="current-password"
                          value={loginFormData.password}
                          onChange={handleLoginChange}
                          className={`
                            w-full bg-[#1C222A]/80 text-white border border-gray-600/50 rounded-xl
                            focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                            hover:border-gray-400 transition-all duration-300
                            backdrop-blur-sm pr-12
                            ${isMobile ? 'p-3 text-base' : 'p-4 text-base'}
                          `}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                          )}
                        </button>
                        {errors.password && (
                          <motion.p 
                            className="text-red-400 text-sm mt-2 font-medium"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Remember Me & Forgot Password */}
                    <motion.div 
                      variants={formItemVariants} 
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 bg-[#1C222A] border border-gray-600 rounded focus:ring-2 focus:ring-blue-400"
                        />
                        <label htmlFor="remember" className="text-white text-sm">
                          Remember me
                        </label>
                      </div>
                      <motion.a
                        href="/forgot-password"
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        Forgot password?
                      </motion.a>
                    </motion.div>

                    {/* Error Message */}
                    {errors.loginError && (
                      <motion.div
                        variants={formItemVariants}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-col items-center">
                          <p className="text-red-400 text-sm text-center font-medium">
                            {errors.loginError}
                          </p>
                          {errors.errorDetails && (
                            <p className="text-gray-300 text-xs mt-1 italic">
                              {errors.errorDetails}
                            </p>
                          )}
                        </div>
                        {lockoutTimer && (
                          <p className="text-yellow-400 text-sm text-center mt-1">
                            Lockout time: {lockoutTimer}
                          </p>
                        )}
                        {rateLimitTimer && (
                          <p className="text-yellow-400 text-sm text-center mt-1">
                            Try again in: {rateLimitTimer}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Login Button */}
                    <motion.div variants={formItemVariants}>
                      <Button
                        className={`
                          w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                          text-white font-semibold rounded-xl shadow-lg hover:shadow-xl
                          transition-all duration-300 transform hover:scale-[1.02]
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          ${isMobile ? 'py-3' : 'py-4'}
                        `}
                        type="submit"
                        disabled={rateLimitTimer || lockoutTimer}
                      >
                        Sign In
                      </Button>
                    </motion.div>

                    {/* Google Sign-in */}
                    <motion.div variants={formItemVariants}>
                      <Button
                        type="button"
                        className={`
                          w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl
                          border border-gray-300 shadow-lg hover:shadow-xl
                          transition-all duration-300 transform hover:scale-[1.02]
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          ${isMobile ? 'py-3' : 'py-4'}
                        `}
                        disabled={rateLimitTimer || lockoutTimer}
                        onClick={handleGoogleAuth}
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-black">Continue with Google</span>
                      </Button>
                    </motion.div>

                    {/* Switch to Signup */}
                    <motion.div 
                      variants={formItemVariants}
                      className="text-center"
                    >
                      <p className="text-gray-300">
                        Don't have an account?{' '}
                        <motion.button
                          type="button"
                          onClick={switchToSignup}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          whileHover={{ scale: 1.05 }}
                        >
                          Sign up
                        </motion.button>
                      </p>
                    </motion.div>
                  </motion.form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial="signupEnter"
                  animate="signupVisible"
                  exit="signupExit"
                  variants={getAnimationVariants()}
                  className="w-full"
                >
                  {/* Header */}
                  <motion.div 
                    className="text-center mb-8"
                    variants={formItemVariants}
                  >
                    <h1 className={`
                      text-white font-bold mb-2
                      ${isMobile ? 'text-xl' : 
                        isTablet ? 'text-2xl' : 
                        'text-3xl'}
                    `}>
                      Create Account
                    </h1>
                    <p className={`
                      text-gray-300
                      ${isMobile ? 'text-sm' : 'text-base'}
                    `}>
                      Join your blog community today
                    </p>
                  </motion.div>

                  <motion.form
                    className="w-full space-y-5"
                    onSubmit={handleSignupSubmit}
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Name Row - Side by side on larger screens */}
                    <div className={`
                      ${isDesktop ? 'grid grid-cols-2 gap-4' : 'space-y-5'}
                    `}>
                      {/* First Name */}
                      <motion.div variants={formItemVariants} className="space-y-2">
                        <label
                          className="block text-white font-medium text-sm"
                          htmlFor="firstName"
                        >
                          First Name
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="text"
                            id="firstName"
                            autoComplete="given-name"
                            value={signupFormData.firstName}
                            onChange={handleSignupChange}
                            className={`
                              w-full bg-[#1C222A]/80 text-white border border-gray-600/50 rounded-xl
                              focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                              hover:border-gray-400 transition-all duration-300
                              backdrop-blur-sm
                              ${isMobile ? 'p-3 text-base' : 'p-3 text-sm'}
                            `}
                            placeholder="First name"
                            required
                          />
                          {errors.firstName && (
                            <motion.p 
                              className="text-red-400 text-xs mt-1 font-medium"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {errors.firstName}
                            </motion.p>
                          )}
                        </motion.div>
                      </motion.div>

                      {/* Last Name */}
                      <motion.div variants={formItemVariants} className="space-y-2">
                        <label
                          className="block text-white font-medium text-sm"
                          htmlFor="lastName"
                        >
                          Last Name
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="text"
                            id="lastName"
                            autoComplete="family-name"
                            value={signupFormData.lastName}
                            onChange={handleSignupChange}
                            className={`
                              w-full bg-[#1C222A]/80 text-white border border-gray-600/50 rounded-xl
                              focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                              hover:border-gray-400 transition-all duration-300
                              backdrop-blur-sm
                              ${isMobile ? 'p-3 text-base' : 'p-3 text-sm'}
                            `}
                            placeholder="Last name"
                            required
                          />
                          {errors.lastName && (
                            <motion.p 
                              className="text-red-400 text-xs mt-1 font-medium"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {errors.lastName}
                            </motion.p>
                          )}
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Username */}
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <label
                        className="block text-white font-medium text-sm"
                        htmlFor="username"
                      >
                        Username
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="text"
                          id="username"
                          autoComplete="username"
                          value={signupFormData.username}
                          onChange={handleSignupChange}
                          className={`
                            w-full bg-[#1C222A]/80 text-white border border-gray-600/50 rounded-xl
                            focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                            hover:border-gray-400 transition-all duration-300
                            backdrop-blur-sm
                            ${isMobile ? 'p-3 text-base' : 'p-3 text-sm'}
                          `}
                          placeholder="Choose a username"
                          required
                        />
                        {errors.username && (
                          <motion.p 
                            className="text-red-400 text-xs mt-1 font-medium"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {errors.username}
                          </motion.p>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Email & Age Row */}
                    <div className={`
                      ${isDesktop ? 'grid grid-cols-3 gap-4' : 'space-y-5'}
                    `}>
                      {/* Email */}
                      <motion.div variants={formItemVariants} className={`
                        space-y-2 ${isDesktop ? 'col-span-2' : ''}
                      `}>
                        <label
                          className="block text-white font-medium text-sm"
                          htmlFor="email"
                        >
                          Email Address
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="email"
                            id="email"
                            autoComplete="email"
                            value={signupFormData.email}
                            onChange={handleSignupChange}
                            className={`
                              w-full bg-[#1C222A]/80 text-white border border-gray-600/50 rounded-xl
                              focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                              hover:border-gray-400 transition-all duration-300
                              backdrop-blur-sm
                              ${isMobile ? 'p-3 text-base' : 'p-3 text-sm'}
                            `}
                            placeholder="Enter your email"
                            required
                          />
                          {errors.email && (
                            <motion.p 
                              className="text-red-400 text-xs mt-1 font-medium"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {errors.email}
                            </motion.p>
                          )}
                        </motion.div>
                      </motion.div>

                      {/* Age */}
                      <motion.div variants={formItemVariants} className="space-y-2">
                        <label
                          className="block text-white font-medium text-sm"
                          htmlFor="age"
                        >
                          Age
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="number"
                            id="age"
                            min="1"
                            value={signupFormData.age}
                            onChange={handleSignupChange}
                            className={`
                              w-full bg-[#1C222A]/80 text-white border border-gray-600/50 rounded-xl
                              focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                              hover:border-gray-400 transition-all duration-300
                              backdrop-blur-sm
                              ${isMobile ? 'p-3 text-base' : 'p-3 text-sm'}
                            `}
                            placeholder="Age"
                            required
                          />
                          {errors.age && (
                            <motion.p 
                              className="text-red-400 text-xs mt-1 font-medium"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {errors.age}
                            </motion.p>
                          )}
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Password */}
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <label
                        className="block text-white font-medium text-sm"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          autoComplete="new-password"
                          value={signupFormData.password}
                          onChange={handleSignupChange}
                          className={`
                            w-full bg-[#1C222A]/80 text-white border border-gray-600/50 rounded-xl
                            focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                            hover:border-gray-400 transition-all duration-300
                            backdrop-blur-sm pr-12
                            ${isMobile ? 'p-3 text-base' : 'p-3 text-sm'}
                          `}
                          placeholder="Create a password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
                          )}
                        </button>
                        {errors.password && (
                          <motion.p 
                            className="text-red-400 text-xs mt-1 font-medium"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Remember Me */}
                    <motion.div 
                      variants={formItemVariants} 
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 bg-[#1C222A] border border-gray-600 rounded focus:ring-2 focus:ring-blue-400"
                      />
                      <label htmlFor="remember" className="text-white text-sm">
                        Remember me
                      </label>
                    </motion.div>

                    {/* Error Message */}
                    {errors.form && (
                      <motion.div
                        variants={formItemVariants}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-red-400 text-sm text-center font-medium">
                          {errors.form}
                        </p>
                        {errors.form.includes('Please try logging in') && (
                          <motion.button
                            type="button"
                            onClick={switchToLogin}
                            className="text-blue-400 hover:text-blue-300 text-sm mt-2 block mx-auto transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            Go to Login Page
                          </motion.button>
                        )}
                      </motion.div>
                    )}

                    {/* Signup Button */}
                    <motion.div variants={formItemVariants}>
                      <Button
                        className={`
                          w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
                          text-white font-semibold rounded-xl shadow-lg hover:shadow-xl
                          transition-all duration-300 transform hover:scale-[1.02]
                          ${isMobile ? 'py-3' : 'py-4'}
                        `}
                        type="submit"
                      >
                        Create Account
                      </Button>
                    </motion.div>

                    {/* Google Sign-up */}
                    <motion.div variants={formItemVariants}>
                      <Button
                        type="button"
                        className={`
                          w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl
                          border border-gray-300 shadow-lg hover:shadow-xl
                          transition-all duration-300 transform hover:scale-[1.02]
                          ${isMobile ? 'py-3' : 'py-4'}
                        `}
                        onClick={handleGoogleAuth}
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-black">Continue with Google</span>
                      </Button>
                    </motion.div>

                    {/* Switch to Login */}
                    <motion.div 
                      variants={formItemVariants}
                      className="text-center"
                    >
                      <p className="text-gray-300">
                        Already have an account?{' '}
                        <motion.button
                          type="button"
                          onClick={switchToLogin}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          whileHover={{ scale: 1.05 }}
                        >
                          Sign in
                        </motion.button>
                      </p>
                    </motion.div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthPage;